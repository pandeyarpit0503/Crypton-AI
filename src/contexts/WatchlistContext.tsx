import React, { createContext, useContext, useState, useEffect } from 'react';
import { watchlistService, WatchlistItem } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface WatchlistCoin {
  id: string;
  name: string;
  symbol: string;
  nameid: string;
  price_usd: string;
  percent_change_24h: string;
  percent_change_7d: string;
  market_cap_usd: string;
  volume24: number;
  rank: number;
}

interface WatchlistContextType {
  watchlist: WatchlistCoin[];
  addToWatchlist: (coin: WatchlistCoin) => Promise<void>;
  removeFromWatchlist: (coinId: string) => Promise<void>;
  isInWatchlist: (coinId: string) => boolean;
  clearWatchlist: () => Promise<void>;
  loading: boolean;
  refreshWatchlist: () => Promise<void>;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<WatchlistCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load watchlist from Supabase when user changes
  useEffect(() => {
    console.log('🔄 User changed:', user?.id || 'No user');
    if (user) {
      console.log('📥 Loading watchlist for user:', user.id);
      loadWatchlist();
    } else {
      // Clear watchlist when user logs out
      console.log('🚪 User logged out, clearing watchlist');
      setWatchlist([]);
      setLoading(false);
    }
  }, [user]);

  const loadWatchlist = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const items = await watchlistService.getWatchlist(user.id);
      const coins: WatchlistCoin[] = items.map(item => ({
        id: item.coin_id,
        name: item.coin_name,
        symbol: item.coin_symbol,
        nameid: item.coin_nameid,
        price_usd: item.price_usd,
        percent_change_24h: item.percent_change_24h,
        percent_change_7d: item.percent_change_7d,
        market_cap_usd: item.market_cap_usd,
        volume24: item.volume24,
        rank: item.rank,
      }));
      setWatchlist(coins);
    } catch (error) {
      console.error('Error loading watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (coin: WatchlistCoin) => {
    console.log('🔄 Adding to watchlist:', coin.name);
    console.log('👤 Current user:', user?.id);
    console.log('📧 User email:', user?.email);
    console.log('🔑 User object:', user);

    if (!user) {
      console.error('❌ User must be logged in to add to watchlist');
      return;
    }

    // Check if coin is already in watchlist
    if (isInWatchlist(coin.id)) {
      console.log('⚠️ Coin already in watchlist:', coin.name);
      return;
    }

    try {
      console.log('📤 Sending to Supabase:', {
        user_id: user.id,
        coin_id: coin.id,
        coin_name: coin.name
      });

      const success = await watchlistService.addToWatchlist(user.id, {
        coin_id: coin.id,
        coin_name: coin.name,
        coin_symbol: coin.symbol,
        coin_nameid: coin.nameid,
        price_usd: coin.price_usd,
        percent_change_24h: coin.percent_change_24h,
        percent_change_7d: coin.percent_change_7d,
        market_cap_usd: coin.market_cap_usd,
        volume24: Math.round(coin.volume24), // Convert to integer
        rank: coin.rank,
      });

      console.log('📥 Supabase response:', success);

      if (success) {
        setWatchlist(prev => [...prev, coin]);
        console.log(`✅ ${coin.name} added to watchlist successfully`);
      } else {
        console.log(`❌ Failed to add ${coin.name} to watchlist`);
      }
    } catch (error) {
      console.error('❌ Error adding to watchlist:', error);
    }
  };

  const removeFromWatchlist = async (coinId: string) => {
    if (!user) {
      console.error('User must be logged in to remove from watchlist');
      return;
    }

    try {
      const success = await watchlistService.removeFromWatchlist(user.id, coinId);
      if (success) {
        const removedCoin = watchlist.find(coin => coin.id === coinId);
        setWatchlist(prev => prev.filter(coin => coin.id !== coinId));
        console.log(`✅ ${removedCoin?.name || 'Coin'} removed from watchlist`);
      } else {
        console.log(`❌ Failed to remove coin from watchlist`);
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const isInWatchlist = (coinId: string) => {
    return watchlist.some(coin => coin.id === coinId);
  };

  const clearWatchlist = async () => {
    if (!user) {
      console.error('User must be logged in to clear watchlist');
      return;
    }

    try {
      const success = await watchlistService.clearWatchlist(user.id);
      if (success) {
        setWatchlist([]);
      }
    } catch (error) {
      console.error('Error clearing watchlist:', error);
    }
  };

  const refreshWatchlist = async () => {
    await loadWatchlist();
  };

  const value = {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    clearWatchlist,
    loading,
    refreshWatchlist,
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
};
