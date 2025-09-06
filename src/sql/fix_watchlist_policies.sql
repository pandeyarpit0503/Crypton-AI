-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own watchlist" ON public.watchlist;
DROP POLICY IF EXISTS "Users can insert own watchlist" ON public.watchlist;
DROP POLICY IF EXISTS "Users can update own watchlist" ON public.watchlist;
DROP POLICY IF EXISTS "Users can delete own watchlist" ON public.watchlist;

-- Temporarily disable RLS to test
ALTER TABLE public.watchlist DISABLE ROW LEVEL SECURITY;

-- Test if basic insert works without RLS
-- You can try adding to watchlist now

-- If it works, re-enable RLS with simpler policies
-- ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Create simpler policies
-- CREATE POLICY "Enable all for authenticated users" ON public.watchlist
--     FOR ALL USING (auth.role() = 'authenticated');

-- Or even simpler - allow all operations for now
-- CREATE POLICY "Allow all" ON public.watchlist FOR ALL USING (true);
