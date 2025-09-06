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
  X
} from 'lucide-react';
import { useAlerts } from '@/contexts/AlertContext';



interface PopularCurrencyAlertsProps {
  maxAlerts?: number;
  showHeader?: boolean;
  compact?: boolean;
}

export const PopularCurrencyAlerts = ({
  maxAlerts = 6,
  showHeader = true,
  compact = false
}: PopularCurrencyAlertsProps) => {
  const { alerts: allAlerts, loading, dismissAlert, dismissedAlerts } = useAlerts();

  // Filter alerts to show only the requested number and exclude dismissed ones
  const alerts = allAlerts
    .filter(alert => !dismissedAlerts.has(alert.id))
    .slice(0, maxAlerts);



  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price_breakthrough':
        return <DollarSign className="w-4 h-4" />;
      case 'volatility':
        return <Percent className="w-4 h-4" />;
      case 'trend_change':
        return <TrendingUp className="w-4 h-4" />;
      case 'volume_spike':
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const visibleAlerts = alerts;

  if (loading) {
    return (
      <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-700 rounded w-4/5"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-crypto-blue/5 via-crypto-purple/5 to-crypto-green/5 rounded-2xl" />

      <Card className="relative bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
        {showHeader && (
          <CardHeader className="pb-4 bg-gradient-to-r from-crypto-blue/10 to-crypto-green/10 border-b border-white/10">
            <CardTitle className="text-xl font-bold flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-crypto-green/30 rounded-xl blur-lg" />
                  <div className="relative p-3 rounded-xl bg-gradient-to-br from-crypto-green/20 to-crypto-blue/20 border border-crypto-green/30">
                    <Bell className="w-6 h-6 text-crypto-green" />
                  </div>
                </div>
                <div>
                  <span className="bg-gradient-to-r from-crypto-green to-crypto-blue bg-clip-text text-transparent">
                    Smart Market Alerts
                  </span>
                  <div className="text-xs text-gray-400 font-normal mt-1">
                    AI-powered market intelligence
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30 alert-glow">
                  <div className="w-2 h-2 bg-green-400 rounded-full alert-pulse" />
                  <span className="text-xs text-green-400 font-medium">LIVE</span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
        )}

        <CardContent className={compact ? "p-4" : "p-6"}>
          <div className={`space-y-${compact ? '3' : '4'}`}>
            {visibleAlerts.map((alert, index) => (
              <div
                key={alert.id}
                className="group relative alert-slide-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Alert card with modern design */}
                <div className={`relative p-4 rounded-xl bg-gradient-to-r from-black/60 to-black/40 border border-white/10 hover:border-crypto-green/40 transition-all duration-500 hover:shadow-lg hover:shadow-crypto-green/10 hover:scale-[1.02] ${
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
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-start space-x-4">
                    {/* Icon with glow effect */}
                    <div className="relative flex-shrink-0">
                      <div className={`absolute inset-0 rounded-xl blur-md ${
                        alert.priority === 'critical' ? 'bg-red-500/40' :
                        alert.priority === 'high' ? 'bg-orange-500/40' :
                        alert.priority === 'medium' ? 'bg-yellow-500/40' :
                        'bg-blue-500/40'
                      }`} />
                      <div className={`relative p-3 rounded-xl border ${
                        alert.priority === 'critical' ? 'bg-red-500/20 border-red-500/30' :
                        alert.priority === 'high' ? 'bg-orange-500/20 border-orange-500/30' :
                        alert.priority === 'medium' ? 'bg-yellow-500/20 border-yellow-500/30' :
                        'bg-blue-500/20 border-blue-500/30'
                      }`}>
                        {getAlertIcon(alert.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header with coin and priority */}
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-white">{alert.coinSymbol}</span>
                          <div className={`px-2 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide ${
                            alert.priority === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            alert.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                            alert.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {alert.priority}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-auto">
                          <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
                            <span className="text-xs text-gray-400">
                              {new Date(alert.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Alert message */}
                      <p className={`${compact ? 'text-sm' : 'text-base'} text-gray-200 leading-relaxed mb-3 font-medium`}>
                        {alert.message}
                      </p>

                      {/* Metrics */}
                      {(alert.value || alert.change) && (
                        <div className="flex items-center space-x-4">
                          {alert.value && (
                            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                              <DollarSign className="w-4 h-4 text-crypto-green" />
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

          {visibleAlerts.length > 0 && (
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center justify-center space-x-2 text-gray-400">
                <div className="w-2 h-2 bg-crypto-blue rounded-full animate-pulse" />
                <span className="text-xs font-medium">
                  AI-powered alerts • Updates every 90 seconds
                </span>
                <div className="w-2 h-2 bg-crypto-green rounded-full animate-pulse" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
