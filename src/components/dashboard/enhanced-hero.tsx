import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Activity, Eye, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { getTickers, usd, iconUrl } from "@/lib/coinlore";
import { useWatchlist } from "@/contexts/WatchlistContext";

interface Row {
  id: string; name: string; symbol: string; price_usd: string; percent_change_24h: string; market_cap_usd: string; volume24: number; rank: number;
}

export function EnhancedHero() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMcap, setTotalMcap] = useState(0);
  const navigate = useNavigate();
  const { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const list = await getTickers(0, 6);
        if (!mounted) return;
        setRows(list as any);
        const mcap = list.reduce((a, c) => a + Number(c.market_cap_usd || 0), 0);
        setTotalMcap(mcap);
      } catch (e) {
        setRows([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    const iv = setInterval(load, 30_000);
    return () => { mounted = false; clearInterval(iv); };
  }, []);

  const handleViewDetails = (coinId: string) => navigate(`/analysis/${coinId}`);

  const handleWatchlistToggle = async (e: React.MouseEvent, coin: Row) => {
    e.stopPropagation(); // Prevent card click
    if (isInWatchlist(coin.id)) {
      await removeFromWatchlist(coin.id);
    } else {
      await addToWatchlist({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        nameid: coin.id, // Using id as nameid fallback
        price_usd: coin.price_usd,
        percent_change_24h: coin.percent_change_24h,
        percent_change_7d: '0', // Not available in Row interface
        market_cap_usd: coin.market_cap_usd,
        volume24: coin.volume24,
        rank: coin.rank,
      });
    }
  };

  // Enhanced image handling with multiple fallbacks
  const getCoinIcon = (symbol: string) => {
    const fallbacks = [
      iconUrl(symbol),
      `https://cryptoicons.org/api/icon/${symbol.toLowerCase()}/200`,
      `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@d5c68edec1f5eaec59ac77ff2b48144679cebca1/svg/color/${symbol.toLowerCase()}.svg`,
      `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/${symbol.toLowerCase()}.svg`,
      `https://via.placeholder.com/40/1e40af/ffffff?text=${symbol.charAt(0)}`
    ];
    return fallbacks[0];
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, symbol: string) => {
    const target = e.currentTarget;
    const fallbacks = [
      `https://cryptoicons.org/api/icon/${symbol.toLowerCase()}/200`,
      `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@d5c68edec1f5eaec59ac77ff2b48144679cebca1/svg/color/${symbol.toLowerCase()}.svg`,
      `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/${symbol.toLowerCase()}.svg`,
      `https://via.placeholder.com/40/1e40af/ffffff?text=${symbol.charAt(0)}`
    ];
    
    const currentSrc = target.src;
    const currentIndex = fallbacks.indexOf(currentSrc);
    
    if (currentIndex < fallbacks.length - 1) {
      target.src = fallbacks[currentIndex + 1];
    } else {
      target.style.display = 'none';
    }
  };

  return (
    <section className="relative py-8 sm:py-12 lg:py-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-crypto" />
      <div className="absolute inset-0 bg-gradient-to-br from-crypto-green/5 via-transparent to-crypto-blue/5" />
      <div className="absolute top-10 sm:top-20 left-4 sm:left-10 w-16 h-16 sm:w-32 sm:h-32 bg-crypto-green/10 rounded-full blur-xl animate-pulse-glow" />
      <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-10 w-12 h-12 sm:w-24 sm:h-24 bg-crypto-blue/10 rounded-full blur-xl animate-pulse-glow" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-primary bg-clip-text text-transparent">Crypton AI</h1>
          <p className="text-sm sm:text-base lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-8 px-4">Advanced cryptocurrency analytics powered by artificial intelligence. Track real-time market data, analyze trends, and discover investment opportunities.</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8 sm:mb-12">
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-crypto-green">{usd(totalMcap)}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total Market Cap</div>
            </div>
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-crypto-blue">24H</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Live Updates</div>
            </div>
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-crypto-orange">AI</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Powered Insights</div>
            </div>
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-crypto-purple">{watchlist.length}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Watchlist</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-4 sm:p-6 bg-glass-bg backdrop-blur-glass border-glass-border animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="space-y-4"><div className="h-4 bg-muted rounded w-3/4" /><div className="h-6 sm:h-8 bg-muted rounded w-1/2" /><div className="h-4 bg-muted rounded w-full" /></div>
              </Card>
            ))
          ) : (
            rows.map((c, idx) => (
              <Card key={c.id} className="group p-4 sm:p-6 bg-glass-bg backdrop-blur-glass border-glass-border hover:border-primary/50 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-primary/20 animate-scale-in cursor-pointer" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="relative flex-shrink-0">
                      <img
                        src={getCoinIcon(c.symbol)}
                        alt={c.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 group-hover:animate-bounce-subtle transition-transform rounded-full"
                        onError={(e) => handleImageError(e, c.symbol)}
                      />
                      <Badge variant="secondary" className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 text-xs px-1 py-0">#{c.rank}</Badge>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm sm:text-base lg:text-lg truncate">{c.symbol.toUpperCase()}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{c.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleWatchlistToggle(e, c)}
                      className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                        isInWatchlist(c.id)
                          ? 'bg-crypto-orange/20 text-crypto-orange hover:bg-crypto-orange/30'
                          : 'bg-muted/20 text-muted-foreground hover:bg-crypto-orange/20 hover:text-crypto-orange'
                      }`}
                      title={isInWatchlist(c.id) ? 'Remove from watchlist' : 'Add to watchlist'}
                    >
                      <Star className={`w-3 h-3 sm:w-4 sm:h-4 ${isInWatchlist(c.id) ? 'fill-current' : ''}`} />
                    </button>
                    <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${Number(c.percent_change_24h) > 0 ? 'bg-crypto-green/20 text-crypto-green' : 'bg-crypto-red/20 text-crypto-red'} group-hover:animate-pulse-glow`}>
                      {Number(c.percent_change_24h) > 0 ? <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </div>
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center"><span className="text-xs sm:text-sm text-muted-foreground">Current Price</span><span className="font-mono font-bold text-sm sm:text-lg lg:text-xl group-hover:text-primary transition-colors">${Number(c.price_usd).toLocaleString()}</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs sm:text-sm text-muted-foreground">24h Change</span><span className={`font-mono font-bold text-sm sm:text-base ${Number(c.percent_change_24h) > 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>{Number(c.percent_change_24h) > 0 ? '+' : ''}{Number(c.percent_change_24h).toFixed(2)}%</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs sm:text-sm text-muted-foreground">Market Cap</span><span className="font-mono text-xs sm:text-sm">{usd(c.market_cap_usd)}</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs sm:text-sm text-muted-foreground">Volume (24h)</span><span className="font-mono text-xs sm:text-sm">{usd(c.volume24)}</span></div>
                </div>
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/50">
                  <button onClick={() => handleViewDetails(c.id)} className="w-full flex items-center justify-center space-x-2 text-primary hover:text-primary-foreground hover:bg-primary transition-all duration-300 py-2 px-3 sm:px-4 rounded-lg border border-primary/30 hover:border-primary group-hover:shadow-lg">
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm font-medium">View Details</span>
                  </button>
                </div>

              </Card>
            ))
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center mt-8 sm:mt-12 space-y-2 sm:space-y-0 sm:space-x-3 animate-fade-in">
          <div className="flex items-center space-x-2"><Activity className="w-4 h-4 sm:w-5 sm:h-5 text-crypto-green animate-pulse" /><span className="text-xs sm:text-sm text-muted-foreground">Live Market Data</span></div>
          <div className="w-2 h-2 bg-crypto-green rounded-full animate-pulse" />
          <span className="text-xs sm:text-sm text-muted-foreground">Updates every 30 seconds</span>
        </div>
      </div>
    </section>
  );
}