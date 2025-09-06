import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CryptoAlert {
  id: string;
  coinId: string;
  coinSymbol: string;
  coinName: string;
  type: 'price_breakthrough' | 'volatility' | 'trend_change' | 'volume_spike';
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  value?: number;
  change?: number;
  icon: string;
}

interface AlertContextType {
  alerts: CryptoAlert[];
  loading: boolean;
  dismissAlert: (alertId: string) => void;
  dismissedAlerts: Set<string>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<CryptoAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const generateSmartAlerts = async () => {
    try {
      // Fetch market data for popular currencies with more comprehensive data
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=1h%2C24h%2C7d%2C14d%2C30d'
      );
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const marketData = await response.json();

      if (!Array.isArray(marketData)) {
        throw new Error('Invalid API response format');
      }

      const generatedAlerts: CryptoAlert[] = [];

      // Generate alerts for each coin
      marketData.forEach((coin: any) => {
        try {
          const coinAlerts = analyzeAndGenerateAlerts(coin);
          generatedAlerts.push(...coinAlerts);
        } catch (coinError) {
          console.warn(`Error analyzing coin ${coin?.symbol}:`, coinError);
        }
      });

      // Sort by priority and timestamp, take most important alerts
      const sortedAlerts = generatedAlerts
        .filter(alert => alert && alert.id) // Filter out invalid alerts
        .sort((a, b) => {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          }
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });

