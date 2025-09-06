-- Debug queries to check watchlist table setup

-- 1. Check if table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'watchlist' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if there are any existing records
SELECT count(*) as total_records FROM public.watchlist;

-- 3. Check current user
SELECT auth.uid() as current_user_id;

-- 4. Check if current user exists in auth.users
SELECT id, email FROM auth.users WHERE id = auth.uid();

-- 5. Try a simple insert with current user (if authenticated)
-- INSERT INTO public.watchlist (
--     user_id, coin_id, coin_name, coin_symbol, coin_nameid, 
--     price_usd, percent_change_24h, percent_change_7d, market_cap_usd
-- ) VALUES (
--     auth.uid(),
--     'debug-test',
--     'Debug Test',
--     'DEBUG',
--     'debug-test',
--     '1.00',
--     '0.0',
--     '0.0',
--     '1000000'
-- );

-- 6. Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'watchlist';

-- 7. Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'watchlist';

-- 8. Test basic permissions
-- SELECT * FROM public.watchlist LIMIT 1;
