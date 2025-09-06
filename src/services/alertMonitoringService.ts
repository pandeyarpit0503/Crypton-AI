import { alertService } from './alertService';
import { notificationService } from './notificationService';
import { 
  Alert, 
  PriceThresholdAlert, 
  PercentageChangeAlert, 
  TrendSignalAlert, 
  PortfolioChangeAlert,
  MarketCondition,
  TrendDirection
} from '@/types/alerts';

class AlertMonitoringService {
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 60000; // Check every minute
  private marketData: Map<string, MarketCondition> = new Map();

  // Start monitoring alerts
  startMonitoring(): void {
    if (this.isMonitoring) {
      console.log('⚠️ Alert monitoring already running');
      return;
    }

    this.isMonitoring = true;
    console.log('🚀 Starting alert monitoring service...');

    // Initial check
    this.checkAllAlerts();

    // Set up periodic checking
    this.monitoringInterval = setInterval(() => {
      this.checkAllAlerts();
    }, this.CHECK_INTERVAL);
  }

  // Stop monitoring alerts
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('🛑 Alert monitoring service stopped');
  }

  // Check all active alerts
  private async checkAllAlerts(): Promise<void> {
    try {
      console.log('🔍 Checking alerts...');
      
      // Update market data first
      await this.updateMarketData();

      // Get all active alerts from all users (in a real app, you'd batch this)
      // For now, we'll check alerts for the current user context
      const userId = this.getCurrentUserId();
      if (!userId) return;

      const alerts = await alertService.getUserAlerts(userId, {
        status: ['active'],
        isEnabled: true
      });

      console.log(`📊 Checking ${alerts.length} active alerts`);

      // Check each alert
      for (const alert of alerts) {
        await this.checkAlert(alert);
      }

    } catch (error) {
      console.error('❌ Error checking alerts:', error);
    }
  }

  // Check individual alert
  private async checkAlert(alert: Alert): Promise<void> {
    try {
      switch (alert.type) {
        case 'price_threshold':
          await this.checkPriceThresholdAlert(alert as PriceThresholdAlert);
          break;
        case 'percentage_change':
          await this.checkPercentageChangeAlert(alert as PercentageChangeAlert);
          break;
        case 'trend_signal':
          await this.checkTrendSignalAlert(alert as TrendSignalAlert);
          break;
        case 'portfolio_change':
          await this.checkPortfolioChangeAlert(alert as PortfolioChangeAlert);
          break;
      }
    } catch (error) {
      console.error(`❌ Error checking alert ${alert.name}:`, error);
    }
  }

  // Check price threshold alert
  private async checkPriceThresholdAlert(alert: PriceThresholdAlert): Promise<void> {
    const marketCondition = this.marketData.get(alert.coinId);
    if (!marketCondition) return;

    const currentPrice = marketCondition.currentPrice;
    const targetPrice = alert.targetPrice;
    let shouldTrigger = false;
    let message = '';

    switch (alert.condition) {
      case 'above':
        shouldTrigger = currentPrice > targetPrice;
        message = `🚀 ${alert.coinSymbol} just broke $${targetPrice.toLocaleString()} — now at $${currentPrice.toLocaleString()}!`;
        break;
      case 'below':
        shouldTrigger = currentPrice < targetPrice;
        message = `⚠️ ${alert.coinSymbol} dropped below $${targetPrice.toLocaleString()} — now at $${currentPrice.toLocaleString()}`;
        break;
      case 'crosses_above':
        // Check if price crossed above (was below, now above)
        shouldTrigger = currentPrice > targetPrice && (alert.currentPrice || 0) <= targetPrice;
        message = `📈 ${alert.coinSymbol} crossed above $${targetPrice.toLocaleString()} — strong bullish signal!`;
        break;
      case 'crosses_below':
        // Check if price crossed below (was above, now below)
        shouldTrigger = currentPrice < targetPrice && (alert.currentPrice || Infinity) >= targetPrice;
        message = `📉 ${alert.coinSymbol} crossed below $${targetPrice.toLocaleString()} — bearish signal detected`;
        break;
    }

    if (shouldTrigger) {
      await this.triggerAlert(alert, currentPrice, message, {
        currentPrice,
        targetPrice,
        condition: alert.condition,
        coinData: marketCondition
      });
    }

    // Update current price for next check
    await alertService.updateAlert(alert.id, alert.userId, { currentPrice });
  }

  // Check percentage change alert
  private async checkPercentageChangeAlert(alert: PercentageChangeAlert): Promise<void> {
    const marketCondition = this.marketData.get(alert.coinId);
    if (!marketCondition) return;

    let currentChange = 0;
    let timeframeName = '';

    switch (alert.timeframe) {
      case '1h':
        // For 1h, we'd need additional API data
        currentChange = 0; // Placeholder
        timeframeName = '1 hour';
        break;
      case '24h':
        currentChange = marketCondition.priceChangePercentage24h;
        timeframeName = '24 hours';
        break;
      case '7d':
        currentChange = marketCondition.priceChangePercentage7d;
        timeframeName = '7 days';
        break;
      case '30d':
        currentChange = marketCondition.priceChangePercentage30d;
        timeframeName = '30 days';
        break;
    }

    let shouldTrigger = false;
    let message = '';

    if (alert.condition === 'above' && Math.abs(currentChange) > alert.targetPercentage) {
      shouldTrigger = true;
      const direction = currentChange > 0 ? 'up' : 'down';
      const emoji = currentChange > 0 ? '🚀' : '⚠️';
      message = `${emoji} ${alert.coinSymbol} is ${direction} ${Math.abs(currentChange).toFixed(2)}% in the last ${timeframeName} — high volatility detected!`;
    } else if (alert.condition === 'below' && Math.abs(currentChange) < alert.targetPercentage) {
      shouldTrigger = true;
      message = `📊 ${alert.coinSymbol} volatility is low (${Math.abs(currentChange).toFixed(2)}%) in the last ${timeframeName}`;
    }

    if (shouldTrigger) {
      await this.triggerAlert(alert, currentChange, message, {
        currentChange,
        targetPercentage: alert.targetPercentage,
        timeframe: alert.timeframe,
        coinData: marketCondition
      });
    }

    // Update current change for next check
    await alertService.updateAlert(alert.id, alert.userId, { currentChange });
  }

  // Check trend signal alert
  private async checkTrendSignalAlert(alert: TrendSignalAlert): Promise<void> {
    const marketCondition = this.marketData.get(alert.coinId);
    if (!marketCondition) return;

    // Simple trend detection based on price changes
    const currentTrend = this.detectTrend(marketCondition);
    
    if (currentTrend === alert.targetTrend && currentTrend !== alert.currentTrend) {
      const emoji = currentTrend === 'bullish' ? '📈' : currentTrend === 'bearish' ? '📉' : '➡️';
      const message = `${emoji} ${alert.coinSymbol} trend just turned ${currentTrend} — signal detected!`;
      
      await this.triggerAlert(alert, 1, message, {
        currentTrend,
        targetTrend: alert.targetTrend,
        indicators: alert.indicators,
        coinData: marketCondition
      });
    }

    // Update current trend
    await alertService.updateAlert(alert.id, alert.userId, { currentTrend });
  }

  // Check portfolio change alert
  private async checkPortfolioChangeAlert(alert: PortfolioChangeAlert): Promise<void> {
    // This would integrate with your portfolio service
    // For now, we'll simulate portfolio change detection
    const portfolioChange = await this.calculatePortfolioChange(alert.userId, alert.timeframe);
    
    let shouldTrigger = false;
    let message = '';

    if (alert.condition === 'above' && portfolioChange > alert.targetPercentage) {
      shouldTrigger = true;
      message = `🎉 Your portfolio is up ${portfolioChange.toFixed(2)}% in the last ${alert.timeframe}!`;
    } else if (alert.condition === 'below' && portfolioChange < alert.targetPercentage) {
      shouldTrigger = true;
      message = `⚠️ Your portfolio dropped ${Math.abs(portfolioChange).toFixed(2)}% in the last ${alert.timeframe}`;
    }

    if (shouldTrigger) {
      await this.triggerAlert(alert, portfolioChange, message, {
        portfolioChange,
        targetPercentage: alert.targetPercentage,
        timeframe: alert.timeframe
      });
    }

    // Update current change
    await alertService.updateAlert(alert.id, alert.userId, { currentChange: portfolioChange });
  }

  // Trigger an alert
  private async triggerAlert(alert: Alert, triggerValue: number, message: string, metadata: Record<string, any>): Promise<void> {
    try {
      // Record the trigger
      await alertService.recordAlertTrigger(alert.id, triggerValue, message, metadata);

      // Send notification
      await this.sendNotification(alert, message);

      console.log(`🚨 Alert triggered: ${alert.name} - ${message}`);
    } catch (error) {
      console.error('❌ Error triggering alert:', error);
    }
  }

  // Send notification using notification service
  private async sendNotification(alert: Alert, message: string): Promise<void> {
    try {
      let coinSymbol: string | undefined;
      let value: number | undefined;
      let condition: string | undefined;

      // Extract alert-specific data
      if ('coinSymbol' in alert) {
        coinSymbol = alert.coinSymbol;
      }
      if ('targetPrice' in alert) {
        value = alert.targetPrice;
        condition = alert.condition;
      } else if ('targetPercentage' in alert) {
        value = alert.targetPercentage;
        condition = alert.condition;
      } else if ('currentChange' in alert) {
        value = alert.currentChange;
      }

      // Send smart alert notification
      await notificationService.sendSmartAlert(
        alert.type,
        alert.name,
        coinSymbol,
        value,
        condition,
        {
          priority: alert.priority,
          actionUrl: '/alerts',
          data: { alertId: alert.id, alertType: alert.type }
        }
      );
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Update market data from API
  private async updateMarketData(): Promise<void> {
    try {
      // This would fetch from your existing market data API
      // For now, we'll use placeholder data
      const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d%2C30d');
      const data = await response.json();

      data.forEach((coin: any) => {
        const marketCondition: MarketCondition = {
          coinId: coin.id,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          currentPrice: coin.current_price,
          priceChange24h: coin.price_change_24h,
          priceChangePercentage24h: coin.price_change_percentage_24h,
          priceChangePercentage7d: coin.price_change_percentage_7d_in_currency || 0,
          priceChangePercentage30d: coin.price_change_percentage_30d_in_currency || 0,
          marketCap: coin.market_cap,
          volume24h: coin.total_volume,
          lastUpdated: new Date().toISOString(),
          trend: this.detectTrend({
            priceChangePercentage24h: coin.price_change_percentage_24h,
            priceChangePercentage7d: coin.price_change_percentage_7d_in_currency || 0
          } as MarketCondition)
        };

        this.marketData.set(coin.id, marketCondition);
      });

      console.log(`📊 Updated market data for ${data.length} coins`);
    } catch (error) {
      console.error('❌ Error updating market data:', error);
    }
  }

  // Simple trend detection
  private detectTrend(marketCondition: MarketCondition): TrendDirection {
    const change24h = marketCondition.priceChangePercentage24h;
    const change7d = marketCondition.priceChangePercentage7d;

    if (change24h > 5 && change7d > 10) return 'bullish';
    if (change24h < -5 && change7d < -10) return 'bearish';
    return 'neutral';
  }

  // Calculate portfolio change using existing portfolio service
  private async calculatePortfolioChange(userId: string, timeframe: string): Promise<number> {
    try {
      // This would integrate with your existing portfolio service
      // For now, we'll simulate portfolio change calculation

      // Get current portfolio value (would use your portfolio service)
      const currentValue = await this.getPortfolioValue(userId);

      // Get historical value based on timeframe
      const historicalValue = await this.getHistoricalPortfolioValue(userId, timeframe);

      if (historicalValue === 0) return 0;

      const change = ((currentValue - historicalValue) / historicalValue) * 100;
      return change;
    } catch (error) {
      console.error('Error calculating portfolio change:', error);
      return 0;
    }
  }

  // Get current portfolio value (placeholder - integrate with your portfolio service)
  private async getPortfolioValue(userId: string): Promise<number> {
    // This would call your existing portfolio service
    // For demonstration, return a simulated value
    return 10000 + (Math.random() * 2000); // $10,000 - $12,000
  }

  // Get historical portfolio value (placeholder)
  private async getHistoricalPortfolioValue(userId: string, timeframe: string): Promise<number> {
    // This would get historical portfolio data
    // For demonstration, simulate historical value
    const currentValue = await this.getPortfolioValue(userId);
    const changeMultiplier = {
      '1h': 0.01,
      '24h': 0.05,
      '7d': 0.15,
      '30d': 0.30
    }[timeframe] || 0.05;

    return currentValue * (1 + (Math.random() - 0.5) * changeMultiplier);
  }

  // Get current user ID from auth context
  private getCurrentUserId(): string | null {
    // In a real implementation, this would get the current user from auth context
    // For now, we'll check if there's a user in localStorage or return null
    try {
      const authData = localStorage.getItem('supabase.auth.token');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed?.user?.id || null;
      }
    } catch (error) {
      console.error('Error getting current user ID:', error);
    }
    return null;
  }
}

export const alertMonitoringService = new AlertMonitoringService();
