import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bell,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  DollarSign,
  Percent,
  BarChart3,
  X,
  Target
} from 'lucide-react';

interface CoinAlert {
  id: string;
  type: 'price_breakthrough' | 'support_resistance' | 'volatility' | 'volume_spike' | 'trend_change';
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  value?: number;
  change?: number;
  icon: string;
}

interface CoinSpecificAlertsProps {
  coinId: string;
  coinSymbol: string;
  coinName: string;
  currentPrice?: number;
  priceChange24h?: number;
  compact?: boolean;
}

export const CoinSpecificAlerts = ({ 
  coinId, 
  coinSymbol, 
  coinName, 
  currentPrice, 
  priceChange24h,
  compact = false 
}: CoinSpecificAlertsProps) => {
  const [alerts, setAlerts] = useState<CoinAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateCoinAlerts();
    
    // Update alerts every 3 minutes for specific coins
    const interval = setInterval(generateCoinAlerts, 180000);
    return () => clearInterval(interval);
  }, [coinId, currentPrice, priceChange24h]);

  const generateCoinAlerts = async () => {
    try {
      // Fetch detailed data for this specific coin
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`
      );
      const coinData = await response.json();

      const generatedAlerts: CoinAlert[] = [];
      const now = new Date().toISOString();

      // Analyze and generate coin-specific alerts
      generatedAlerts.push(...analyzeCoinData(coinData, now));

      setAlerts(generatedAlerts);
      setLoading(false);
    } catch (error) {
      console.error('Error generating coin alerts:', error);
      setLoading(false);
    }
  };

  const analyzeCoinData = (coinData: any, timestamp: string): CoinAlert[] => {
    const alerts: CoinAlert[] = [];
    const marketData = coinData.market_data;
    
    if (!marketData) return alerts;

    const currentPrice = marketData.current_price?.usd || 0;
    const change24h = marketData.price_change_percentage_24h || 0;
    const change7d = marketData.price_change_percentage_7d || 0;
    const volume24h = marketData.total_volume?.usd || 0;
    const marketCap = marketData.market_cap?.usd || 0;
    const high24h = marketData.high_24h?.usd || 0;
    const low24h = marketData.low_24h?.usd || 0;

    // Price breakthrough alerts
    if (currentPrice >= high24h * 0.98) {
      alerts.push({
        id: `${coinId}-near-high-${Date.now()}`,
        type: 'price_breakthrough',
        message: `🎯 ${coinSymbol} is near 24h high at $${currentPrice.toLocaleString()} — potential breakout!`,
        priority: 'high',
        timestamp,
        value: currentPrice,
        icon: '🎯'
      });
    }

    if (currentPrice <= low24h * 1.02) {
      alerts.push({
        id: `${coinId}-near-low-${Date.now()}`,
        type: 'support_resistance',
        message: `🛡️ ${coinSymbol} is testing support at $${currentPrice.toLocaleString()} — watch for bounce!`,
        priority: 'medium',
        timestamp,
        value: currentPrice,
        icon: '🛡️'
      });
    }

    // Volatility alerts
    if (Math.abs(change24h) > 10) {
      const direction = change24h > 0 ? 'surged' : 'dropped';
      const emoji = change24h > 0 ? '🚀' : '⚠️';
      const priority = Math.abs(change24h) > 20 ? 'critical' : 'high';
      
      alerts.push({
        id: `${coinId}-volatility-${Date.now()}`,
        type: 'volatility',
        message: `${emoji} ${coinSymbol} ${direction} ${Math.abs(change24h).toFixed(1)}% today — high volatility!`,
        priority,
        timestamp,
        change: change24h,
        icon: emoji
      });
    }

    // Volume spike alerts
    const avgVolume = marketCap * 0.1; // Rough estimate
    if (volume24h > avgVolume * 2) {
      alerts.push({
        id: `${coinId}-volume-${Date.now()}`,
        type: 'volume_spike',
        message: `⚡ ${coinSymbol} volume spike: $${(volume24h / 1000000).toFixed(0)}M — unusual activity detected!`,
        priority: 'medium',
        timestamp,
        icon: '⚡'
      });
    }

    // Trend change alerts
    if (change24h > 5 && change7d < -5) {
      alerts.push({
        id: `${coinId}-reversal-${Date.now()}`,
        type: 'trend_change',
        message: `🔄 ${coinSymbol} showing reversal signs — up ${change24h.toFixed(1)}% today after weekly decline!`,
        priority: 'medium',
        timestamp,
        change: change24h,
        icon: '🔄'
      });
    }

    // Strong momentum alerts
    if (change24h > 15 && change7d > 20) {
      alerts.push({
        id: `${coinId}-momentum-${Date.now()}`,
        type: 'trend_change',
        message: `🔥 ${coinSymbol} on fire! Up ${change24h.toFixed(1)}% today, ${change7d.toFixed(1)}% this week!`,
        priority: 'high',
        timestamp,
        change: change24h,
        icon: '🔥'
      });
    }

    // Support/Resistance levels
    const priceRange = high24h - low24h;
    const currentPosition = (currentPrice - low24h) / priceRange;
    
    if (currentPosition > 0.9) {
      alerts.push({
        id: `${coinId}-resistance-${Date.now()}`,
        type: 'support_resistance',
        message: `🎯 ${coinSymbol} approaching resistance at $${high24h.toLocaleString()} — breakout watch!`,
        priority: 'medium',
        timestamp,
        value: high24h,
        icon: '🎯'
      });
    } else if (currentPosition < 0.1) {
      alerts.push({
        id: `${coinId}-support-${Date.now()}`,
        type: 'support_resistance',
        message: `🛡️ ${coinSymbol} testing support at $${low24h.toLocaleString()} — bounce opportunity!`,
        priority: 'medium',
        timestamp,
        value: low24h,
        icon: '🛡️'
      });
    }

    return alerts;
  };

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price_breakthrough':
        return <Target className="w-4 h-4" />;
      case 'support_resistance':
        return <BarChart3 className="w-4 h-4" />;
      case 'volatility':
        return <Percent className="w-4 h-4" />;
      case 'volume_spike':
        return <Zap className="w-4 h-4" />;
      case 'trend_change':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  if (loading) {
    return (
      <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-3 bg-gray-700 rounded w-1/4"></div>
            <div className="h-2 bg-gray-700 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="relative mb-6">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-crypto-orange/5 via-crypto-red/5 to-crypto-purple/5 rounded-2xl" />

      <Card className="relative bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-crypto-orange/10 to-crypto-red/10 border-b border-white/10">
          <CardTitle className="text-lg font-bold flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-crypto-orange/30 rounded-xl blur-lg" />
                <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-crypto-orange/20 to-crypto-red/20 border border-crypto-orange/30">
                  <AlertTriangle className="w-5 h-5 text-crypto-orange" />
                </div>
              </div>
              <div>
                <span className="bg-gradient-to-r from-crypto-orange to-crypto-red bg-clip-text text-transparent">
                  {coinSymbol} Smart Alerts
                </span>
                <div className="text-xs text-gray-400 font-normal mt-1">
                  Technical analysis & signals
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 alert-glow">
                <div className="w-2 h-2 bg-orange-400 rounded-full alert-pulse" />
                <span className="text-xs text-orange-400 font-medium">LIVE</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className={compact ? "p-4" : "p-5"}>
          <div className="space-y-3">
            {visibleAlerts.map((alert, index) => (
              <div
                key={alert.id}
                className="group relative alert-slide-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Alert card with coin-specific styling */}
                <div className={`relative p-4 rounded-xl bg-gradient-to-r from-black/60 to-black/40 border border-white/10 hover:border-crypto-orange/40 transition-all duration-500 hover:shadow-lg hover:shadow-crypto-orange/10 hover:scale-[1.01] ${
                  alert.priority === 'critical' ? 'alert-critical' :
                  alert.priority === 'high' ? 'alert-high' :
                  alert.priority === 'medium' ? 'alert-medium' :
                  'alert-low'
                }`}>

                  {/* Priority indicator bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
                    alert.priority === 'critical' ? 'bg-gradient-to-b from-red-500 to-red-600' :
                    alert.priority === 'high' ? 'bg-gradient-to-b from-orange-500 to-orange-600' :
                    alert.priority === 'medium' ? 'bg-gradient-to-b from-yellow-500 to-yellow-600' :
                    'bg-gradient-to-b from-blue-500 to-blue-600'
                  }`} />

                  {/* Dismiss button */}
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/40 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-start space-x-3">
                    {/* Icon with glow effect */}
                    <div className="relative flex-shrink-0">
                      <div className={`absolute inset-0 rounded-lg blur-md ${
                        alert.priority === 'critical' ? 'bg-red-500/40' :
                        alert.priority === 'high' ? 'bg-orange-500/40' :
                        alert.priority === 'medium' ? 'bg-yellow-500/40' :
                        'bg-blue-500/40'
                      }`} />
                      <div className={`relative p-2.5 rounded-lg border ${
                        alert.priority === 'critical' ? 'bg-red-500/20 border-red-500/30' :
                        alert.priority === 'high' ? 'bg-orange-500/20 border-orange-500/30' :
                        alert.priority === 'medium' ? 'bg-yellow-500/20 border-yellow-500/30' :
                        'bg-blue-500/20 border-blue-500/30'
                      }`}>
                        {getAlertIcon(alert.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header with priority and time */}
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`px-2 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide ${
                          alert.priority === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          alert.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                          alert.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                          'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {alert.priority}
                        </div>

                        <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 ml-auto">
                          <span className="text-xs text-gray-400">
                            {new Date(alert.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Alert message */}
                      <p className="text-sm text-gray-200 leading-relaxed mb-3 font-medium">
                        {alert.message}
                      </p>

                      {/* Metrics */}
                      {(alert.value || alert.change) && (
                        <div className="flex items-center space-x-3">
                          {alert.value && (
                            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                              <Target className="w-4 h-4 text-crypto-orange" />
                              <span className="text-sm font-semibold text-white">
                                ${alert.value.toLocaleString()}
                              </span>
                            </div>
                          )}
                          {alert.change && (
                            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${
                              alert.change > 0
                                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                : 'bg-red-500/10 border-red-500/30 text-red-400'
                            }`}>
                              {alert.change > 0 ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                              <span className="text-sm font-semibold">
                                {alert.change > 0 ? '+' : ''}{alert.change.toFixed(2)}%
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-white/10">
            <div className="flex items-center justify-center space-x-2 text-gray-400">
              <div className="w-2 h-2 bg-crypto-orange rounded-full animate-pulse" />
              <span className="text-xs font-medium">
                🎯 {coinSymbol}-specific alerts • Updates every 3 minutes
              </span>
              <div className="w-2 h-2 bg-crypto-red rounded-full animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
