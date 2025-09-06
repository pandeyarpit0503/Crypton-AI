import { useEffect, useMemo, useRef, useState, useCallback, memo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { buildSyntheticSeries, getTickerById, resolveCoinId, getHistoricalData } from "@/lib/coinlore";

interface ChartPoint { time: string; price: number; timestamp: number }
interface Props { coinId?: string; coinName?: string }

function CryptoChart({ coinId = "90", coinName = "Bitcoin" }: Props) {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const [initialPrice, setInitialPrice] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Clear interval and set mounted flag on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    async function initializeChart() {
      if (!mountedRef.current) return;

      setLoading(true);
      setIsUpdating(false);

      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      try {
        // Resolve coin ID
        const id = await resolveCoinId(coinId);
        if (!mountedRef.current) return;

        if (!id) {
          throw new Error(`Unable to resolve coin id: ${coinId}`);
        }

        setResolvedId(id);

        // Get current ticker data
        const ticker = await getTickerById(id);
        if (!mountedRef.current) return;

        const price = Number(ticker?.price_usd ?? 0);
        setCurrentPrice(price);

        // Get historical data
        try {
          const historicalData = await getHistoricalData(id, 24);
          if (mountedRef.current && historicalData && historicalData.length > 0) {
            setData(historicalData);
            const firstPrice = historicalData[0]?.price ?? price;
            setInitialPrice(firstPrice);
            const change = firstPrice > 0 ? ((price - firstPrice) / firstPrice) * 100 : 0;
            setPriceChange(change);
          } else {
            throw new Error("No historical data available");
          }
        } catch (historicalError) {
          console.warn("Historical data failed, using synthetic:", historicalError);
          // Use realistic volatility based on ticker data
          const volatility = ticker?.percent_change_24h
            ? Math.abs(Number(ticker.percent_change_24h)) / 100 * 0.3
            : 0.02;
          const series = buildSyntheticSeries(price, 24, volatility);

          if (mountedRef.current) {
            setData(series);
            const firstPrice = series[0]?.price ?? price;
            setInitialPrice(firstPrice);
            const change = firstPrice > 0 ? ((price - firstPrice) / firstPrice) * 100 : 0;
            setPriceChange(change);
          }
        }
      } catch (error) {
        console.error("Error loading chart data:", error);
        if (mountedRef.current) {
          // Fallback to default data with current Bitcoin price
          const fallbackPrice = 115000;
          const series = buildSyntheticSeries(fallbackPrice, 24);
          setData(series);
          setCurrentPrice(series[series.length - 1].price);
          setInitialPrice(series[0].price);
          setPriceChange(0);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    }

    initializeChart();
  }, [coinId]);

  // Separate effect for real-time updates (less frequent and more stable)
  useEffect(() => {
    if (!resolvedId || loading || !mountedRef.current) return;

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Set up real-time updates with longer intervals for stability
    intervalRef.current = setInterval(async () => {
      if (!mountedRef.current || isUpdating) return;

      try {
        setIsUpdating(true);
        const ticker = await getTickerById(resolvedId);

        if (!mountedRef.current) return;

        const newPrice = Number(ticker?.price_usd ?? currentPrice);

        // Only update if price has changed significantly (reduce unnecessary updates)
        const priceChangeThreshold = currentPrice * 0.001; // 0.1% threshold
        if (Math.abs(newPrice - currentPrice) < priceChangeThreshold) {
          return;
        }

        setCurrentPrice(newPrice);

        // Calculate price change from initial price
        const change = initialPrice > 0 ? ((newPrice - initialPrice) / initialPrice) * 100 : 0;
        setPriceChange(change);

        // Add new data point with minimal variation to reduce chart jumping
        const variation = (Math.random() - 0.5) * newPrice * 0.0005; // Reduced to 0.05% max variation
        const adjustedPrice = Math.max(0.000001, newPrice + variation);

        setData(prevData => {
          if (!mountedRef.current) return prevData;

          const newPoint: ChartPoint = {
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            price: adjustedPrice,
            timestamp: Date.now()
          };

          // Keep last 30 points for better performance (reduced from 50)
          const updatedData = [...prevData, newPoint];
          return updatedData.slice(-30);
        });
      } catch (error) {
        console.error("Error updating chart:", error);
      } finally {
        if (mountedRef.current) {
          setIsUpdating(false);
        }
      }
    }, 30000); // Update every 30 seconds instead of 15 for more stability

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [resolvedId, loading, currentPrice, initialPrice]);

  const CustomTooltip = useCallback(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-lg font-mono font-bold text-foreground">
            ${payload[0].value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: currentPrice >= 1 ? 2 : 6
            })}
          </p>
        </div>
      );
    }
    return null;
  }, [currentPrice]);

  const onView = useCallback(() => {
    const id = resolvedId ?? coinId;
    navigate(`/analysis/${id}`);
  }, [resolvedId, coinId, navigate]);

  // Format Y-axis values appropriately based on price range
  const formatYAxis = useCallback((value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    } else if (value >= 1) {
      return `$${value.toFixed(2)}`;
    } else {
      return `$${value.toFixed(6)}`;
    }
  }, []);

  // Memoize computed values to prevent unnecessary re-renders
  const lineColor = useMemo(() =>
    priceChange >= 0 ? 'hsl(var(--crypto-green))' : 'hsl(var(--crypto-red))',
    [priceChange]
  );

  const formattedPrice = useMemo(() =>
    currentPrice.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: currentPrice >= 1 ? 2 : 6
    }),
    [currentPrice]
  );

  const formattedPriceChange = useMemo(() =>
    `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%`,
    [priceChange]
  );

  return (
    <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
      <CardHeader className="px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold">{coinName} Price Chart</CardTitle>
          <div className="flex items-center space-x-2">
            {priceChange >= 0 ?
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-crypto-green" /> :
              <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-crypto-red" />
            }
            <span className={`font-mono font-bold text-sm sm:text-base ${priceChange >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
              {formattedPriceChange}
            </span>
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-xl sm:text-2xl lg:text-3xl font-mono font-bold">
            ${formattedPrice}
          </span>
          <span className="text-xs sm:text-sm text-muted-foreground">USD</span>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        {loading ? (
          <div className="h-60 sm:h-80 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <div className="animate-pulse text-muted-foreground text-sm sm:text-base">Loading chart data...</div>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-60 sm:h-80 flex items-center justify-center">
            <div className="text-muted-foreground text-sm sm:text-base">No chart data available</div>
          </div>
        ) : (
          <div className="h-60 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={data} 
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  opacity={0.3} 
                />
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: window.innerWidth < 640 ? 10 : 12 }}
                  interval="preserveStartEnd"
                  minTickGap={window.innerWidth < 640 ? 20 : 30}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: window.innerWidth < 640 ? 10 : 12 }}
                  tickFormatter={formatYAxis}
                  domain={['dataMin - dataMin * 0.001', 'dataMax + dataMax * 0.001']}
                  width={window.innerWidth < 640 ? 40 : 60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke={lineColor}
                  strokeWidth={2} 
                  dot={false} 
                  activeDot={{ 
                    r: 4, 
                    fill: lineColor, 
                    stroke: 'hsl(var(--background))', 
                    strokeWidth: 2 
                  }}
                  isAnimationActive={!isUpdating}
                  animationDuration={isUpdating ? 0 : 500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-border/50">
          <button
            onClick={onView}
            className="w-full flex items-center justify-center space-x-2 text-primary hover:text-primary-foreground hover:bg-primary transition-all duration-300 py-2 sm:py-3 px-3 sm:px-4 rounded-lg border border-primary/30 hover:border-primary shadow-lg"
          >
            <span className="text-xs sm:text-sm font-medium">View Detailed Analysis</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// Export memoized component to prevent unnecessary re-renders
export default memo(CryptoChart);