import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  BarChart3,
  AlertCircle
} from "lucide-react";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { iconUrl, usd, compact } from "@/lib/coinlore";

const Watchlist = () => {
  const { watchlist, removeFromWatchlist, loading } = useWatchlist();
  const navigate = useNavigate();

  const handleRemoveFromWatchlist = async (coinId: string) => {
    // Remove directly without confirmation
    await removeFromWatchlist(coinId);
  };

  const handleCoinClick = (coin: any) => {
    navigate(`/analysis/${coin.nameid}`, {
      state: { coinName: coin.name, symbol: coin.symbol }
    });
  };

  const calculateStats = () => {
    if (watchlist.length === 0) return null;

    const totalValue = watchlist.reduce((sum, coin) => sum + parseFloat(coin.market_cap_usd || '0'), 0);
    const avgChange24h = watchlist.reduce((sum, coin) => sum + parseFloat(coin.percent_change_24h || '0'), 0) / watchlist.length;
    const avgChange7d = watchlist.reduce((sum, coin) => sum + parseFloat(coin.percent_change_7d || '0'), 0) / watchlist.length;
    
    const gainers = watchlist.filter(coin => parseFloat(coin.percent_change_24h || '0') > 0).length;
    const losers = watchlist.filter(coin => parseFloat(coin.percent_change_24h || '0') < 0).length;

    return {
      totalValue,
      avgChange24h,
      avgChange7d,
      gainers,
      losers,
      count: watchlist.length
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
              <CardContent className="py-12">
                <div className="space-y-6">
                  <div className="p-6 bg-muted/20 rounded-lg">
                    <div className="animate-spin w-12 h-12 border-4 border-crypto-blue border-t-transparent rounded-full mx-auto mb-4"></div>
                    <h1 className="text-3xl font-bold mb-2">Loading Watchlist</h1>
                    <p className="text-muted-foreground">
                      Fetching your saved cryptocurrencies...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (watchlist.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
              <CardContent className="py-12">
                <div className="space-y-6">
                  <div className="p-6 bg-muted/20 rounded-lg">
                    <Star className="w-12 h-12 text-crypto-orange mx-auto mb-4" />
                    <h1 className="text-3xl font-bold mb-2">Your Watchlist</h1>
                    <p className="text-muted-foreground mb-4">
                      Start building your cryptocurrency watchlist to track your favorite coins
                    </p>
                  </div>
                  
                  <Button 
                    onClick={() => navigate('/market')}
                    className="bg-crypto-blue hover:bg-crypto-blue/80"
                    size="lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Browse Cryptocurrencies
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
            <CardHeader>
              <CardTitle className="text-3xl font-bold flex items-center gap-3 bg-gradient-primary bg-clip-text text-transparent">
                <Star className="w-8 h-8 text-crypto-orange" />
                My Watchlist
              </CardTitle>
              <p className="text-muted-foreground">
                Track your favorite cryptocurrencies and monitor their performance
              </p>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Coins</p>
                    <p className="text-2xl font-bold">{stats.count}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-crypto-blue" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg 24h Change</p>
                    <p className={`text-2xl font-bold ${
                      stats.avgChange24h >= 0 ? 'text-crypto-green' : 'text-crypto-red'
                    }`}>
                      {stats.avgChange24h >= 0 ? '+' : ''}{stats.avgChange24h.toFixed(2)}%
                    </p>
                  </div>
                  {stats.avgChange24h >= 0 ? 
                    <TrendingUp className="w-8 h-8 text-crypto-green" /> : 
                    <TrendingDown className="w-8 h-8 text-crypto-red" />
                  }
                </div>
              </CardContent>
            </Card>

            <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Gainers</p>
                    <p className="text-2xl font-bold text-crypto-green">{stats.gainers}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-crypto-green" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Losers</p>
                    <p className="text-2xl font-bold text-crypto-red">{stats.losers}</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-crypto-red" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Watchlist Table */}
        <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Cryptocurrencies</CardTitle>
              <Button 
                onClick={() => navigate('/market')}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add More
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {watchlist.map((coin) => {
                const price = parseFloat(coin.price_usd);
                const change24h = parseFloat(coin.percent_change_24h);
                const change7d = parseFloat(coin.percent_change_7d);

                return (
                  <div
                    key={coin.id}
                    className="flex items-center justify-between p-4 border border-glass-border rounded-lg hover:bg-muted/20 transition-colors"
                  >
                    <div 
                      className="flex items-center space-x-4 flex-1 cursor-pointer"
                      onClick={() => handleCoinClick(coin)}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={iconUrl(coin.symbol)}
                          alt={coin.name}
                          className="w-10 h-10 rounded-full"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div>
                          <h3 className="font-semibold">{coin.name}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{coin.symbol}</Badge>
                            <span className="text-sm text-muted-foreground">#{coin.rank}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 ml-4">
                        <div>
                          <p className="font-mono font-bold">{usd(price)}</p>
                          <p className="text-sm text-muted-foreground">{compact(coin.market_cap_usd)} cap</p>
                        </div>
                        
                        <div className="text-center">
                          <div className={`flex items-center justify-center space-x-1 ${
                            change24h >= 0 ? 'text-crypto-green' : 'text-crypto-red'
                          }`}>
                            {change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            <span className="font-medium">{Math.abs(change24h).toFixed(2)}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">24h</p>
                        </div>

                        <div className="text-center">
                          <div className={`flex items-center justify-center space-x-1 ${
                            change7d >= 0 ? 'text-crypto-green' : 'text-crypto-red'
                          }`}>
                            {change7d >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            <span className="font-medium">{Math.abs(change7d).toFixed(2)}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">7d</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleRemoveFromWatchlist(coin.id)}
                      variant="ghost"
                      size="sm"
                      className="text-crypto-red hover:text-crypto-red hover:bg-crypto-red/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Watchlist;