      console.log(`Generated ${generatedAlerts.length} alerts, sorted ${sortedAlerts.length}`);
      setAlerts(sortedAlerts);
      setLoading(false);
    } catch (error) {
      console.error('Error generating smart alerts:', error);
      // Set empty alerts array on error to show "no alerts" state
      setAlerts([]);
      setLoading(false);
    }
  };

  const analyzeAndGenerateAlerts = (coin: any): CryptoAlert[] => {
    const alerts: CryptoAlert[] = [];
    const now = new Date().toISOString();

    // Dynamic price breakthrough alerts based on market cap and recent performance
    const priceChange24h = coin.price_change_percentage_24h || 0;
    const priceChange7d = coin.price_change_percentage_7d || 0;
    const currentPrice = coin.current_price || 0;
    const marketCapRank = coin.market_cap_rank || 999;

    // Significant price movements for top coins
    if (marketCapRank <= 10 && Math.abs(priceChange24h) > 3) {
      const direction = priceChange24h > 0 ? 'surged' : 'dropped';
      const emoji = priceChange24h > 0 ? '🚀' : '📉';
      alerts.push({
        id: `${coin.id}-price-movement-${Date.now()}`,
        coinId: coin.id,
        coinSymbol: coin.symbol.toUpperCase(),
        coinName: coin.name,
        type: 'price_breakthrough',
        message: `${emoji} ${coin.symbol.toUpperCase()} ${direction} ${Math.abs(priceChange24h).toFixed(1)}% to $${currentPrice.toLocaleString()} — major market movement!`,
        priority: Math.abs(priceChange24h) > 7 ? 'critical' : 'high',
        timestamp: now,
        value: currentPrice,
        change: priceChange24h,
        icon: emoji
      });
    }

    // High volatility alerts with dynamic thresholds
    const volatilityThreshold = marketCapRank <= 20 ? 5 : 8; // Lower threshold for top coins
    if (Math.abs(priceChange24h) > volatilityThreshold) {
      const direction = priceChange24h > 0 ? 'surged' : 'dropped';
      const emoji = priceChange24h > 0 ? '📈' : '⚠️';
      alerts.push({
        id: `${coin.id}-volatility-${Date.now()}`,
        coinId: coin.id,
        coinSymbol: coin.symbol.toUpperCase(),
        coinName: coin.name,
        type: 'volatility',
        message: `${emoji} ${coin.symbol.toUpperCase()} ${direction} ${Math.abs(priceChange24h).toFixed(1)}% in 24h — high volatility detected!`,
        priority: Math.abs(priceChange24h) > 15 ? 'critical' : 'high',
        timestamp: now,
        change: priceChange24h,
        icon: emoji
      });
    }

    // Top gainer/loser alerts with dynamic thresholds
    if (priceChange24h > 8 && marketCapRank <= 100) {
      alerts.push({
        id: `${coin.id}-gainer-${Date.now()}`,
        coinId: coin.id,
        coinSymbol: coin.symbol.toUpperCase(),
        coinName: coin.name,
        type: 'trend_change',
        message: `🎉 ${coin.symbol.toUpperCase()} is a top gainer today (+${priceChange24h.toFixed(1)}%)!`,
        priority: priceChange24h > 20 ? 'high' : 'medium',
        timestamp: now,
        change: priceChange24h,
        icon: '🎉'
      });
    }

    // Top loser alerts
    if (priceChange24h < -8 && marketCapRank <= 100) {
      alerts.push({
        id: `${coin.id}-loser-${Date.now()}`,
        coinId: coin.id,
        coinSymbol: coin.symbol.toUpperCase(),
        coinName: coin.name,
        type: 'trend_change',
        message: `⚠️ ${coin.symbol.toUpperCase()} is down ${Math.abs(priceChange24h).toFixed(1)}% today — potential buying opportunity!`,
        priority: Math.abs(priceChange24h) > 20 ? 'high' : 'medium',
        timestamp: now,
        change: priceChange24h,
        icon: '⚠️'
      });
    }

    // Volume spike alerts with better logic
    const volumeToMarketCapRatio = coin.total_volume / coin.market_cap;
    if (volumeToMarketCapRatio > 0.2 && marketCapRank <= 50) {
      alerts.push({
        id: `${coin.id}-volume-${Date.now()}`,
        coinId: coin.id,
        coinSymbol: coin.symbol.toUpperCase(),
        coinName: coin.name,
        type: 'volume_spike',
        message: `⚡ ${coin.symbol.toUpperCase()} volume spike detected (${(volumeToMarketCapRatio * 100).toFixed(1)}% of market cap) — unusual trading activity!`,
        priority: volumeToMarketCapRatio > 0.5 ? 'high' : 'medium',
        timestamp: now,
        icon: '⚡'
      });
    }

    // Weekly trend reversal alerts
    if (priceChange7d && priceChange24h) {
      const weeklyTrend = priceChange7d > 0 ? 'bullish' : 'bearish';
      const dailyTrend = priceChange24h > 0 ? 'bullish' : 'bearish';
      
      // Detect trend reversals
      if (weeklyTrend !== dailyTrend && Math.abs(priceChange24h) > 5 && marketCapRank <= 30) {
        const emoji = dailyTrend === 'bullish' ? '🔄📈' : '🔄📉';
        alerts.push({
          id: `${coin.id}-reversal-${Date.now()}`,
          coinId: coin.id,
          coinSymbol: coin.symbol.toUpperCase(),
          coinName: coin.name,
          type: 'trend_change',
          message: `${emoji} ${coin.symbol.toUpperCase()} trend reversal detected — ${dailyTrend} momentum after ${weeklyTrend} week!`,
          priority: 'medium',
          timestamp: now,
          change: priceChange24h,
          icon: emoji
        });
      }
    }

    // New listing or significant rank changes
    if (marketCapRank <= 100 && priceChange24h > 15) {
      alerts.push({
        id: `${coin.id}-breakout-${Date.now()}`,
        coinId: coin.id,
        coinSymbol: coin.symbol.toUpperCase(),
        coinName: coin.name,
        type: 'price_breakthrough',
        message: `🌟 ${coin.symbol.toUpperCase()} breakout alert! Up ${priceChange24h.toFixed(1)}% — potential momentum play!`,
        priority: 'high',
        timestamp: now,
        value: currentPrice,
        change: priceChange24h,
        icon: '🌟'
      });
    }

    return alerts;
  };

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  useEffect(() => {
    generateSmartAlerts();
    
    // Update alerts every 90 seconds for more dynamic feel
    const interval = setInterval(generateSmartAlerts, 90000);
    return () => clearInterval(interval);
  }, []);

  const value = {
    alerts,
    loading,
    dismissAlert,
    dismissedAlerts
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};
