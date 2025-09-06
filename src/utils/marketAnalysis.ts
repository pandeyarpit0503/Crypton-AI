/**
 * Market-based sentiment and recommendation analysis utility
 * Provides accurate sentiment and recommendations based on real market data
 */

export interface MarketData {
  price_usd: string | number;
  percent_change_24h: string | number;
  percent_change_7d: string | number;
  volume24: string | number;
  market_cap_usd: string | number;
  rank: string | number;
}

export type Sentiment = 'bullish' | 'bearish' | 'neutral';
export type Recommendation = 'buy' | 'sell' | 'hold';
export type RiskLevel = 'low' | 'medium' | 'high';
export type Timeframe = 'short-term' | 'medium-term' | 'long-term';

export interface MarketAnalysis {
  sentiment: Sentiment;
  recommendation: Recommendation;
  riskLevel: RiskLevel;
  timeframe: Timeframe;
  reasoning: string[];
  strength: number; // 0-100, how strong the signal is
}

/**
 * Calculate market sentiment based on price movements and trends
 */
export function calculateSentiment(data: MarketData): {
  sentiment: Sentiment;
  strength: number;
  reasoning: string[];
} {
  const change24h = Number(data.percent_change_24h) || 0;
  const change7d = Number(data.percent_change_7d) || 0;
  const volume = Number(data.volume24) || 0;
  const marketCap = Number(data.market_cap_usd) || 0;
  const rank = Number(data.rank) || 999;

  let sentimentScore = 0;
  const reasoning: string[] = [];

  // Price momentum analysis (40% weight)
  if (change24h > 5) {
    sentimentScore += 20;
    reasoning.push(`Strong 24h gain of ${change24h.toFixed(1)}%`);
  } else if (change24h > 2) {
    sentimentScore += 10;
    reasoning.push(`Positive 24h movement of ${change24h.toFixed(1)}%`);
  } else if (change24h < -5) {
    sentimentScore -= 20;
    reasoning.push(`Significant 24h decline of ${change24h.toFixed(1)}%`);
  } else if (change24h < -2) {
    sentimentScore -= 10;
    reasoning.push(`Negative 24h movement of ${change24h.toFixed(1)}%`);
  }

  // Weekly trend analysis (30% weight)
  if (change7d > 10) {
    sentimentScore += 15;
    reasoning.push(`Strong weekly uptrend of ${change7d.toFixed(1)}%`);
  } else if (change7d > 3) {
    sentimentScore += 8;
    reasoning.push(`Positive weekly trend of ${change7d.toFixed(1)}%`);
  } else if (change7d < -10) {
    sentimentScore -= 15;
    reasoning.push(`Weak weekly performance of ${change7d.toFixed(1)}%`);
  } else if (change7d < -3) {
    sentimentScore -= 8;
    reasoning.push(`Negative weekly trend of ${change7d.toFixed(1)}%`);
  }

  // Market position analysis (20% weight)
  if (rank <= 10) {
    sentimentScore += 10;
    reasoning.push(`Top 10 cryptocurrency with strong market position`);
  } else if (rank <= 50) {
    sentimentScore += 5;
    reasoning.push(`Well-established top 50 cryptocurrency`);
  } else if (rank > 200) {
    sentimentScore -= 5;
    reasoning.push(`Lower market cap position may indicate higher risk`);
  }

  // Volume analysis (10% weight)
  if (marketCap > 0) {
    const volumeRatio = (volume / marketCap) * 100;
    if (volumeRatio > 10) {
      sentimentScore += 5;
      reasoning.push(`High trading activity indicates strong interest`);
    } else if (volumeRatio < 1) {
      sentimentScore -= 5;
      reasoning.push(`Low trading volume may indicate weak interest`);
    }
  }

  // Determine sentiment with more balanced thresholds
  let sentiment: Sentiment;
  let strength: number;

  if (sentimentScore >= 20) {
    sentiment = 'bullish';
    strength = Math.min(95, 65 + sentimentScore);
  } else if (sentimentScore >= 8) {
    sentiment = 'bullish';
    strength = Math.min(80, 55 + sentimentScore);
  } else if (sentimentScore <= -20) {
    sentiment = 'bearish';
    strength = Math.min(95, 65 + Math.abs(sentimentScore));
  } else if (sentimentScore <= -8) {
    sentiment = 'bearish';
    strength = Math.min(80, 55 + Math.abs(sentimentScore));
  } else {
    sentiment = 'neutral';
    strength = Math.max(40, 60 - Math.abs(sentimentScore * 2));
  }

  return { sentiment, strength, reasoning };
}

