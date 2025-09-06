// Smart Alerts Type Definitions

export type AlertType = 'price_threshold' | 'percentage_change' | 'trend_signal' | 'portfolio_change';

export type AlertCondition = 'above' | 'below' | 'crosses_above' | 'crosses_below' | 'equals';

export type AlertStatus = 'active' | 'triggered' | 'paused' | 'expired';

export type TrendDirection = 'bullish' | 'bearish' | 'neutral';

export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

// Base Alert Interface
export interface BaseAlert {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: AlertType;
  status: AlertStatus;
  priority: AlertPriority;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastTriggered?: string;
  triggerCount: number;
  expiresAt?: string;
}

// Price Threshold Alert
export interface PriceThresholdAlert extends BaseAlert {
  type: 'price_threshold';
  coinId: string;
  coinSymbol: string;
  coinName: string;
  condition: 'above' | 'below' | 'crosses_above' | 'crosses_below';
  targetPrice: number;
  currentPrice?: number;
  currency: string; // USD, EUR, etc.
}

// Percentage Change Alert
export interface PercentageChangeAlert extends BaseAlert {
  type: 'percentage_change';
  coinId: string;
  coinSymbol: string;
  coinName: string;
  condition: 'above' | 'below';
  targetPercentage: number;
  timeframe: '1h' | '24h' | '7d' | '30d';
  currentChange?: number;
}

// Trend Signal Alert
export interface TrendSignalAlert extends BaseAlert {
  type: 'trend_signal';
  coinId: string;
  coinSymbol: string;
  coinName: string;
  targetTrend: TrendDirection;
  indicators: string[]; // RSI, MACD, SMA, etc.
  currentTrend?: TrendDirection;
  confidence?: number;
}

// Portfolio Change Alert
export interface PortfolioChangeAlert extends BaseAlert {
  type: 'portfolio_change';
  condition: 'above' | 'below';
  targetPercentage: number;
  timeframe: '1h' | '24h' | '7d' | '30d';
  portfolioValue?: number;
  currentChange?: number;
  affectedCoins?: string[];
}

// Union type for all alert types
export type Alert = PriceThresholdAlert | PercentageChangeAlert | TrendSignalAlert | PortfolioChangeAlert;

// Alert Trigger Event
export interface AlertTrigger {
  id: string;
  alertId: string;
  triggeredAt: string;
  triggerValue: number;
  message: string;
  metadata?: Record<string, any>;
}

// Alert Notification
export interface AlertNotification {
  id: string;
  alertId: string;
  triggerId: string;
  type: 'browser' | 'toast' | 'email' | 'push';
  title: string;
  message: string;
  icon?: string;
  actionUrl?: string;
  sentAt: string;
  isRead: boolean;
}

// Alert Statistics
export interface AlertStats {
  totalAlerts: number;
  activeAlerts: number;
  triggeredToday: number;
  triggeredThisWeek: number;
  mostTriggeredCoin: string;
  averageResponseTime: number;
}

// Alert Creation Request
export interface CreateAlertRequest {
  name: string;
  description?: string;
  type: AlertType;
  priority: AlertPriority;
  expiresAt?: string;
  // Type-specific fields will be added based on alert type
  [key: string]: any;
}

// Alert Update Request
export interface UpdateAlertRequest {
  name?: string;
  description?: string;
  priority?: AlertPriority;
  isEnabled?: boolean;
  expiresAt?: string;
  // Type-specific fields
  [key: string]: any;
}

// Alert Filter Options
export interface AlertFilters {
  type?: AlertType[];
  status?: AlertStatus[];
  priority?: AlertPriority[];
  coinId?: string[];
  isEnabled?: boolean;
  createdAfter?: string;
  createdBefore?: string;
}

// Alert Sort Options
export interface AlertSortOptions {
  field: 'createdAt' | 'updatedAt' | 'lastTriggered' | 'triggerCount' | 'priority' | 'name';
  direction: 'asc' | 'desc';
}

// Market Condition for Alert Evaluation
export interface MarketCondition {
  coinId: string;
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  priceChangePercentage7d: number;
  priceChangePercentage30d: number;
  marketCap: number;
  volume24h: number;
  lastUpdated: string;
  trend?: TrendDirection;
  indicators?: Record<string, number>;
}

// Alert Template for Quick Setup
export interface AlertTemplate {
  id: string;
  name: string;
  description: string;
  type: AlertType;
  category: 'popular' | 'advanced' | 'portfolio' | 'trading';
  template: Partial<CreateAlertRequest>;
  icon: string;
  popularity: number;
}
