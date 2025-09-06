import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getGlobal, getTickers, usd } from "@/lib/coinlore";

export function AdvancedMarketInsights() {
  const [global, setGlobal] = useState<any | null>(null);
  const [tickers, setTickers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [g, t] = await Promise.all([getGlobal(), getTickers(0, 50)]);
        if (!mounted) return;
        setGlobal(g);
        setTickers(t);
      } catch {
        setGlobal(null);
        setTickers([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    const iv = setInterval(load, 60_000);
    return () => { mounted = false; clearInterval(iv); };
  }, []);

  const topVol = useMemo(() => [...tickers].sort((a, b) => b.volume24 - a.volume24).slice(0, 5), [tickers]);

  return (
    <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
      <CardHeader>
        <CardTitle>Advanced Market Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="animate-pulse text-muted-foreground">Loading market insights...</div>
        ) : (
          <>
            {global && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><div className="text-sm text-muted-foreground">Total Market Cap</div><div className="text-xl font-bold">{usd(global.total_mcap)}</div></div>
                <div><div className="text-sm text-muted-foreground">24h Volume</div><div className="text-xl font-bold">{usd(global.total_volume)}</div></div>
                <div><div className="text-sm text-muted-foreground">BTC Dominance</div><div className="text-xl font-bold">{global.btc_d?.toFixed(2)}%</div></div>
                <div><div className="text-sm text-muted-foreground">ETH Dominance</div><div className="text-xl font-bold">{global.eth_d?.toFixed(2)}%</div></div>
              </div>
            )}
            <div>
              <div className="text-sm text-muted-foreground mb-2">Top by Volume (24h)</div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {topVol.map((c) => (
                  <div key={c.id} className="p-3 rounded-lg border border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2"><span className="font-medium">{c.symbol}</span><span className="text-xs text-muted-foreground">{c.name}</span></div>
                    <div className="text-sm">{usd(c.volume24)}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