/**
 * Generate investment recommendation based on market analysis
 */
export function calculateRecommendation(data: MarketData, sentiment: Sentiment, sentimentStrength: number): {
  recommendation: Recommendation;
  reasoning: string[];
  timeframe: Timeframe;
} {
  const change24h = Number(data.percent_change_24h) || 0;
  const change7d = Number(data.percent_change_7d) || 0;
  const rank = Number(data.rank) || 999;
  const volume = Number(data.volume24) || 0;
  const marketCap = Number(data.market_cap_usd) || 0;

  let recommendationScore = 0;
  const reasoning: string[] = [];

  // Start with neutral bias (conservative approach)
  recommendationScore = 0;

  // Sentiment influence (30% weight) - More conservative
  if (sentiment === 'bullish' && sentimentStrength > 80) {
    recommendationScore += 12;
    reasoning.push(`Very strong bullish sentiment supports potential buying`);
  } else if (sentiment === 'bullish' && sentimentStrength > 60) {
    recommendationScore += 6;
    reasoning.push(`Positive sentiment indicates moderate upside potential`);
  } else if (sentiment === 'bearish' && sentimentStrength > 80) {
    recommendationScore -= 12;
    reasoning.push(`Very strong bearish sentiment suggests selling pressure`);
  } else if (sentiment === 'bearish' && sentimentStrength > 60) {
    recommendationScore -= 6;
    reasoning.push(`Negative sentiment indicates potential downside risk`);
  } else {
    reasoning.push(`Neutral sentiment suggests cautious approach`);
  }

  // Performance analysis (35% weight) - More strict criteria
  const momentum = (change24h * 0.7) + (change7d * 0.3);
  const volatility = Math.abs(change24h) + Math.abs(change7d) / 2;

  // Strong performance criteria
  if (momentum > 15 && change24h > 5 && change7d > 10) {
    recommendationScore += 15;
    reasoning.push(`Exceptional performance with strong momentum`);
  } else if (momentum > 8 && change24h > 3) {
    recommendationScore += 8;
    reasoning.push(`Good positive momentum in recent periods`);
  } else if (momentum > 3) {
    recommendationScore += 3;
    reasoning.push(`Moderate positive trend`);
  } else if (momentum < -15 && change24h < -5 && change7d < -10) {
    recommendationScore -= 15;
    reasoning.push(`Poor performance with strong negative momentum`);
  } else if (momentum < -8 && change24h < -3) {
    recommendationScore -= 8;
    reasoning.push(`Concerning negative momentum`);
  } else if (momentum < -3) {
    recommendationScore -= 3;
    reasoning.push(`Weak recent performance`);
  }

  // Volatility penalty (high volatility reduces buy signals)
  if (volatility > 20) {
    recommendationScore -= 8;
    reasoning.push(`High volatility increases investment risk`);
  } else if (volatility > 10) {
    recommendationScore -= 4;
    reasoning.push(`Moderate volatility requires caution`);
  }

  // Market position analysis (20% weight)
  if (rank <= 10 && marketCap > 50e9) {
    recommendationScore += 8;
    reasoning.push(`Top-tier cryptocurrency with strong market position`);
  } else if (rank <= 50 && marketCap > 5e9) {
    recommendationScore += 4;
    reasoning.push(`Well-established cryptocurrency`);
  } else if (rank > 200) {
    recommendationScore -= 6;
    reasoning.push(`Lower market cap increases risk profile`);
  } else if (rank > 100) {
    recommendationScore -= 3;
    reasoning.push(`Mid-tier market position requires careful consideration`);
  }

  // Liquidity analysis (15% weight)
  if (marketCap > 0) {
    const volumeRatio = (volume / marketCap) * 100;
    if (volumeRatio > 10) {
      recommendationScore += 4;
      reasoning.push(`Excellent liquidity supports trading confidence`);
    } else if (volumeRatio > 3) {
      recommendationScore += 2;
      reasoning.push(`Good trading liquidity`);
    } else if (volumeRatio < 0.5) {
      recommendationScore -= 4;
      reasoning.push(`Low liquidity may impact trading execution`);
    } else if (volumeRatio < 1) {
      recommendationScore -= 2;
      reasoning.push(`Below-average liquidity`);
    }
  }

  // Additional conservative checks
  const isHighRisk = volatility > 15 || rank > 500 || (marketCap > 0 && marketCap < 100e6);
  const isVeryVolatile = volatility > 25;

  // Apply conservative bias for high-risk assets
  if (isHighRisk) {
    recommendationScore -= 5;
    reasoning.push(`High-risk asset requires extra caution`);
  }

  if (isVeryVolatile) {
    recommendationScore -= 8;
    reasoning.push(`Extreme volatility significantly increases risk`);
  }

  // Determine recommendation with stricter thresholds
  let recommendation: Recommendation;
  let timeframe: Timeframe;

  if (recommendationScore >= 30) {
    recommendation = 'buy';
    timeframe = momentum > 15 ? 'short-term' : 'medium-term';
    reasoning.push(`Strong buy signal with exceptional market conditions`);
  } else if (recommendationScore >= 15) {
    recommendation = 'buy';
    timeframe = 'medium-term';
    reasoning.push(`Moderate buy signal with favorable risk-reward ratio`);
  } else if (recommendationScore <= -30) {
    recommendation = 'sell';
    timeframe = Math.abs(momentum) > 15 ? 'short-term' : 'medium-term';
    reasoning.push(`Strong sell signal due to significant risk factors`);
  } else if (recommendationScore <= -15) {
    recommendation = 'sell';
    timeframe = 'medium-term';
    reasoning.push(`Moderate sell signal with concerning market indicators`);
  } else {
    recommendation = 'hold';
    timeframe = 'medium-term';
    if (recommendationScore > 5) {
      reasoning.push(`Positive indicators present but insufficient for buy recommendation`);
    } else if (recommendationScore < -5) {
      reasoning.push(`Some risk factors present but not severe enough for sell recommendation`);
    } else {
      reasoning.push(`Neutral market conditions suggest maintaining current position`);
    }
  }

  return { recommendation, reasoning, timeframe };
}

