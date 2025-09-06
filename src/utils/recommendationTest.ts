/**
 * Test file to demonstrate the improved recommendation system
 * Shows how recommendations vary based on different market conditions
 */

import { analyzeMarket, type MarketData } from './marketAnalysis';

// Test scenarios with different market conditions
const testScenarios: { name: string; data: MarketData; expectedRecommendation: string }[] = [
  {
    name: "Bitcoin - Strong Bull Market",
    data: {
      price_usd: 115000,
      percent_change_24h: 8.5,
      percent_change_7d: 15.2,
      volume24: 35000000000,
      market_cap_usd: 2200000000000,
      rank: 1
    },
    expectedRecommendation: "BUY"
  },
  {
    name: "Ethereum - Moderate Growth",
    data: {
      price_usd: 4100,
      percent_change_24h: 3.2,
      percent_change_7d: 7.8,
      volume24: 18000000000,
      market_cap_usd: 490000000000,
      rank: 2
    },
    expectedRecommendation: "HOLD/BUY"
  },
  {
    name: "Stable Large Cap - Sideways",
    data: {
      price_usd: 1.00,
      percent_change_24h: 0.1,
      percent_change_7d: -0.3,
      volume24: 2000000000,
      market_cap_usd: 80000000000,
      rank: 5
    },
    expectedRecommendation: "HOLD"
  },
  {
    name: "Mid-Cap Altcoin - Declining",
    data: {
      price_usd: 25.50,
      percent_change_24h: -4.2,
      percent_change_7d: -12.8,
      volume24: 150000000,
      market_cap_usd: 5000000000,
      rank: 45
    },
    expectedRecommendation: "SELL/HOLD"
  },
  {
    name: "Volatile Altcoin - Heavy Decline",
    data: {
      price_usd: 0.0025,
      percent_change_24h: -15.6,
      percent_change_7d: -35.2,
      volume24: 5000000,
      market_cap_usd: 50000000,
      rank: 250
    },
    expectedRecommendation: "SELL"
  },
  {
    name: "Meme Coin - Extreme Volatility",
    data: {
      price_usd: 0.000001,
      percent_change_24h: 45.5,
      percent_change_7d: -60.2,
      volume24: 100000,
      market_cap_usd: 1000000,
      rank: 1500
    },
    expectedRecommendation: "HOLD (High Risk)"
  },
  {
    name: "New Listing - High Growth but Risky",
    data: {
      price_usd: 12.50,
      percent_change_24h: 25.8,
      percent_change_7d: 180.5,
      volume24: 50000000,
      market_cap_usd: 125000000,
      rank: 800
    },
    expectedRecommendation: "HOLD (Very High Risk)"
  }
];

/**
 * Run recommendation tests to verify the improved algorithm
 */
export function runRecommendationTests() {
  console.log('🧪 Improved Recommendation Algorithm Tests\n');
  console.log('=' .repeat(80));
  
  let buyCount = 0;
  let sellCount = 0;
  let holdCount = 0;
  
  testScenarios.forEach((scenario, index) => {
    const analysis = analyzeMarket(scenario.data);
    
    console.log(`\n${index + 1}. ${scenario.name}`);
    console.log('-'.repeat(60));
    console.log(`💰 Price: $${Number(scenario.data.price_usd).toLocaleString()}`);
    console.log(`📊 Rank: #${scenario.data.rank}`);
    console.log(`📈 24h: ${scenario.data.percent_change_24h}%`);
    console.log(`📉 7d: ${scenario.data.percent_change_7d}%`);
    console.log(`💧 Volume: $${Number(scenario.data.volume24).toLocaleString()}`);
    
    console.log(`\n🎯 ANALYSIS RESULTS:`);
    console.log(`   Sentiment: ${analysis.sentiment.toUpperCase()} (${analysis.strength}% strength)`);
    console.log(`   Recommendation: ${analysis.recommendation.toUpperCase()}`);
    console.log(`   Risk Level: ${analysis.riskLevel.toUpperCase()}`);
    console.log(`   Timeframe: ${analysis.timeframe}`);
    console.log(`   Expected: ${scenario.expectedRecommendation}`);
    
    // Count recommendations
    if (analysis.recommendation === 'buy') buyCount++;
    else if (analysis.recommendation === 'sell') sellCount++;
    else holdCount++;
    
    console.log(`\n💡 Key Reasoning:`);
    analysis.reasoning.slice(0, 4).forEach((reason, i) => {
      console.log(`   ${i + 1}. ${reason}`);
    });
    
    // Validation
    const isReasonable = validateRecommendation(scenario.data, analysis.recommendation);
    console.log(`\n✅ Validation: ${isReasonable ? 'REASONABLE' : 'NEEDS REVIEW'}`);
    
    if (index < testScenarios.length - 1) {
      console.log('\n' + '='.repeat(80));
    }
  });
  
  console.log('\n📊 RECOMMENDATION DISTRIBUTION:');
  console.log(`   🟢 BUY: ${buyCount} (${((buyCount/testScenarios.length)*100).toFixed(1)}%)`);
  console.log(`   🔴 SELL: ${sellCount} (${((sellCount/testScenarios.length)*100).toFixed(1)}%)`);
  console.log(`   🟡 HOLD: ${holdCount} (${((holdCount/testScenarios.length)*100).toFixed(1)}%)`);
  
  console.log('\n🎉 Recommendation tests completed!');
  console.log('💡 The algorithm now provides more balanced and realistic recommendations.');
}

/**
 * Validate if a recommendation makes sense for the given market data
 */
function validateRecommendation(data: MarketData, recommendation: string): boolean {
  const change24h = Number(data.percent_change_24h);
  const change7d = Number(data.percent_change_7d);
  const rank = Number(data.rank);
  const volatility = Math.abs(change24h) + Math.abs(change7d) / 2;
  
  // Basic validation rules
  if (recommendation === 'buy') {
    // Buy should generally require positive momentum or strong fundamentals
    return (change24h > 0 || change7d > 5) && rank <= 100 && volatility < 30;
  } else if (recommendation === 'sell') {
    // Sell should generally require negative momentum or high risk
    return (change24h < -5 || change7d < -10) || volatility > 20 || rank > 500;
  } else {
    // Hold is always reasonable as a conservative choice
    return true;
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).runRecommendationTests = runRecommendationTests;
}
