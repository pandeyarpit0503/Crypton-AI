-- Smart Alerts Database Schema

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('price_threshold', 'percentage_change', 'trend_signal', 'portfolio_change')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'triggered', 'paused', 'expired')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_triggered TIMESTAMP WITH TIME ZONE,
    trigger_count INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Price threshold alert fields
    coin_id VARCHAR(100),
    coin_symbol VARCHAR(20),
    coin_name VARCHAR(100),
    condition VARCHAR(20) CHECK (condition IN ('above', 'below', 'crosses_above', 'crosses_below', 'equals')),
    target_price DECIMAL(20, 8),
    current_price DECIMAL(20, 8),
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Percentage change alert fields
    target_percentage DECIMAL(10, 4),
    timeframe VARCHAR(10) CHECK (timeframe IN ('1h', '24h', '7d', '30d')),
    current_change DECIMAL(10, 4),
    
    -- Trend signal alert fields
    target_trend VARCHAR(20) CHECK (target_trend IN ('bullish', 'bearish', 'neutral')),
    indicators TEXT[], -- Array of indicator names
    current_trend VARCHAR(20) CHECK (current_trend IN ('bullish', 'bearish', 'neutral')),
    confidence DECIMAL(5, 4),
    
    -- Portfolio change alert fields
    portfolio_value DECIMAL(20, 8),
    affected_coins TEXT[] -- Array of coin symbols
);

-- Create alert triggers table
CREATE TABLE IF NOT EXISTS alert_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    trigger_value DECIMAL(20, 8) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB
);

-- Create alert notifications table
CREATE TABLE IF NOT EXISTS alert_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    trigger_id UUID REFERENCES alert_triggers(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('browser', 'toast', 'email', 'push')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    icon VARCHAR(255),
    action_url VARCHAR(500),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN NOT NULL DEFAULT false
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(type);
CREATE INDEX IF NOT EXISTS idx_alerts_is_enabled ON alerts(is_enabled);
CREATE INDEX IF NOT EXISTS idx_alerts_coin_id ON alerts(coin_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_alerts_last_triggered ON alerts(last_triggered);

CREATE INDEX IF NOT EXISTS idx_alert_triggers_alert_id ON alert_triggers(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_triggers_triggered_at ON alert_triggers(triggered_at);

CREATE INDEX IF NOT EXISTS idx_alert_notifications_alert_id ON alert_notifications(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_notifications_is_read ON alert_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_alert_notifications_sent_at ON alert_notifications(sent_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for alerts table
DROP TRIGGER IF EXISTS update_alerts_updated_at ON alerts;
CREATE TRIGGER update_alerts_updated_at
    BEFORE UPDATE ON alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for alerts
CREATE POLICY "Users can view their own alerts" ON alerts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alerts" ON alerts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" ON alerts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts" ON alerts
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for alert_triggers
CREATE POLICY "Users can view triggers for their alerts" ON alert_triggers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM alerts 
            WHERE alerts.id = alert_triggers.alert_id 
            AND alerts.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert alert triggers" ON alert_triggers
    FOR INSERT WITH CHECK (true); -- Allow system to insert triggers

-- Create RLS policies for alert_notifications
CREATE POLICY "Users can view notifications for their alerts" ON alert_notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM alerts 
            WHERE alerts.id = alert_notifications.alert_id 
            AND alerts.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert alert notifications" ON alert_notifications
    FOR INSERT WITH CHECK (true); -- Allow system to insert notifications

CREATE POLICY "Users can update their alert notifications" ON alert_notifications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM alerts 
            WHERE alerts.id = alert_notifications.alert_id 
            AND alerts.user_id = auth.uid()
        )
    );

-- Create a function to get alert statistics
CREATE OR REPLACE FUNCTION get_alert_stats(user_uuid UUID)
RETURNS TABLE (
    total_alerts INTEGER,
    active_alerts INTEGER,
    triggered_today INTEGER,
    triggered_this_week INTEGER,
    most_triggered_coin TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_alerts,
        COUNT(CASE WHEN status = 'active' AND is_enabled = true THEN 1 END)::INTEGER as active_alerts,
        COUNT(CASE WHEN last_triggered >= CURRENT_DATE THEN 1 END)::INTEGER as triggered_today,
        COUNT(CASE WHEN last_triggered >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END)::INTEGER as triggered_this_week,
        COALESCE(
            (SELECT coin_symbol 
             FROM alerts 
             WHERE user_id = user_uuid AND coin_symbol IS NOT NULL 
             GROUP BY coin_symbol 
             ORDER BY SUM(trigger_count) DESC 
             LIMIT 1), 
            'N/A'
        ) as most_triggered_coin
    FROM alerts 
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_alert_stats(UUID) TO authenticated;

-- Create a function to clean up old alert triggers (optional)
CREATE OR REPLACE FUNCTION cleanup_old_alert_triggers()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM alert_triggers 
    WHERE triggered_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to clean up old alert notifications (optional)
CREATE OR REPLACE FUNCTION cleanup_old_alert_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM alert_notifications 
    WHERE sent_at < NOW() - INTERVAL '30 days' AND is_read = true;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
