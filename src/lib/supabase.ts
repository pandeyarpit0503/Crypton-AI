import { createClient } from '@supabase/supabase-js'

// Get Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Clean up the URL and key (remove quotes if present)
const cleanUrl = supabaseUrl?.replace(/^["']|["']$/g, '')
const cleanAnonKey = supabaseAnonKey?.replace(/^["']|["']$/g, '')

console.log('Supabase Configuration:', {
  rawUrl: supabaseUrl,
  cleanUrl: cleanUrl,
  urlValid: cleanUrl && cleanUrl.includes('supabase.co'),
  keySet: cleanAnonKey ? 'SET' : 'NOT SET',
  keyLength: cleanAnonKey?.length || 0,
  keyValid: cleanAnonKey && cleanAnonKey.length > 100
})

// Validate Supabase configuration
if (!cleanUrl || !cleanAnonKey) {
  console.error('Missing Supabase configuration. Please check your environment variables.')
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY')
  console.error('Current values:', {
    url: cleanUrl || 'NOT SET',
    key: cleanAnonKey ? 'SET' : 'NOT SET'
  })
}

// Use the cleaned values or placeholder values for development
const defaultUrl = cleanUrl || 'https://placeholder.supabase.co'
const defaultKey = cleanAnonKey || 'placeholder-key'

console.log('Creating Supabase client with:', {
  url: defaultUrl,
  keyLength: defaultKey.length,
  isValidUrl: defaultUrl.includes('supabase.co')
})

export const supabase = createClient(defaultUrl, defaultKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  }
})

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(cleanUrl && cleanAnonKey &&
    cleanUrl !== 'https://your-project.supabase.co' &&
    cleanUrl !== 'https://demo-project.supabase.co' &&
    cleanUrl !== 'https://placeholder.supabase.co' &&
    cleanUrl.includes('supabase.co') &&
    cleanAnonKey !== 'your-anon-key' &&
    cleanAnonKey !== 'demo-anon-key' &&
    cleanAnonKey !== 'placeholder-key' &&
    cleanAnonKey.length > 100) // JWT tokens are much longer
}

// Auth helper functions
export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, userData?: { full_name?: string }) => {
    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        console.error('Supabase not configured')
        return {
          data: null,
          error: {
            message: 'Supabase is not configured. Please set up your environment variables.'
          }
        }
      }

      console.log('=== SIGNUP ATTEMPT ===')
      console.log('Email:', email)
      console.log('Password length:', password.length)
      console.log('User data:', userData)
      console.log('Supabase URL:', defaultUrl)
      console.log('Supabase Key (first 20 chars):', defaultKey?.substring(0, 20))

      const signupPayload = {
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: undefined // Disable email confirmation redirect
        }
      }

      console.log('Signup payload:', signupPayload)

      const { data, error } = await supabase.auth.signUp(signupPayload)

      console.log('=== SIGNUP RESPONSE ===')
      console.log('Data:', data)
      console.log('Error:', error)
      console.log('User created:', !!data?.user)
      console.log('Session created:', !!data?.session)

      if (error) {
        console.error('Signup failed with error:', error)
      } else if (data?.user) {
        console.log('Signup successful! User ID:', data.user.id)
      }

      return { data, error }
    } catch (err) {
      console.error('=== SIGNUP EXCEPTION ===')
      console.error('Exception:', err)
      console.error('Exception type:', typeof err)
      console.error('Exception message:', err instanceof Error ? err.message : 'Unknown error')

      return {
        data: null,
        error: {
          message: err instanceof Error ? err.message : 'An unexpected error occurred during signup'
        }
      }
    }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        return {
          data: null,
          error: {
            message: 'Supabase is not configured. Please set up your environment variables.'
          }
        }
      }

      console.log('Attempting to sign in user:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      console.log('Signin response:', { data, error })
      return { data, error }
    } catch (err) {
      console.error('Signin error:', err)
      return {
        data: null,
        error: {
          message: err instanceof Error ? err.message : 'An unexpected error occurred during signin'
        }
      }
    }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Get current session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Listen to auth changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Reset password
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    return { data, error }
  },

  // Update password
  updatePassword: async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password
    })
    return { data, error }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      console.log('=== GOOGLE SIGNIN ATTEMPT ===')
      console.log('Current origin:', window.location.origin)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      console.log('Google signin response:', { data, error })
      return { data, error }
    } catch (err) {
      console.error('Google signin error:', err)
      return {
        data: null,
        error: {
          message: err instanceof Error ? err.message : 'An unexpected error occurred during Google signin'
        }
      }
    }
  },

  // Test Supabase connection
  testConnection: async () => {
    try {
      console.log('Testing Supabase connection...')
      console.log('Testing URL:', defaultUrl)

      // First test basic connectivity
      try {
        const response = await fetch(`${defaultUrl}/rest/v1/`, {
          method: 'GET',
          headers: {
            'apikey': defaultKey,
            'Authorization': `Bearer ${defaultKey}`
          }
        })
        console.log('Basic connectivity test:', response.status, response.statusText)
      } catch (fetchErr) {
        console.error('Basic fetch failed:', fetchErr)
        return { success: false, error: { message: 'Network connectivity failed', details: fetchErr } }
      }

      // Then test auth endpoint
      const { data, error } = await supabase.auth.getSession()
      console.log('Auth connection test result:', { data, error })
      return { success: !error, error }
    } catch (err) {
      console.error('Connection test failed:', err)
      return { success: false, error: err }
    }
  },

  // Test network connectivity to Supabase
  testNetworkConnectivity: async () => {
    try {
      console.log('Testing network connectivity to Supabase...')
      const response = await fetch(`${defaultUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': defaultKey
        }
      })
      return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        url: defaultUrl
      }
    } catch (err) {
      console.error('Network test failed:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error',
        url: defaultUrl
      }
    }
  }
}

// Watchlist types
export interface WatchlistItem {
  id?: string;
  user_id: string;
  coin_id: string;
  coin_name: string;
  coin_symbol: string;
  coin_nameid: string;
  price_usd: string;
  percent_change_24h: string;
  percent_change_7d: string;
  market_cap_usd: string;
  volume24: number; // Will be converted to integer
  rank: number;
  created_at?: string;
  updated_at?: string;
}

// Watchlist functions
export const watchlistService = {
  // Get user's watchlist
  async getWatchlist(userId: string): Promise<WatchlistItem[]> {
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching watchlist:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getWatchlist:', error);
      return [];
    }
  },

  // Add coin to watchlist
  async addToWatchlist(userId: string, coin: Omit<WatchlistItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    console.log('🚀 Starting addToWatchlist function');
    console.log('📝 Input parameters:', { userId, coin });

    try {
      // First, let's test basic Supabase connectivity
      console.log('🔌 Testing Supabase connection...');
      const { data: connectionTest, error: connectionError } = await supabase
        .from('watchlist')
        .select('count')
        .limit(1);

      if (connectionError) {
        console.error('❌ Supabase connection failed:', connectionError);
        console.error('Connection error details:', {
          message: connectionError.message,
          details: connectionError.details,
          hint: connectionError.hint,
          code: connectionError.code
        });
        return false;
      }
      console.log('✅ Supabase connection successful');

      // Check current user authentication
      console.log('🔐 Checking authentication...');
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        console.error('❌ Authentication check failed:', authError);
        return false;
      }
      console.log('✅ User authenticated:', authData.user.id);
      console.log('🔍 Auth user ID vs provided userId:', {
        authUserId: authData.user.id,
        providedUserId: userId,
        match: authData.user.id === userId
      });

      console.log('🔍 Checking if coin exists in watchlist:', { userId, coinId: coin.coin_id });

      // Check if coin already exists in watchlist
      const { data: existing, error: checkError } = await supabase
        .from('watchlist')
        .select('id')
        .eq('user_id', userId)
        .eq('coin_id', coin.coin_id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking existing watchlist item:', checkError);
        console.error('Check error details:', {
          message: checkError.message,
          details: checkError.details,
          hint: checkError.hint,
          code: checkError.code
        });
        return false;
      }

      if (existing) {
        console.log('⚠️ Coin already in watchlist');
        return false;
      }

      console.log('💾 Attempting to insert new watchlist item...');
      const insertData = {
        user_id: userId,
        ...coin
      };
      console.log('📦 Data to insert:', insertData);

      const { data, error } = await supabase
        .from('watchlist')
        .insert([{
          user_id: userId,
          ...coin
        }])
        .select();

      if (error) {
        console.error('❌ Error adding to watchlist:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });

        // Check specific error types
        if (error.code === '23503') {
          console.error('🔑 Foreign key constraint violation - user does not exist');
        } else if (error.code === '23505') {
          console.error('🔄 Unique constraint violation - coin already in watchlist');
        } else if (error.code === '42501') {
          console.error('🔒 Permission denied - RLS policy issue');
        }

        return false;
      }

      console.log('✅ Successfully added to watchlist:', data);
      return true;
    } catch (error) {
      console.error('❌ Exception in addToWatchlist:', error);
      return false;
    }
  },

  // Remove coin from watchlist
  async removeFromWatchlist(userId: string, coinId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', userId)
        .eq('coin_id', coinId);

      if (error) {
        console.error('Error removing from watchlist:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in removeFromWatchlist:', error);
      return false;
    }
  },

  // Clear entire watchlist
  async clearWatchlist(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error clearing watchlist:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in clearWatchlist:', error);
      return false;
    }
  },

  // Update coin data in watchlist (for price updates)
  async updateWatchlistItem(userId: string, coinId: string, updates: Partial<WatchlistItem>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('watchlist')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('coin_id', coinId);

      if (error) {
        console.error('Error updating watchlist item:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateWatchlistItem:', error);
      return false;
    }
  }
};
