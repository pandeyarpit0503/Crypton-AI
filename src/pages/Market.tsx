import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  BarChart3, 
  DollarSign, 
  Activity,
  Crown,
  Coins,
  ArrowUpDown,
  Filter,
  Star,
  Eye
} from "lucide-react";
import { getTickers, getGlobal, iconUrl, usd, compact } from "@/lib/coinlore";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { PopularCurrencyAlerts } from "@/components/alerts/PopularCurrencyAlerts";

interface MarketCoin {
  id: string;
  name: string;
  symbol: string;
  nameid: string;
  price_usd: string;
  percent_change_24h: string;
  percent_change_1h: string;
  percent_change_7d: string;
  market_cap_usd: string;
  volume24: number;
  rank: number;
  csupply: string;
  tsupply: string;
}

interface GlobalData {
  coins_count: number;
  active_markets: number;
  total_mcap: number;
  total_volume: number;
  btc_d: number;
  eth_d: number;
  mcap_change: number;
  volume_change: number;
}

const Market = () => {
  const [coins, setCoins] = useState<MarketCoin[]>([]);
  const [globalData, setGlobalData] = useState<GlobalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'rank' | 'price' | 'change24h' | 'marketcap' | 'volume'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [coinData, globalStats] = await Promise.all([
          getTickers(0, 100),
          getGlobal()
        ]);

        console.log('Global stats received:', globalStats);
        setCoins(coinData || []);

        // Transform global data to match our interface
        if (globalStats && Array.isArray(globalStats) && globalStats.length > 0) {
          const stats = globalStats[0];
          setGlobalData({
            coins_count: stats.coins_count || 0,
            active_markets: stats.active_markets || 0,
            total_mcap: stats.total_mcap || 0,
            total_volume: stats.total_volume || 0,
            btc_d: parseFloat(stats.btc_d) || 0,
            eth_d: parseFloat(stats.eth_d) || 0,
            mcap_change: parseFloat(stats.mcap_change) || 0,
            volume_change: parseFloat(stats.volume_change) || 0,
          });
        } else if (globalStats && typeof globalStats === 'object') {
          setGlobalData({
            coins_count: globalStats.coins_count || 0,
            active_markets: globalStats.active_markets || 0,
            total_mcap: globalStats.total_mcap || 0,
            total_volume: globalStats.total_volume || 0,
            btc_d: parseFloat(String(globalStats.btc_d || 0)),
            eth_d: parseFloat(String(globalStats.eth_d || 0)),
            mcap_change: parseFloat(String(globalStats.mcap_change || 0)),
            volume_change: parseFloat(String(globalStats.volume_change || 0)),
          });
        } else {
          // Fallback: calculate from coin data
          const totalMcap = coinData?.reduce((sum, coin) => sum + parseFloat(coin.market_cap_usd || '0'), 0) || 0;
          const totalVolume = coinData?.reduce((sum, coin) => sum + (coin.volume24 || 0), 0) || 0;
          const btcCoin = coinData?.find(coin => coin.symbol === 'BTC');
          const btcDominance = btcCoin ? (parseFloat(btcCoin.market_cap_usd || '0') / totalMcap) * 100 : 0;

          setGlobalData({
            coins_count: coinData?.length || 0,
            active_markets: 0,
            total_mcap: totalMcap,
            total_volume: totalVolume,
            btc_d: btcDominance,
            eth_d: 0,
            mcap_change: 0,
            volume_change: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching market data:", error);
        setCoins([]);
        setGlobalData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredAndSortedCoins = useMemo(() => {
    let filtered = coins;

    if (searchTerm) {
      filtered = coins.filter(coin => 
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeTab === 'top10') {
      filtered = filtered.filter(coin => coin.rank <= 10);
    } else if (activeTab === 'gainers') {
      filtered = filtered.filter(coin => parseFloat(coin.percent_change_24h) > 0);
    } else if (activeTab === 'losers') {
      filtered = filtered.filter(coin => parseFloat(coin.percent_change_24h) < 0);
    }

    const sorted = [...filtered].sort((a, b) => {
      let aVal: number, bVal: number;
      
      switch (sortBy) {
        case 'rank':
          aVal = a.rank;
          bVal = b.rank;
          break;
        case 'price':
          aVal = parseFloat(a.price_usd);
          bVal = parseFloat(b.price_usd);
          break;
        case 'change24h':
          aVal = parseFloat(a.percent_change_24h);
          bVal = parseFloat(b.percent_change_24h);
          break;
        case 'marketcap':
          aVal = parseFloat(a.market_cap_usd);
          bVal = parseFloat(b.market_cap_usd);
          break;
        case 'volume':
          aVal = a.volume24;
          bVal = b.volume24;
          break;
        default:
          aVal = a.rank;
          bVal = b.rank;
      }
      
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return sorted;
  }, [coins, searchTerm, sortBy, sortOrder, activeTab]);



  const handleCoinClick = (coin: MarketCoin) => {
    navigate(`/analysis/${coin.id}`, { 
      state: { coinName: coin.name, symbol: coin.symbol } 
    });
  };

  // Helper function to format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatVolume = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  };

  const MarketStatsCard = () => {
    if (!globalData) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="bg-glass-bg backdrop-blur-glass border-glass-border hover:border-crypto-green/50 hover:shadow-xl hover:shadow-crypto-green/20 transition-all duration-500">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-crypto-green/80 font-medium">Total Market Cap</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground break-words">{formatNumber(globalData.total_mcap)}</p>
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                    globalData.mcap_change >= 0
                      ? 'bg-crypto-green/20 text-crypto-green'
                      : 'bg-crypto-red/20 text-crypto-red'
                  }`}>
                    {globalData.mcap_change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{Math.abs(globalData.mcap_change).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-crypto-green/20 rounded-xl flex-shrink-0">
                <DollarSign className="w-6 h-6 text-crypto-green" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-glass-bg backdrop-blur-glass border-glass-border hover:border-crypto-blue/50 hover:shadow-xl hover:shadow-crypto-blue/20 transition-all duration-500">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-crypto-blue/80 font-medium">24h Volume</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground break-words">{formatVolume(globalData.total_volume)}</p>
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                    globalData.volume_change >= 0
                      ? 'bg-crypto-green/20 text-crypto-green'
                      : 'bg-crypto-red/20 text-crypto-red'
                  }`}>
                    {globalData.volume_change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{Math.abs(globalData.volume_change).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-crypto-blue/20 rounded-xl flex-shrink-0">
                <Activity className="w-6 h-6 text-crypto-blue" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-glass-bg backdrop-blur-glass border-glass-border hover:border-crypto-orange/50 hover:shadow-xl hover:shadow-crypto-orange/20 transition-all duration-500">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-crypto-orange/80 font-medium">BTC Dominance</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground break-words">{globalData.btc_d?.toFixed(1)}%</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  ETH: {globalData.eth_d?.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-crypto-orange/20 rounded-xl flex-shrink-0">
                <Crown className="w-6 h-6 text-crypto-orange" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-glass-bg backdrop-blur-glass border-glass-border hover:border-crypto-purple/50 hover:shadow-xl hover:shadow-crypto-purple/20 transition-all duration-500">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-crypto-purple/80 font-medium">Active Coins</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground break-words">{globalData.coins_count?.toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {globalData.active_markets?.toLocaleString()} markets
                </p>
              </div>
              <div className="p-3 bg-crypto-purple/20 rounded-xl flex-shrink-0">
                <Coins className="w-6 h-6 text-crypto-purple" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const CoinCard = ({ coin, index }: { coin: MarketCoin; index: number }) => {
    const price = parseFloat(coin.price_usd);
    const change24h = parseFloat(coin.percent_change_24h);
    const change1h = parseFloat(coin.percent_change_1h);
    const change7d = parseFloat(coin.percent_change_7d);

    const handleWatchlistToggle = async (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click
      if (isInWatchlist(coin.id)) {
        await removeFromWatchlist(coin.id);
      } else {
        await addToWatchlist({
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          nameid: coin.nameid,
          price_usd: coin.price_usd,
          percent_change_24h: coin.percent_change_24h,
          percent_change_7d: coin.percent_change_7d,
          market_cap_usd: coin.market_cap_usd,
          volume24: coin.volume24,
          rank: coin.rank,
        });
      }
    };

    return (
      <Card
        className="group bg-glass-bg backdrop-blur-glass border-glass-border hover:border-crypto-green/50 hover:scale-105 hover:shadow-xl hover:shadow-crypto-green/20 transition-all duration-500 cursor-pointer overflow-hidden animate-scale-in"
        style={{ animationDelay: `${index * 0.1}s` }}
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
                  <img
                    src={iconUrl(coin.symbol)}
                    alt={coin.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full shadow-lg group-hover:animate-bounce-subtle transition-transform"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm sm:text-base lg:text-lg">
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
              } group-hover:animate-pulse-glow`}>
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
                onClick={handleWatchlistToggle}
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
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <Card key={i} className="bg-glass-bg backdrop-blur-glass border-glass-border">
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="space-y-2">
                  <div className="w-24 h-4 bg-muted rounded"></div>
                  <div className="w-16 h-3 bg-muted rounded"></div>
                </div>
              </div>
              <div className="w-24 h-6 bg-muted rounded mb-4"></div>
              <div className="grid grid-cols-4 gap-4 mb-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="w-full h-12 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center space-x-2 sm:space-x-3 bg-gradient-primary bg-clip-text text-transparent">
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-crypto-green" />
                <span className="break-words">Cryptocurrency Market</span>
              </CardTitle>
              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
                Real-time prices, market caps, and trading data for top cryptocurrencies
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-full sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search cryptocurrencies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 sm:pl-10 bg-card border-border text-foreground placeholder-muted-foreground focus:border-primary/50"
                  />
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-card border-border">
                    <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm">All</TabsTrigger>
                    <TabsTrigger value="top10" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm">Top 10</TabsTrigger>
                    <TabsTrigger value="gainers" className="data-[state=active]:bg-crypto-green data-[state=active]:text-primary-foreground text-xs sm:text-sm">Gainers</TabsTrigger>
                    <TabsTrigger value="losers" className="data-[state=active]:bg-crypto-red data-[state=active]:text-primary-foreground text-xs sm:text-sm">Losers</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Smart Market Alerts */}
        <div className="animate-fade-in">
          <PopularCurrencyAlerts maxAlerts={4} showHeader={true} compact={true} />
        </div>

        {/* Market Stats */}
        <div className="animate-fade-in">
          <MarketStatsCard />
        </div>

        {/* Market Data */}
        <div className="animate-fade-in">
          <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-foreground">
                  Market Overview
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  Showing {filteredAndSortedCoins.length} of {coins.length} cryptocurrencies
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <LoadingGrid />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {filteredAndSortedCoins.map((coin, index) => (
                    <CoinCard key={coin.id} coin={coin} index={index} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Market;
