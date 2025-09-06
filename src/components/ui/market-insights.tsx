import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, Zap } from "lucide-react";

interface MarketData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap_rank: number;
  image: string;
}

interface Insight {
  type: 'bullish' | 'bearish' | 'neutral';
  title: string;
  description: string;
  coin: string;
  icon: any;
}

export function MarketInsights() {
  const [topGainers, setTopGainers] = useState<MarketData[]>([]);
  const [topLosers, setTopLosers] = useState<MarketData[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false'
        );
        const data = await response.json();
        
        // Sort by 24h change percentage
        const sorted = data.sort((a: MarketData, b: MarketData) => 
          b.price_change_percentage_24h - a.price_change_percentage_24h
        );
        
        const gainers = sorted.slice(0, 3);
        const losers = sorted.slice(-3).reverse();
        
        setTopGainers(gainers);
        setTopLosers(losers);
        
        // Generate AI insights based on market data
        const generatedInsights: Insight[] = [];
        
        if (gainers.length > 0) {
          const topGainer = gainers[0];
          if (topGainer.price_change_percentage_24h > 20) {
            generatedInsights.push({
              type: 'bullish',
              title: 'Strong Bullish Momentum',
              description: `${topGainer.name} is showing exceptional growth with ${topGainer.price_change_percentage_24h.toFixed(1)}% gains in 24h.`,
              coin: topGainer.symbol.toUpperCase(),
              icon: TrendingUp
            });
          }
        }
        
        if (losers.length > 0) {
          const topLoser = losers[0];
          if (Math.abs(topLoser.price_change_percentage_24h) > 15) {
            generatedInsights.push({
              type: 'bearish',
              title: 'Significant Price Correction',
              description: `${topLoser.name} is experiencing a major dip of ${Math.abs(topLoser.price_change_percentage_24h).toFixed(1)}%. Could be a buying opportunity.`,
              coin: topLoser.symbol.toUpperCase(),
              icon: TrendingDown
            });
          }
        }
        
        // Add general market insights
        const avgChange = data.slice(0, 20).reduce((acc: number, coin: MarketData) => 
          acc + coin.price_change_percentage_24h, 0) / 20;
        
        if (avgChange > 5) {
          generatedInsights.push({
            type: 'bullish',
            title: 'Market-Wide Optimism',
            description: 'The top 20 cryptocurrencies are showing positive momentum. Bull market sentiment detected.',
            coin: 'MARKET',
            icon: Target
          });
        } else if (avgChange < -5) {
          generatedInsights.push({
            type: 'bearish',
            title: 'Market Correction',
            description: 'Widespread decline across major cryptocurrencies. Consider dollar-cost averaging.',
            coin: 'MARKET',
            icon: Target
          });
        } else {
          generatedInsights.push({
            type: 'neutral',
            title: 'Market Consolidation',
            description: 'Markets are moving sideways. Good time to research and prepare for the next trend.',
            coin: 'MARKET',
            icon: Zap
          });
        }
        
        setInsights(generatedInsights);
      } catch (error) {
        console.error('Error fetching market data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const renderCoinList = (coins: MarketData[], title: string, isGainers: boolean) => (
    <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {isGainers ? (
            <TrendingUp className="w-5 h-5 text-crypto-green" />
          ) : (
            <TrendingDown className="w-5 h-5 text-crypto-red" />
          )}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg" />
              </div>
            ))
          ) : (
            coins.map((coin) => (
              <div key={coin.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <img src={coin.image} alt={coin.name} className="w-8 h-8" />
                  <div>
                    <h4 className="font-semibold">{coin.symbol.toUpperCase()}</h4>
                    <p className="text-sm text-muted-foreground">{coin.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold">${coin.current_price.toLocaleString()}</p>
                  <p className={`text-sm font-mono ${
                    coin.price_change_percentage_24h > 0 ? 'text-crypto-green' : 'text-crypto-red'
                  }`}>
                    {coin.price_change_percentage_24h > 0 ? '+' : ''}
                    {coin.price_change_percentage_24h.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Market Movers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderCoinList(topGainers, "Top Gainers (24h)", true)}
        {renderCoinList(topLosers, "Top Losers (24h)", false)}
      </div>

      {/* AI Insights */}
      <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-crypto-orange" />
            <span>AI Market Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-muted rounded-lg" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight, index) => {
                const IconComponent = insight.icon;
                return (
                  <div key={index} className="p-4 rounded-lg bg-muted/20 border border-border/50">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${
                        insight.type === 'bullish' ? 'bg-crypto-green/20' :
                        insight.type === 'bearish' ? 'bg-crypto-red/20' :
                        'bg-crypto-blue/20'
                      }`}>
                        <IconComponent className={`w-4 h-4 ${
                          insight.type === 'bullish' ? 'text-crypto-green' :
                          insight.type === 'bearish' ? 'text-crypto-red' :
                          'text-crypto-blue'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold">{insight.title}</h4>
                          <Badge variant={insight.type === 'bullish' ? 'default' : 'secondary'}>
                            {insight.coin}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}