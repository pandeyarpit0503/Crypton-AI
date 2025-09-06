import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Flame, Zap, Star, Eye, Clock, Filter, Crown, ArrowUpDown } from "lucide-react";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { PopularCurrencyAlerts } from "@/components/alerts/PopularCurrencyAlerts";

const getTickers = async (start: number, limit: number) => {
  try {
    const response = await fetch(`https://api.coinlore.net/api/tickers/?start=${start}&limit=${limit}`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching data from CoinLore:", error);
    return [];
  }
};

const iconUrl = (symbol: string) => `https://coinlore.com/img/25x25/${symbol.toLowerCase()}.png`;
const usd = (value: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(value) || 0);
const compact = (value: any) => {
  const num = parseFloat(value) || 0;
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
};

interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  price_usd: string;
  percent_change_24h: string;
  percent_change_1h: string;
  percent_change_7d: string;
  market_cap_usd: string;
  volume24: number;
  rank: number;
}

const Trending = () => {
  const navigate = useNavigate();
  const [coins, setCoins] = useState<TrendingCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("gainers");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getTickers(0, 100);
        setCoins(data || []);
      } catch (error) {
        console.error("Error fetching trending data:", error);
        setCoins([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced image handling with multiple fallbacks
  const getCoinIcon = (symbol: string, name: string) => {
    return iconUrl(symbol);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, symbol: string, id: string) => {
    const target = e.currentTarget;
    setImageErrors(prev => ({ ...prev, [id]: true }));
    
    // Hide the image and show the text fallback
    target.style.display = 'none';
    const fallbackDiv = target.nextElementSibling as HTMLElement;
    if (fallbackDiv) {
      fallbackDiv.style.display = 'flex';
    }
  };

  const trendingData = useMemo(() => {
    if (!coins.length) return { gainers: [], losers: [], hot: [], volatile: [] };

    const parseNum = (v: any) => parseFloat(v || "0");
    
    const gainers = [...coins]
      .filter(c => parseNum(c.percent_change_24h) > 0)
      .sort((a, b) => parseNum(b.percent_change_24h) - parseNum(a.percent_change_24h))
      .slice(0, 12);

    const losers = [...coins]
      .filter(c => parseNum(c.percent_change_24h) < 0)
      .sort((a, b) => parseNum(a.percent_change_24h) - parseNum(b.percent_change_24h))
      .slice(0, 12);

    const hot = [...coins]
      .filter(c => parseNum(c.percent_change_24h) > 2 && c.volume24 > 1000000)
      .sort((a, b) => (parseNum(b.percent_change_24h) * Math.log(b.volume24)) - (parseNum(a.percent_change_24h) * Math.log(a.volume24)))
      .slice(0, 12);

    const volatile = [...coins]
      .sort((a, b) => Math.abs(parseNum(b.percent_change_24h)) - Math.abs(parseNum(a.percent_change_24h)))
      .slice(0, 12);

    return { gainers, losers, hot, volatile };
  }, [coins]);

  const handleCoinClick = (coin: TrendingCoin) => {
    navigate(`/analysis/${coin.id}`, { state: { coinName: coin.name } });
  };

  const handleWatchlistToggle = async (e: React.MouseEvent, coin: TrendingCoin) => {
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
        percent_change_7d: coin.percent_change_7d,
        market_cap_usd: coin.market_cap_usd,
        volume24: coin.volume24,
        rank: coin.rank,
      });
    }
  };

  const CoinCard = ({ coin }: { coin: TrendingCoin }) => {
    const price = parseFloat(coin.price_usd);
    const change24h = parseFloat(coin.percent_change_24h);
    const change1h = parseFloat(coin.percent_change_1h);
    const change7d = parseFloat(coin.percent_change_7d);
    const showFallback = imageErrors[coin.id];

    return (
      <Card
        className="group bg-glass-bg backdrop-blur-glass border-glass-border hover:border-crypto-green/50 hover:scale-105 hover:shadow-xl hover:shadow-crypto-green/20 transition-all duration-500 cursor-pointer overflow-hidden"
        onClick={() => handleCoinClick(coin)}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-card to-muted flex items-center justify-center text-xs sm:text-sm font-bold text-muted-foreground">
                  #{coin.rank}
                </div>
                {coin.rank <= 3 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-crypto-orange rounded-full flex items-center justify-center">
                    <Crown className="w-3 h-3 text-background" />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className="relative flex-shrink-0">
                  {!showFallback ? (
                    <img
                      src={getCoinIcon(coin.symbol, coin.name)}
                      alt={coin.name}
                      className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full shadow-lg"
                      onError={(e) => handleImageError(e, coin.symbol, coin.id)}
                    />
                  ) : null}
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm sm:text-base lg:text-lg ${showFallback ? 'flex' : 'hidden'}`}>
                    {coin.symbol.charAt(0)}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm sm:text-base lg:text-lg text-foreground group-hover:text-crypto-green transition-colors truncate">
                    {coin.name}
                  </h3>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                      {coin.symbol.toUpperCase()}
                    </Badge>
                    {coin.rank <= 10 && (
                      <Badge className="text-xs bg-gradient-to-r from-crypto-orange to-crypto-red text-primary-foreground hidden sm:inline-flex">
                        Top 10
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right flex-shrink-0 min-w-0">
              <p className="font-mono font-bold text-sm sm:text-lg lg:text-xl text-foreground group-hover:text-crypto-green transition-colors break-words">
                {usd(price)}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground break-words">
                {compact(coin.market_cap_usd)} cap
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">1H</p>
              <div className={`flex items-center justify-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                change1h >= 0
                  ? 'bg-crypto-green/20 text-crypto-green'
                  : 'bg-crypto-red/20 text-crypto-red'
              }`}>
                {change1h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{Math.abs(change1h).toFixed(2)}%</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">24H</p>
              <div className={`flex items-center justify-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${
                change24h >= 0
                  ? 'bg-crypto-green/20 text-crypto-green'
                  : 'bg-crypto-red/20 text-crypto-red'
              }`}>
                {change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{Math.abs(change24h).toFixed(2)}%</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">7D</p>
              <div className={`flex items-center justify-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                change7d >= 0
                  ? 'bg-crypto-green/20 text-crypto-green'
                  : 'bg-crypto-red/20 text-crypto-red'
              }`}>
                {change7d >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{Math.abs(change7d).toFixed(2)}%</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Volume</p>
              <p className="text-xs text-foreground font-mono">
                {compact(coin.volume24)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">View Analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => handleWatchlistToggle(e, coin)}
                className={`p-2 rounded-full transition-colors ${
                  isInWatchlist(coin.id)
                    ? 'bg-crypto-orange/20 text-crypto-orange hover:bg-crypto-orange/30'
                    : 'bg-muted/20 text-muted-foreground hover:bg-crypto-orange/20 hover:text-crypto-orange'
                }`}
                title={isInWatchlist(coin.id) ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                <Star className={`w-4 h-4 ${isInWatchlist(coin.id) ? 'fill-current' : ''}`} />
              </button>
              <ArrowUpDown className="w-4 h-4 text-muted-foreground group-hover:text-crypto-green transition-colors" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const LoadingGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <Card key={i} className="bg-glass-bg backdrop-blur-glass border-glass-border">
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="space-y-2">
                  <div className="w-20 h-4 bg-muted rounded"></div>
                  <div className="w-12 h-3 bg-muted rounded"></div>
                </div>
              </div>
              <div className="w-24 h-6 bg-muted rounded mb-4"></div>
              <div className="grid grid-cols-3 gap-3">
                <div className="w-full h-8 bg-muted rounded"></div>
                <div className="w-full h-8 bg-muted rounded"></div>
                <div className="w-full h-8 bg-muted rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-10 space-y-10">
        {/* Header */}
        <div className="animate-fade-in">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-4xl font-bold flex items-center space-x-3 bg-gradient-primary bg-clip-text text-transparent">
                    <Flame className="w-10 h-10 text-crypto-green" />
                    <span>Trending Cryptocurrencies</span>
                  </CardTitle>
                  <p className="text-gray-400 text-lg mt-2">
                    Real-time market movers and trending digital assets
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm">Updates every 30s</span>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Smart Market Alerts */}
        <div className="animate-fade-in">
          <PopularCurrencyAlerts maxAlerts={4} showHeader={true} compact={true} />
        </div>

        {/* Trending Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-fade-in">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-gray-900 border-gray-700">
            <TabsTrigger value="gainers" className="flex items-center space-x-2 data-[state=active]:bg-crypto-green">
              <TrendingUp className="w-4 h-4" />
              <span>Top Gainers</span>
            </TabsTrigger>
            <TabsTrigger value="losers" className="flex items-center space-x-2 data-[state=active]:bg-crypto-red">
              <TrendingDown className="w-4 h-4" />
              <span>Top Losers</span>
            </TabsTrigger>
            <TabsTrigger value="hot" className="flex items-center space-x-2 data-[state=active]:bg-crypto-orange">
              <Zap className="w-4 h-4" />
              <span>Hot</span>
            </TabsTrigger>
            <TabsTrigger value="volatile" className="flex items-center space-x-2 data-[state=active]:bg-crypto-purple">
              <Filter className="w-4 h-4" />
              <span>Most Volatile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gainers" className="animate-fade-in">
            {loading ? (
              <LoadingGrid />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {trendingData.gainers.map((coin) => (
                  <CoinCard key={coin.id} coin={coin} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="losers" className="animate-fade-in">
            {loading ? (
              <LoadingGrid />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {trendingData.losers.map((coin) => (
                  <CoinCard key={coin.id} coin={coin} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="hot" className="animate-fade-in">
            {loading ? (
              <LoadingGrid />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {trendingData.hot.map((coin) => (
                  <CoinCard key={coin.id} coin={coin} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="volatile" className="animate-fade-in">
            {loading ? (
              <LoadingGrid />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {trendingData.volatile.map((coin) => (
                  <CoinCard key={coin.id} coin={coin} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <Card className="bg-gradient-to-br from-crypto-green/20 to-crypto-green/10 border-crypto-green/30">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-crypto-green mx-auto mb-2" />
              <h3 className="font-bold text-lg text-white">
                {trendingData.gainers.length}
              </h3>
              <p className="text-sm text-gray-400">Assets Gaining</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-crypto-red/20 to-crypto-red/10 border-crypto-red/30">
            <CardContent className="p-6 text-center">
              <TrendingDown className="w-8 h-8 text-crypto-red mx-auto mb-2" />
              <h3 className="font-bold text-lg text-white">
                {trendingData.losers.length}
              </h3>
              <p className="text-sm text-gray-400">Assets Declining</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-crypto-orange/20 to-crypto-orange/10 border-crypto-orange/30">
            <CardContent className="p-6 text-center">
              <Zap className="w-8 h-8 text-crypto-orange mx-auto mb-2" />
              <h3 className="font-bold text-lg text-white">
                {trendingData.hot.length}
              </h3>
              <p className="text-sm text-gray-400">Hot Assets</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Trending;