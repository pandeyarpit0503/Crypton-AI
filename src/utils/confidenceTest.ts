/**
 * Test file to demonstrate dynamic confidence calculation
 * This shows how confidence varies based on different market conditions
 */

import { calculateConfidence, type MarketData } from './confidenceCalculator';

// Test data for different cryptocurrency scenarios
const testCases: { name: string; data: MarketData }[] = [
  {
    name: "Bitcoin (High Confidence)",
    data: {
      price_usd: 115000,
      percent_change_24h: 2.5,
      percent_change_7d: 5.2,
      volume24: 25000000000,
      market_cap_usd: 2200000000000,
      rank: 1
    }
  },
  {
    name: "Ethereum (High Confidence)",
    data: {
      price_usd: 4100,
      percent_change_24h: -1.8,
      percent_change_7d: 3.4,
      volume24: 15000000000,
      market_cap_usd: 490000000000,
      rank: 2
    }
  },
  {
    name: "Mid-Cap Stable Coin (Moderate Confidence)",
    data: {
      price_usd: 25.50,
      percent_change_24h: 0.8,
      percent_change_7d: -2.1,
      volume24: 150000000,
      market_cap_usd: 5000000000,
      rank: 45
    }
  },
  {
    name: "Volatile Altcoin (Low Confidence)",
    data: {
      price_usd: 0.0025,
      percent_change_24h: -25.6,
      percent_change_7d: 45.2,
      volume24: 5000000,
      market_cap_usd: 50000000,
      rank: 250
    }
  },
  {
    name: "Low-Cap Meme Coin (Very Low Confidence)",
    data: {
      price_usd: 0.000001,
      percent_change_24h: 150.5,
      percent_change_7d: -80.2,
      volume24: 100000,
      market_cap_usd: 1000000,
      rank: 1500
    }
  },
  {
    name: "Incomplete Data (Low Confidence)",
    data: {
      price_usd: 10.50,
      percent_change_24h: 0,
      percent_change_7d: 0,
      volume24: 0,
      market_cap_usd: 0,
      rank: 999
    }
  }
];

/**
 * Run confidence calculation tests
 */
export function runConfidenceTests() {
  console.log('🧪 Dynamic Confidence Calculation Tests\n');
  console.log('=' .repeat(80));
  
  testCases.forEach((testCase, index) => {
    const result = calculateConfidence(testCase.data);
    
    console.log(`\n${index + 1}. ${testCase.name}`);
    console.log('-'.repeat(50));
    console.log(`💰 Price: $${Number(testCase.data.price_usd).toLocaleString()}`);
    console.log(`📊 Rank: #${testCase.data.rank}`);
    console.log(`📈 24h Change: ${testCase.data.percent_change_24h}%`);
    console.log(`📉 7d Change: ${testCase.data.percent_change_7d}%`);
    console.log(`💧 Volume: $${Number(testCase.data.volume24).toLocaleString()}`);
    console.log(`🏦 Market Cap: $${Number(testCase.data.market_cap_usd).toLocaleString()}`);
    
    console.log(`\n🎯 CONFIDENCE: ${result.confidence}%`);
    console.log(`📋 Factor Breakdown:`);
    console.log(`   • Data Quality: ${Math.round(result.factors.dataQuality)}%`);
    console.log(`   • Market Stability: ${Math.round(result.factors.marketStability)}%`);
    console.log(`   • Liquidity Score: ${Math.round(result.factors.liquidityScore)}%`);
    console.log(`   • Ranking Score: ${Math.round(result.factors.rankingScore)}%`);
    console.log(`   • Volatility Score: ${Math.round(result.factors.volatilityScore)}%`);
    
    console.log(`\n💡 Key Reasoning:`);
    result.reasoning.forEach((reason, i) => {
      console.log(`   ${i + 1}. ${reason}`);
    });
    
    if (index < testCases.length - 1) {
      console.log('\n' + '='.repeat(80));
    }
  });
  
  console.log('\n🎉 All tests completed! Confidence levels are now dynamic and based on real market factors.');
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).runConfidenceTests = runConfidenceTests;
}
