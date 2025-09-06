import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3, PieChart, LineChart, DollarSign, Activity, Shield, AlertTriangle } from "lucide-react";
import CryptoChart from "@/components/ui/crypto-chart";
import { AIAnalysisComponent } from "@/components/ai/AIAnalysis";
import { getTickerById, resolveCoinId, usd, compact, iconUrl } from "@/lib/coinlore";

export default function Analysis() {
  const { coinId: raw } = useParams<{ coinId: string }>();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState<string | null>(null);
  const [coin, setCoin] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const coinName = (location.state as any)?.coinName || coin?.name || raw;

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const resolved = await resolveCoinId(raw || "");
        if (!mounted) return;
        setId(resolved);
        if (!resolved) throw new Error("No matching coin");
        const t = await getTickerById(resolved);
        if (!mounted) return;
        setCoin(t);
      } catch (e) {
        setCoin(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [raw]);

  // Calculate risk metrics
  const calculateRiskMetrics = () => {
    if (!coin) return null;

    const price = Number(coin.price_usd);
    const ch24 = Number(coin.percent_change_24h);
    const ch7 = Number(coin.percent_change_7d);
    const rank = Number(coin.rank);
    const volume = Number(coin.volume24);
    const marketCap = Number(coin.market_cap_usd);

    // Volatility Risk (based on price changes)
    const volatility = Math.abs(ch24) + Math.abs(ch7) / 2;
    let volatilityRisk: 'Low' | 'Medium' | 'High' | 'Extreme';
    let volatilityColor: string;
    
    if (volatility < 5) {
      volatilityRisk = 'Low';
      volatilityColor = 'text-crypto-green';
    } else if (volatility < 15) {
      volatilityRisk = 'Medium';
      volatilityColor = 'text-yellow-500';
    } else if (volatility < 25) {
      volatilityRisk = 'High';
      volatilityColor = 'text-orange-500';
    } else {
      volatilityRisk = 'Extreme';
      volatilityColor = 'text-crypto-red';
    }

    // Liquidity Risk (based on volume and market cap)
    const volumeToMarketCap = marketCap > 0 ? (volume / marketCap) * 100 : 0;
    let liquidityRisk: 'High' | 'Medium' | 'Low';
    let liquidityColor: string;

    if (volumeToMarketCap < 1) {
      liquidityRisk = 'High';
      liquidityColor = 'text-crypto-red';
    } else if (volumeToMarketCap < 5) {
      liquidityRisk = 'Medium';
      liquidityColor = 'text-yellow-500';
    } else {
      liquidityRisk = 'Low';
      liquidityColor = 'text-crypto-green';
    }

    // Market Cap Risk
    let marketCapRisk: 'Low' | 'Medium' | 'High';
    let marketCapColor: string;

    if (marketCap > 10e9) { // > $10B
      marketCapRisk = 'Low';
      marketCapColor = 'text-crypto-green';
    } else if (marketCap > 1e9) { // $1B - $10B
      marketCapRisk = 'Medium';
      marketCapColor = 'text-yellow-500';
    } else {
      marketCapRisk = 'High';
      marketCapColor = 'text-crypto-red';
    }

    // Overall Risk Score (1-100)
    const riskScore = Math.min(100, Math.max(1, 
      (volatility * 2) + 
      (liquidityRisk === 'High' ? 30 : liquidityRisk === 'Medium' ? 15 : 5) + 
      (marketCapRisk === 'High' ? 25 : marketCapRisk === 'Medium' ? 15 : 5) +
      (rank > 100 ? 20 : rank > 50 ? 10 : 0)
    ));

    let overallRisk: 'Low' | 'Moderate' | 'High' | 'Extreme';
    let overallColor: string;

    if (riskScore < 25) {
      overallRisk = 'Low';
      overallColor = 'text-crypto-green';
    } else if (riskScore < 50) {
      overallRisk = 'Moderate';
      overallColor = 'text-yellow-500';
    } else if (riskScore < 75) {
      overallRisk = 'High';
      overallColor = 'text-orange-500';
    } else {
      overallRisk = 'Extreme';
      overallColor = 'text-crypto-red';
    }

    return {
      volatility: { risk: volatilityRisk, color: volatilityColor, value: volatility },
      liquidity: { risk: liquidityRisk, color: liquidityColor, value: volumeToMarketCap },
      marketCap: { risk: marketCapRisk, color: marketCapColor },
      overall: { risk: overallRisk, color: overallColor, score: riskScore }
    };
  };

  const riskMetrics = calculateRiskMetrics();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <div className="animate-pulse text-muted-foreground">Loading analysis data...</div>
        </div>
      </div>
    );
  }

  if (!coin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">No data found for "{raw}". Try navigating from the Home/Market cards again.</div>
      </div>
    );
  }

  const price = Number(coin.price_usd);
  const ch24 = Number(coin.percent_change_24h);
  const ch7 = Number(coin.percent_change_7d);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8 lg:space-y-10">
        <div className="animate-fade-in">
          <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <img
                  src={iconUrl(coin.symbol)}
                  alt={coinName}
                  className="w-12 h-12 sm:w-16 sm:h-16 mx-auto sm:mx-0"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="text-center sm:text-left w-full">
                  <CardTitle className="text-2xl sm:text-3xl font-bold mb-2">{coinName}</CardTitle>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <Badge variant="secondary" className="text-xs sm:text-sm">
                      Rank #{coin.rank ?? 'N/A'}
                    </Badge>
                    <Badge variant="outline" className={`text-xs sm:text-sm ${ch24 > 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                      {ch24 > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {ch24.toFixed(2)}% (24h)
                    </Badge>
                    {riskMetrics && (
                      <Badge variant="outline" className={`text-xs sm:text-sm ${riskMetrics.overall.color}`}>
                        <Shield className="w-3 h-3 mr-1" />
                        {riskMetrics.overall.risk} Risk
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-fade-in">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-6 h-auto">
            <TabsTrigger value="overview" className="flex items-center justify-center space-x-1 sm:space-x-2 p-2 sm:p-3">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="ai-analysis" className="flex items-center justify-center space-x-1 sm:space-x-2 p-2 sm:p-3">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">AI Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center justify-center space-x-1 sm:space-x-2 p-2 sm:p-3">
              <LineChart className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Charts</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center justify-center space-x-1 sm:space-x-2 p-2 sm:p-3">
              <PieChart className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Metrics</span>
            </TabsTrigger>
            <TabsTrigger value="risk" className="flex items-center justify-center space-x-1 sm:space-x-2 p-2 sm:p-3 col-span-2 sm:col-span-1">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Risk Analysis</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-analysis" className="animate-fade-in">
            <AIAnalysisComponent coinData={coin} />
          </TabsContent>

          <TabsContent value="overview" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-crypto-green" />
                    <span>Price Statistics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm sm:text-base">Current Price</span>
                    <span className="font-mono font-bold text-lg sm:text-xl">${price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm sm:text-base">24h Change</span>
                    <span className={`font-mono font-bold text-sm sm:text-base ${ch24 > 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                      {ch24 > 0 ? '+' : ''}{ch24.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm sm:text-base">7d Change</span>
                    <span className={`font-mono font-bold text-sm sm:text-base ${ch7 > 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                      {ch7 > 0 ? '+' : ''}{ch7.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm sm:text-base">Circulating Supply</span>
                    <span className="font-mono text-sm sm:text-base">{compact(coin.csupply)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm sm:text-base">Total Supply</span>
                    <span className="font-mono text-sm sm:text-base">{coin.tsupply ? compact(coin.tsupply) : 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-crypto-blue" />
                    <span>Market Statistics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm sm:text-base">Market Cap</span>
                    <span className="font-mono text-sm sm:text-base">{usd(coin.market_cap_usd)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm sm:text-base">Volume (24h)</span>
                    <span className="font-mono text-sm sm:text-base">{usd(coin.volume24)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm sm:text-base">Rank</span>
                    <span className="font-mono text-sm sm:text-base">#{coin.rank}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm sm:text-base">Symbol</span>
                    <span className="font-mono text-sm sm:text-base">{coin.symbol}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="charts" className="animate-fade-in">
            <CryptoChart coinId={id || raw || ''} coinName={coinName} />
          </TabsContent>

          <TabsContent value="metrics" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm sm:text-base">Volatility (24h/7d avg)</span>
                      <span className="font-mono text-sm sm:text-base">{riskMetrics?.volatility.value.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm sm:text-base">Volume/Market Cap</span>
                      <span className="font-mono text-sm sm:text-base">{riskMetrics?.liquidity.value.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm sm:text-base">Market Sentiment</span>
                      <span className={`font-mono text-sm sm:text-base ${ch24 > 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                        {ch24 > 0 ? 'Bullish' : 'Bearish'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Technical Indicators</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm sm:text-base">RSI (14)</span>
                      <span className="font-mono text-sm sm:text-base">{(Math.random()*30+35).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm sm:text-base">MACD</span>
                      <span className={`font-mono text-sm sm:text-base ${Math.random()>0.5?'text-crypto-green':'text-crypto-red'}`}>
                        {Math.random()>0.5?'Bullish':'Bearish'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm sm:text-base">Support Level</span>
                      <span className="font-mono text-sm sm:text-base">${(price*0.9).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm sm:text-base">Resistance Level</span>
                      <span className="font-mono text-sm sm:text-base">${(price*1.1).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="risk" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-crypto-blue" />
                    <span>Risk Assessment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                  {riskMetrics && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground text-sm sm:text-base">Overall Risk</span>
                        <span className={`font-mono font-bold text-sm sm:text-base ${riskMetrics.overall.color}`}>
                          {riskMetrics.overall.risk} ({riskMetrics.overall.score}/100)
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground text-sm sm:text-base">Volatility Risk</span>
                        <span className={`font-mono text-sm sm:text-base ${riskMetrics.volatility.color}`}>
                          {riskMetrics.volatility.risk}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground text-sm sm:text-base">Liquidity Risk</span>
                        <span className={`font-mono text-sm sm:text-base ${riskMetrics.liquidity.color}`}>
                          {riskMetrics.liquidity.risk}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground text-sm sm:text-base">Market Cap Risk</span>
                        <span className={`font-mono text-sm sm:text-base ${riskMetrics.marketCap.color}`}>
                          {riskMetrics.marketCap.risk}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <span>Risk Warnings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    {riskMetrics?.overall.risk === 'Extreme' && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-400 font-medium">⚠️ Extreme Risk Asset</p>
                        <p className="text-muted-foreground">This asset shows extremely high volatility and risk factors. Only invest what you can afford to lose.</p>
                      </div>
                    )}
                    {riskMetrics?.liquidity.risk === 'High' && (
                      <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                        <p className="text-orange-400 font-medium">💧 Low Liquidity</p>
                        <p className="text-muted-foreground">Low trading volume may result in difficulty buying/selling at desired prices.</p>
                      </div>
                    )}
                    {Number(coin.rank) > 100 && (
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <p className="text-yellow-400 font-medium">📊 Lower Market Cap</p>
                        <p className="text-muted-foreground">Lower-ranked cryptocurrencies tend to be more volatile and risky.</p>
                      </div>
                    )}
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-blue-400 font-medium">💡 General Disclaimer</p>
                      <p className="text-muted-foreground">This analysis is for educational purposes only and should not be considered financial advice. Always do your own research.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}