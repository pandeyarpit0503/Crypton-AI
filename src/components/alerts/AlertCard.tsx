import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  BellOff, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Percent,
  BarChart3,
  Wallet,
  Clock,
  Target,
  AlertTriangle
} from 'lucide-react';
import { Alert, AlertType, AlertPriority } from '@/types/alerts';

interface AlertCardProps {
  alert: Alert;
  onToggle: (alertId: string, enabled: boolean) => void;
  onEdit: (alert: Alert) => void;
  onDelete: (alertId: string) => void;
}

export const AlertCard = ({ alert, onToggle, onEdit, onDelete }: AlertCardProps) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async (enabled: boolean) => {
    setIsToggling(true);
    try {
      await onToggle(alert.id, enabled);
    } finally {
      setIsToggling(false);
    }
  };

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'price_threshold':
        return <DollarSign className="w-5 h-5" />;
      case 'percentage_change':
        return <Percent className="w-5 h-5" />;
      case 'trend_signal':
        return <BarChart3 className="w-5 h-5" />;
      case 'portfolio_change':
        return <Wallet className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: AlertPriority) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'triggered':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'paused':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'expired':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatAlertDetails = () => {
    switch (alert.type) {
      case 'price_threshold':
        const priceAlert = alert as any;
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">{priceAlert.coinSymbol}</span>
              <span className="text-sm text-gray-400">{priceAlert.coinName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-gray-400" />
              <span className="text-sm">
                {priceAlert.condition.replace('_', ' ')} ${priceAlert.targetPrice?.toLocaleString()}
              </span>
            </div>
            {priceAlert.currentPrice && (
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Current: ${priceAlert.currentPrice.toLocaleString()}</span>
              </div>
            )}
          </div>
        );

      case 'percentage_change':
        const percentAlert = alert as any;
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">{percentAlert.coinSymbol}</span>
              <span className="text-sm text-gray-400">{percentAlert.coinName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Percent className="w-4 h-4 text-gray-400" />
              <span className="text-sm">
                {percentAlert.condition} {percentAlert.targetPercentage}% in {percentAlert.timeframe}
              </span>
            </div>
            {percentAlert.currentChange !== undefined && (
              <div className="flex items-center space-x-2">
                {percentAlert.currentChange >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className="text-sm">
                  Current: {percentAlert.currentChange.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        );

      case 'trend_signal':
        const trendAlert = alert as any;
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">{trendAlert.coinSymbol}</span>
              <span className="text-sm text-gray-400">{trendAlert.coinName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-gray-400" />
              <span className="text-sm">Target trend: {trendAlert.targetTrend}</span>
            </div>
            {trendAlert.currentTrend && (
              <div className="flex items-center space-x-2">
                {trendAlert.currentTrend === 'bullish' ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : trendAlert.currentTrend === 'bearish' ? (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                ) : (
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm">Current: {trendAlert.currentTrend}</span>
              </div>
            )}
          </div>
        );

      case 'portfolio_change':
        const portfolioAlert = alert as any;
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-crypto-blue" />
              <span className="text-lg font-semibold">Portfolio Alert</span>
            </div>
            <div className="flex items-center space-x-2">
              <Percent className="w-4 h-4 text-gray-400" />
              <span className="text-sm">
                {portfolioAlert.condition} {portfolioAlert.targetPercentage}% in {portfolioAlert.timeframe}
              </span>
            </div>
            {portfolioAlert.currentChange !== undefined && (
              <div className="flex items-center space-x-2">
                {portfolioAlert.currentChange >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className="text-sm">
                  Current: {portfolioAlert.currentChange.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        );

      default:
        return <div className="text-sm text-gray-400">Unknown alert type</div>;
    }
  };

  return (
    <Card className={`bg-glass-bg backdrop-blur-glass border-glass-border hover:border-crypto-green/50 transition-all duration-300 ${
      !alert.isEnabled ? 'opacity-60' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${alert.isEnabled ? 'bg-crypto-green/20 text-crypto-green' : 'bg-gray-500/20 text-gray-400'}`}>
              {getAlertIcon(alert.type)}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{alert.name}</CardTitle>
              {alert.description && (
                <p className="text-sm text-gray-400 mt-1">{alert.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getPriorityColor(alert.priority)}>
              {alert.priority}
            </Badge>
            <Badge className={getStatusColor(alert.status)}>
              {alert.status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Alert Details */}
        <div className="bg-card/50 rounded-lg p-3">
          {formatAlertDetails()}
        </div>

        {/* Alert Stats */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Created {new Date(alert.createdAt).toLocaleDateString()}</span>
            </div>
            {alert.triggerCount > 0 && (
              <div className="flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4" />
                <span>{alert.triggerCount} triggers</span>
              </div>
            )}
          </div>
          {alert.lastTriggered && (
            <div className="text-xs">
              Last: {new Date(alert.lastTriggered).toLocaleString()}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center space-x-2">
            <Switch
              checked={alert.isEnabled}
              onCheckedChange={handleToggle}
              disabled={isToggling}
            />
            <span className="text-sm text-gray-400">
              {alert.isEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(alert)}
              className="text-gray-400 hover:text-crypto-blue"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(alert.id)}
              className="text-gray-400 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
