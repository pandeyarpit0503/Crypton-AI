import { supabase } from '@/lib/supabase';
import { 
  Alert, 
  AlertType, 
  AlertStatus, 
  AlertPriority,
  CreateAlertRequest, 
  UpdateAlertRequest, 
  AlertFilters, 
  AlertSortOptions,
  AlertTrigger,
  AlertNotification,
  AlertStats,
  AlertTemplate,
  MarketCondition
} from '@/types/alerts';

class AlertService {
  // Create a new alert
  async createAlert(userId: string, alertData: CreateAlertRequest): Promise<Alert> {
    const alert = {
      id: crypto.randomUUID(),
      userId,
      ...alertData,
      status: 'active' as AlertStatus,
      isEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      triggerCount: 0
    };

    const { data, error } = await supabase
      .from('alerts')
      .insert([alert])
      .select()
      .single();

    if (error) {
      console.error('Error creating alert:', error);
      throw new Error('Failed to create alert');
    }

    console.log('✅ Alert created:', data.name);
    return data;
  }

  // Get user's alerts with filtering and sorting
  async getUserAlerts(
    userId: string, 
    filters?: AlertFilters, 
    sort?: AlertSortOptions
  ): Promise<Alert[]> {
    let query = supabase
      .from('alerts')
      .select('*')
      .eq('userId', userId);

    // Apply filters
    if (filters) {
      if (filters.type?.length) {
        query = query.in('type', filters.type);
      }
      if (filters.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters.priority?.length) {
        query = query.in('priority', filters.priority);
      }
      if (filters.coinId?.length) {
        query = query.in('coinId', filters.coinId);
      }
      if (filters.isEnabled !== undefined) {
        query = query.eq('isEnabled', filters.isEnabled);
      }
      if (filters.createdAfter) {
        query = query.gte('createdAt', filters.createdAfter);
      }
      if (filters.createdBefore) {
        query = query.lte('createdAt', filters.createdBefore);
      }
    }

    // Apply sorting
    if (sort) {
      query = query.order(sort.field, { ascending: sort.direction === 'asc' });
    } else {
      query = query.order('createdAt', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching alerts:', error);
      throw new Error('Failed to fetch alerts');
    }

    return data || [];
  }

  // Update an alert
  async updateAlert(alertId: string, userId: string, updates: UpdateAlertRequest): Promise<Alert> {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('alerts')
      .update(updateData)
      .eq('id', alertId)
      .eq('userId', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating alert:', error);
      throw new Error('Failed to update alert');
    }

    console.log('✅ Alert updated:', data.name);
    return data;
  }

  // Delete an alert
  async deleteAlert(alertId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', alertId)
      .eq('userId', userId);

    if (error) {
      console.error('Error deleting alert:', error);
      throw new Error('Failed to delete alert');
    }

    console.log('✅ Alert deleted:', alertId);
  }

  // Toggle alert enabled/disabled
  async toggleAlert(alertId: string, userId: string, isEnabled: boolean): Promise<Alert> {
    return this.updateAlert(alertId, userId, { isEnabled });
  }

  // Record alert trigger
  async recordAlertTrigger(alertId: string, triggerValue: number, message: string, metadata?: Record<string, any>): Promise<AlertTrigger> {
    const trigger: AlertTrigger = {
      id: crypto.randomUUID(),
      alertId,
      triggeredAt: new Date().toISOString(),
      triggerValue,
      message,
      metadata
    };

    // Insert trigger record
    const { error: triggerError } = await supabase
      .from('alert_triggers')
      .insert([trigger]);

    if (triggerError) {
      console.error('Error recording alert trigger:', triggerError);
      throw new Error('Failed to record alert trigger');
    }

    // Update alert trigger count and last triggered time
    const { error: updateError } = await supabase
      .from('alerts')
      .update({
        lastTriggered: trigger.triggeredAt,
        triggerCount: supabase.raw('trigger_count + 1'),
        updatedAt: new Date().toISOString()
      })
      .eq('id', alertId);

    if (updateError) {
      console.error('Error updating alert trigger count:', updateError);
    }

    console.log('🚨 Alert triggered:', message);
    return trigger;
  }

  // Get alert triggers history
  async getAlertTriggers(alertId: string, limit: number = 50): Promise<AlertTrigger[]> {
    const { data, error } = await supabase
      .from('alert_triggers')
      .select('*')
      .eq('alertId', alertId)
      .order('triggeredAt', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching alert triggers:', error);
      throw new Error('Failed to fetch alert triggers');
    }

    return data || [];
  }

  // Get alert statistics
  async getAlertStats(userId: string): Promise<AlertStats> {
    const { data: alerts, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('userId', userId);

    if (error) {
      console.error('Error fetching alert stats:', error);
      throw new Error('Failed to fetch alert stats');
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats: AlertStats = {
      totalAlerts: alerts?.length || 0,
      activeAlerts: alerts?.filter(a => a.status === 'active' && a.isEnabled).length || 0,
      triggeredToday: alerts?.filter(a => a.lastTriggered && new Date(a.lastTriggered) >= today).length || 0,
      triggeredThisWeek: alerts?.filter(a => a.lastTriggered && new Date(a.lastTriggered) >= weekAgo).length || 0,
      mostTriggeredCoin: this.getMostTriggeredCoin(alerts || []),
      averageResponseTime: 0 // TODO: Calculate based on trigger history
    };

    return stats;
  }

  // Get predefined alert templates
  getAlertTemplates(): AlertTemplate[] {
    return [
      {
        id: 'btc-price-alert',
        name: 'Bitcoin Price Alert',
        description: 'Get notified when Bitcoin reaches a specific price',
        type: 'price_threshold',
        category: 'popular',
        template: {
          type: 'price_threshold',
          coinId: 'bitcoin',
          coinSymbol: 'BTC',
          coinName: 'Bitcoin',
          condition: 'above',
          currency: 'USD',
          priority: 'medium'
        },
        icon: '₿',
        popularity: 95
      },
      {
        id: 'eth-volatility-alert',
        name: 'Ethereum Volatility Alert',
        description: 'Track Ethereum price swings over 24 hours',
        type: 'percentage_change',
        category: 'popular',
        template: {
          type: 'percentage_change',
          coinId: 'ethereum',
          coinSymbol: 'ETH',
          coinName: 'Ethereum',
          condition: 'above',
          targetPercentage: 5,
          timeframe: '24h',
          priority: 'medium'
        },
        icon: 'Ξ',
        popularity: 85
      },
      {
        id: 'portfolio-loss-alert',
        name: 'Portfolio Protection Alert',
        description: 'Get warned when your portfolio drops significantly',
        type: 'portfolio_change',
        category: 'portfolio',
        template: {
          type: 'portfolio_change',
          condition: 'below',
          targetPercentage: -10,
          timeframe: '24h',
          priority: 'high'
        },
        icon: '🛡️',
        popularity: 75
      },
      {
        id: 'trend-reversal-alert',
        name: 'Trend Reversal Alert',
        description: 'Detect when a coin changes from bearish to bullish',
        type: 'trend_signal',
        category: 'advanced',
        template: {
          type: 'trend_signal',
          targetTrend: 'bullish',
          indicators: ['RSI', 'MACD'],
          priority: 'medium'
        },
        icon: '📈',
        popularity: 60
      }
    ];
  }

  // Helper method to find most triggered coin
  private getMostTriggeredCoin(alerts: Alert[]): string {
    const coinCounts: Record<string, number> = {};
    
    alerts.forEach(alert => {
      if ('coinSymbol' in alert && alert.triggerCount > 0) {
        coinCounts[alert.coinSymbol] = (coinCounts[alert.coinSymbol] || 0) + alert.triggerCount;
      }
    });

    const mostTriggered = Object.entries(coinCounts)
      .sort(([,a], [,b]) => b - a)[0];

    return mostTriggered ? mostTriggered[0] : 'N/A';
  }
}

export const alertService = new AlertService();
