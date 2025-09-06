"use client";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

import CryptoChart from "@/components/ui/crypto-chart"; // reuse your chart component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { CoinSpecificAlerts } from "@/components/alerts/CoinSpecificAlerts";

export default function CurrencyDetails() {
  const params = useSearchParams();
  const id = params.get("id"); // e.g., bitcoin
  const [coin, setCoin] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetch(`https://api.coingecko.com/api/v3/coins/${id}`)
        .then((res) => res.json())
        .then((data) => setCoin(data));
    }
  }, [id]);

  if (!coin) return <div className="text-center p-10">Loading details...</div>;

  const marketData = [
    { name: "Market Cap", value: coin.market_data.market_cap.usd },
    { name: "24h Volume", value: coin.market_data.total_volume.usd },
    { name: "Circulating Supply", value: coin.market_data.circulating_supply },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
  <img
    src={coin?.image?.large || "/placeholder.png"}
    alt={coin?.name || "Crypto"}
    width={60}
    height={60}
    className="rounded"
  />
        <div>
          <h1 className="text-3xl font-bold">{coin.name}</h1>
          <p className="text-gray-500 uppercase">{coin.symbol}</p>
        </div>
      </div>

      {/* Price Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current Price</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">
            ${coin.market_data.current_price.usd.toLocaleString()}
          </p>
          <p
            className={`mt-2 ${
              coin.market_data.price_change_percentage_24h >= 0
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {coin.market_data.price_change_percentage_24h.toFixed(2)}% (24h)
          </p>
        </CardContent>
      </Card>

      {/* Coin-Specific Smart Alerts */}
      <CoinSpecificAlerts
        coinId={id!}
        coinSymbol={coin.symbol.toUpperCase()}
        coinName={coin.name}
        currentPrice={coin.market_data?.current_price?.usd}
        priceChange24h={coin.market_data?.price_change_percentage_24h}
      />

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <CryptoChart coinId={id!} />
        </CardContent>
      </Card>

      {/* Market Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Market Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={marketData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {marketData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}