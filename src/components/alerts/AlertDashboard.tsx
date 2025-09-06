import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Plus, 
  TrendingUp, 
  AlertTriangle, 
  Zap,
  Clock,
  DollarSign,
  Percent,
  BarChart3,
  Wallet
} from 'lucide-react';
import { Alert, AlertStats } from '@/types/alerts';
import { alertService } from '@/services/alertService';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

export const AlertDashboard = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load recent alerts and stats
      const [userAlerts, alertStats] = await Promise.all([
        alertService.getUserAlerts(user.id, { isEnabled: true }, { field: 'lastTriggered', direction: 'desc' }),
        alertService.getAlertStats(user.id)
      ]);

      setAlerts(userAlerts.slice(0, 5)); // Show only 5 most recent
      setStats(alertStats);
    } catch (error) {
      console.error('Error loading alert data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price_threshold':
        return <DollarSign className="w-4 h-4" />;
      case 'percentage_change':
        return <Percent className="w-4 h-4" />;
      case 'trend_signal':
        return <BarChart3 className="w-4 h-4" />;
      case 'portfolio_change':
        return <Wallet className="w-4 h-4" />;
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

  if (loading) {
    return (
      <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-crypto-blue/20 to-crypto-blue/10 border-crypto-blue/30">
          <CardContent className="p-4 text-center">
            <Bell className="w-5 h-5 text-crypto-blue mx-auto mb-2" />
            <div className="text-xl font-bold text-crypto-blue">{stats?.totalAlerts || 0}</div>
            <div className="text-xs text-gray-400">Total</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-crypto-green/20 to-crypto-green/10 border-crypto-green/30">
          <CardContent className="p-4 text-center">
            <Zap className="w-5 h-5 text-crypto-green mx-auto mb-2" />
            <div className="text-xl font-bold text-crypto-green">{stats?.activeAlerts || 0}</div>
            <div className="text-xs text-gray-400">Active</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-crypto-orange/20 to-crypto-orange/10 border-crypto-orange/30">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-5 h-5 text-crypto-orange mx-auto mb-2" />
            <div className="text-xl font-bold text-crypto-orange">{stats?.triggeredToday || 0}</div>
            <div className="text-xs text-gray-400">Today</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-crypto-purple/20 to-crypto-purple/10 border-crypto-purple/30">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-5 h-5 text-crypto-purple mx-auto mb-2" />
            <div className="text-xl font-bold text-crypto-purple">{stats?.mostTriggeredCoin || 'N/A'}</div>
            <div className="text-xs text-gray-400">Top Coin</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center space-x-2">
              <Bell className="w-5 h-5 text-crypto-green" />
              <span>Smart Alerts</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/alerts">
                  View All
                </Link>
              </Button>
              <Button asChild size="sm" className="bg-crypto-green hover:bg-crypto-green/80">
                <Link to="/alerts">
                  <Plus className="w-4 h-4 mr-1" />
                  Create
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">No Smart Alerts</h3>
              <p className="text-gray-500 mb-4">
                Create your first alert to monitor market movements
              </p>
              <Button asChild className="bg-crypto-green hover:bg-crypto-green/80">
                <Link to="/alerts">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Alert
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border hover:border-crypto-green/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${alert.isEnabled ? 'bg-crypto-green/20 text-crypto-green' : 'bg-gray-500/20 text-gray-400'}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{alert.name}</div>
                      <div className="text-xs text-gray-400">
                        {'coinSymbol' in alert && alert.coinSymbol && (
                          <span className="mr-2">{alert.coinSymbol}</span>
                        )}
                        {alert.lastTriggered ? (
                          <span>Last: {new Date(alert.lastTriggered).toLocaleDateString()}</span>
                        ) : (
                          <span>Never triggered</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(alert.priority)}>
                      {alert.priority}
                    </Badge>
                    {alert.triggerCount > 0 && (
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{alert.triggerCount}</span>
                      </div>
                    )}
                    <div className={`w-2 h-2 rounded-full ${alert.isEnabled ? 'bg-green-400' : 'bg-gray-400'}`} />
                  </div>
                </div>
              ))}
              
              {alerts.length >= 5 && (
                <div className="text-center pt-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/alerts">
                      View All {stats?.totalAlerts} Alerts
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Alert Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alertService.getAlertTemplates().slice(0, 4).map((template) => (
              <Link
                key={template.id}
                to="/alerts"
                className="p-3 rounded-lg border border-border bg-card/30 hover:border-crypto-green/50 hover:bg-crypto-green/5 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-xl">{template.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm group-hover:text-crypto-green transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">{template.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
