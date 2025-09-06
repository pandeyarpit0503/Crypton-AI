-- Create watchlist table for storing user's favorite cryptocurrencies
CREATE TABLE IF NOT EXISTS public.watchlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    coin_id TEXT NOT NULL,
    coin_name TEXT NOT NULL,
    coin_symbol TEXT NOT NULL,
    coin_nameid TEXT NOT NULL,
    price_usd TEXT NOT NULL,
    percent_change_24h TEXT NOT NULL,
    percent_change_7d TEXT NOT NULL,
    market_cap_usd TEXT NOT NULL,
    volume24 BIGINT NOT NULL DEFAULT 0,
    rank INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure user can't add the same coin twice
    UNIQUE(user_id, coin_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_coin_id ON public.watchlist(coin_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_created_at ON public.watchlist(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own watchlist items
CREATE POLICY "Users can view own watchlist" ON public.watchlist
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own watchlist items
CREATE POLICY "Users can insert own watchlist" ON public.watchlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own watchlist items
CREATE POLICY "Users can update own watchlist" ON public.watchlist
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own watchlist items
CREATE POLICY "Users can delete own watchlist" ON public.watchlist
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_watchlist_updated_at 
    BEFORE UPDATE ON public.watchlist 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON public.watchlist TO authenticated;
GRANT ALL ON public.watchlist TO service_role;
