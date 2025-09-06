/**
 * Dynamic confidence calculation utility for cryptocurrency analysis
 * Calculates confidence based on multiple market factors and data quality
 */

export interface MarketData {
  price_usd: string | number;
  percent_change_24h: string | number;
  percent_change_7d: string | number;
  volume24: string | number;
  market_cap_usd: string | number;
  rank: string | number;
  last_updated?: string;
}

export interface ConfidenceFactors {
  dataQuality: number;      // 0-100: How complete and recent the data is
  marketStability: number;  // 0-100: How stable the market conditions are
  liquidityScore: number;   // 0-100: Trading volume and market cap factors
  rankingScore: number;     // 0-100: Market position and credibility
  volatilityScore: number;  // 0-100: Price stability (inverse of volatility)
}

/**
 * Calculate dynamic confidence level based on market data quality and conditions
 */
export function calculateConfidence(data: MarketData): {
  confidence: number;
  factors: ConfidenceFactors;
  reasoning: string[];
} {
  const factors: ConfidenceFactors = {
    dataQuality: 0,
    marketStability: 0,
    liquidityScore: 0,
    rankingScore: 0,
    volatilityScore: 0
  };

  const reasoning: string[] = [];

  // Convert string values to numbers
  const price = Number(data.price_usd) || 0;
  const change24h = Number(data.percent_change_24h) || 0;
  const change7d = Number(data.percent_change_7d) || 0;
  const volume = Number(data.volume24) || 0;
  const marketCap = Number(data.market_cap_usd) || 0;
  const rank = Number(data.rank) || 999;

  // 1. Data Quality Score (0-100)
  let dataPoints = 0;
  if (price > 0) dataPoints++;
  if (change24h !== 0) dataPoints++;
  if (change7d !== 0) dataPoints++;
  if (volume > 0) dataPoints++;
  if (marketCap > 0) dataPoints++;
  if (rank > 0 && rank < 999) dataPoints++;

  factors.dataQuality = (dataPoints / 6) * 100;
  
  if (factors.dataQuality >= 90) {
    reasoning.push("Complete market data available");
  } else if (factors.dataQuality >= 70) {
    reasoning.push("Most market data available");
  } else {
    reasoning.push("Limited market data available");
  }

  // 2. Market Stability Score (0-100) - based on volatility
  const volatility = Math.abs(change24h) + Math.abs(change7d) / 2;
  if (volatility <= 5) {
    factors.marketStability = 90;
    reasoning.push("Low volatility indicates stable conditions");
  } else if (volatility <= 15) {
    factors.marketStability = 70;
    reasoning.push("Moderate volatility in recent periods");
  } else if (volatility <= 30) {
    factors.marketStability = 50;
    reasoning.push("High volatility may affect prediction accuracy");
  } else {
    factors.marketStability = 25;
    reasoning.push("Extreme volatility reduces prediction reliability");
  }

  // 3. Liquidity Score (0-100) - based on volume and market cap
  if (marketCap > 0 && volume > 0) {
    const volumeToMarketCap = (volume / marketCap) * 100;
    
    if (volumeToMarketCap >= 10) {
      factors.liquidityScore = 95;
      reasoning.push("Excellent liquidity with high trading volume");
    } else if (volumeToMarketCap >= 5) {
      factors.liquidityScore = 80;
      reasoning.push("Good liquidity for reliable analysis");
    } else if (volumeToMarketCap >= 1) {
      factors.liquidityScore = 60;
      reasoning.push("Moderate liquidity may affect accuracy");
    } else {
      factors.liquidityScore = 30;
      reasoning.push("Low liquidity reduces analysis confidence");
    }
  } else {
    factors.liquidityScore = 20;
    reasoning.push("Insufficient volume/market cap data");
  }

  // 4. Ranking Score (0-100) - based on market position
  if (rank <= 10) {
    factors.rankingScore = 95;
    reasoning.push("Top 10 cryptocurrency with high credibility");
  } else if (rank <= 50) {
    factors.rankingScore = 85;
    reasoning.push("Well-established cryptocurrency");
  } else if (rank <= 100) {
    factors.rankingScore = 70;
    reasoning.push("Established mid-cap cryptocurrency");
  } else if (rank <= 500) {
    factors.rankingScore = 50;
    reasoning.push("Lower-cap asset with higher uncertainty");
  } else {
    factors.rankingScore = 25;
    reasoning.push("Very low market cap increases prediction risk");
  }

  // 5. Volatility Score (0-100) - inverse of volatility for confidence
  factors.volatilityScore = Math.max(0, 100 - volatility * 2);

  // Calculate weighted confidence score
  const weights = {
    dataQuality: 0.25,      // 25% - Data completeness is crucial
    marketStability: 0.20,  // 20% - Market conditions matter
    liquidityScore: 0.20,   // 20% - Liquidity affects reliability
    rankingScore: 0.20,     // 20% - Market position indicates stability
    volatilityScore: 0.15   // 15% - Recent volatility
  };

  const confidence = Math.round(
    factors.dataQuality * weights.dataQuality +
    factors.marketStability * weights.marketStability +
    factors.liquidityScore * weights.liquidityScore +
    factors.rankingScore * weights.rankingScore +
    factors.volatilityScore * weights.volatilityScore
  );

  // Ensure confidence is between 15-95 (never 0 or 100)
  const finalConfidence = Math.max(15, Math.min(95, confidence));

  return {
    confidence: finalConfidence,
    factors,
    reasoning
  };
}

/**
 * Get confidence level description
 */
export function getConfidenceDescription(confidence: number): string {
  if (confidence >= 85) return "Very High";
  if (confidence >= 70) return "High";
  if (confidence >= 55) return "Moderate";
  if (confidence >= 40) return "Low";
  return "Very Low";
}

/**
 * Get confidence color for UI display
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return "text-crypto-green";
  if (confidence >= 60) return "text-crypto-blue";
  if (confidence >= 40) return "text-crypto-orange";
  return "text-crypto-red";
}

/**
 * Calculate confidence for chat responses based on question complexity and data availability
 */
export function calculateChatConfidence(
  questionComplexity: 'simple' | 'moderate' | 'complex',
  hasMarketData: boolean = true,
  isRealTimeData: boolean = true
): number {
  let baseConfidence = 70;

  // Adjust based on question complexity
  switch (questionComplexity) {
    case 'simple':
      baseConfidence = 85;
      break;
    case 'moderate':
      baseConfidence = 70;
      break;
    case 'complex':
      baseConfidence = 55;
      break;
  }

  // Adjust based on data availability
  if (!hasMarketData) baseConfidence -= 20;
  if (!isRealTimeData) baseConfidence -= 10;

  // Add some randomness for natural variation (±5%)
  const variation = (Math.random() - 0.5) * 10;
  baseConfidence += variation;

  return Math.max(25, Math.min(90, Math.round(baseConfidence)));
}
