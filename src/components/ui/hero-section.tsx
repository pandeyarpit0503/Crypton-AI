import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
}

export function HeroSection() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=6&page=1&sparkline=false'
        );
        const data = await response.json();
        setCryptoData(data);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-crypto opacity-50" />
      
      {/* Content */}
      <div className="relative container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            CryptoTrend AI
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Smart cryptocurrency insights powered by AI. Track real-time prices, analyze trends, and make informed investment decisions.
          </p>
        </div>

        {/* Live crypto cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-6 bg-glass-bg backdrop-blur-glass border-glass-border animate-pulse">
                <div className="h-16 bg-muted rounded-lg" />
              </Card>
            ))
          ) : (
            cryptoData.map((crypto) => (
              <Card key={crypto.id} className="p-6 bg-glass-bg backdrop-blur-glass border-glass-border hover:border-primary/50 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img src={crypto.image} alt={crypto.name} className="w-8 h-8" />
                    <div>
                      <h3 className="font-semibold">{crypto.symbol.toUpperCase()}</h3>
                      <p className="text-sm text-muted-foreground">{crypto.name}</p>
                    </div>
                  </div>
                  {crypto.price_change_percentage_24h > 0 ? (
                    <TrendingUp className="w-5 h-5 text-crypto-green" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-crypto-red" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Price</span>
                    <span className="font-mono font-bold">
                      ${crypto.current_price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">24h Change</span>
                    <span className={`font-mono font-bold ${
                      crypto.price_change_percentage_24h > 0 ? 'text-crypto-green' : 'text-crypto-red'
                    }`}>
                      {crypto.price_change_percentage_24h > 0 ? '+' : ''}
                      {crypto.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Market Cap</span>
                    <span className="font-mono text-sm">
                      ${(crypto.market_cap / 1e9).toFixed(2)}B
                    </span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Live indicator */}
        <div className="flex items-center justify-center mt-8 space-x-2">
          <Activity className="w-4 h-4 text-crypto-green animate-pulse" />
          <span className="text-sm text-muted-foreground">Live data updates every 30 seconds</span>
        </div>
      </div>
    </section>
  );
}