/**
 * Calculate risk level based on volatility and market factors
 */
export function calculateRiskLevel(data: MarketData): RiskLevel {
  const change24h = Number(data.percent_change_24h) || 0;
  const change7d = Number(data.percent_change_7d) || 0;
  const rank = Number(data.rank) || 999;
  const marketCap = Number(data.market_cap_usd) || 0;

  const volatility = Math.abs(change24h) + Math.abs(change7d) / 2;
  
  let riskScore = 0;

  // Volatility risk
  if (volatility > 20) riskScore += 3;
  else if (volatility > 10) riskScore += 2;
  else if (volatility > 5) riskScore += 1;

  // Market cap risk
  if (marketCap < 100e6) riskScore += 2; // < $100M
  else if (marketCap < 1e9) riskScore += 1; // < $1B

  // Ranking risk
  if (rank > 200) riskScore += 2;
  else if (rank > 100) riskScore += 1;

  if (riskScore >= 5) return 'high';
  if (riskScore >= 3) return 'medium';
  return 'low';
}

/**
 * Comprehensive market analysis
 */
export function analyzeMarket(data: MarketData): MarketAnalysis {
  const sentimentResult = calculateSentiment(data);
  const recommendationResult = calculateRecommendation(data, sentimentResult.sentiment, sentimentResult.strength);
  const riskLevel = calculateRiskLevel(data);

  return {
    sentiment: sentimentResult.sentiment,
    recommendation: recommendationResult.recommendation,
    riskLevel,
    timeframe: recommendationResult.timeframe,
    reasoning: [...sentimentResult.reasoning, ...recommendationResult.reasoning],
    strength: sentimentResult.strength
  };
}
