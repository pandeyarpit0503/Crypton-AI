import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateConfidence, calculateChatConfidence, type MarketData } from '@/utils/confidenceCalculator';
import { analyzeMarket, type MarketData as AnalysisMarketData } from '@/utils/marketAnalysis';

// Initialize Gemini AI
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'your-gemini-api-key-here';

if (!API_KEY || API_KEY === 'your-gemini-api-key-here') {
  console.error('Gemini API key not configured properly. Please check your .env.local file.');
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Get the generative model with safety settings
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 200, // Reduced from 1024 to encourage shorter responses
  },
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
  ],
});

export interface AIAnalysis {
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  keyPoints: string[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: 'buy' | 'sell' | 'hold';
  timeframe: string;
}

export interface AIPortfolioInsight {
  overallHealth: string;
  diversificationScore: number;
  riskAssessment: string;
  recommendations: string[];
  rebalancingSuggestions: string[];
}

export interface AIChatResponse {
  response: string;
  confidence: number;
  sources?: string[];
}

// Test API connection
export async function testGeminiConnection(): Promise<{ working: boolean; error?: string }> {
  try {
    if (!API_KEY || API_KEY === 'your-gemini-api-key-here') {
      return { working: false, error: 'API key not configured' };
    }

    const result = await model.generateContent('Test connection');
    const response = await result.response;

    if (response && typeof response.text === 'function') {
      await response.text();
      return { working: true };
    }

    return { working: false, error: 'Invalid response format' };
  } catch (error) {
    console.error('Gemini connection test failed:', error);
    if (error instanceof Error) {
      if (error.message.includes('quota') || error.message.includes('limit')) {
        return { working: false, error: 'API quota exceeded' };
      }
      return { working: false, error: error.message };
    }
    return { working: false, error: 'Unknown error' };
  }
}

export const geminiAI = {
  // Analyze cryptocurrency data and provide insights
  async analyzeCryptocurrency(coinData: any): Promise<AIAnalysis> {
    try {
      // Calculate dynamic confidence based on market data
      const marketData: MarketData = {
        price_usd: coinData.price_usd,
        percent_change_24h: coinData.percent_change_24h,
        percent_change_7d: coinData.percent_change_7d || 0,
        volume24: coinData.volume24,
        market_cap_usd: coinData.market_cap_usd,
        rank: coinData.rank
      };

      const confidenceResult = calculateConfidence(marketData);

      // Calculate market-based sentiment and recommendation
      const marketAnalysis = analyzeMarket(marketData);
      console.log('Gemini AI - Market analysis:', marketAnalysis);

      const prompt = `
        Analyze this cryptocurrency and provide a market summary and key insights:

        Coin: ${coinData.name} (${coinData.symbol})
        Current Price: $${coinData.price_usd}
        24h Change: ${coinData.percent_change_24h}%
        7d Change: ${coinData.percent_change_7d || 0}%
        Market Cap: $${coinData.market_cap_usd}
        Volume: $${coinData.volume24}
        Rank: #${coinData.rank}

        Market Analysis: ${marketAnalysis.sentiment} sentiment, ${marketAnalysis.recommendation} recommendation

        Provide analysis in JSON format:
        {
          "summary": "2-3 sentence market position and trend summary",
          "keyPoints": ["3-4 specific insights about this cryptocurrency's current situation"]
        }

        Focus on factual market analysis and current trends. Be specific and informative.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const aiAnalysis = JSON.parse(jsonMatch[0]);
        // Combine AI analysis with market-based calculations
        return {
          summary: aiAnalysis.summary || `${coinData.name} is currently ${marketAnalysis.sentiment} with ${marketAnalysis.recommendation} recommendation based on recent market performance.`,
          sentiment: marketAnalysis.sentiment,
          confidence: confidenceResult.confidence,
          keyPoints: aiAnalysis.keyPoints || [
            `${marketAnalysis.sentiment.charAt(0).toUpperCase() + marketAnalysis.sentiment.slice(1)} market sentiment`,
            `${marketAnalysis.recommendation.charAt(0).toUpperCase() + marketAnalysis.recommendation.slice(1)} recommendation for ${marketAnalysis.timeframe}`,
            `${marketAnalysis.riskLevel.charAt(0).toUpperCase() + marketAnalysis.riskLevel.slice(1)} risk level`
          ],
          riskLevel: marketAnalysis.riskLevel,
          recommendation: marketAnalysis.recommendation,
          timeframe: marketAnalysis.timeframe
        };
      }

      // Fallback if JSON parsing fails - use market analysis
      return {
        summary: `${coinData.name} shows ${marketAnalysis.sentiment} sentiment with ${marketAnalysis.recommendation} recommendation based on current market conditions and price movements.`,
        sentiment: marketAnalysis.sentiment,
        confidence: confidenceResult.confidence,
        keyPoints: [
          `Current market sentiment: ${marketAnalysis.sentiment}`,
          `Investment recommendation: ${marketAnalysis.recommendation}`,
          `Risk assessment: ${marketAnalysis.riskLevel}`,
          `Suggested timeframe: ${marketAnalysis.timeframe}`
        ],
        riskLevel: marketAnalysis.riskLevel,
        recommendation: marketAnalysis.recommendation,
        timeframe: marketAnalysis.timeframe
      };
    } catch (error) {
      console.error('AI Analysis Error:', error);

      // Even on error, calculate confidence based on available data
      const marketData: MarketData = {
        price_usd: coinData?.price_usd || 0,
        percent_change_24h: coinData?.percent_change_24h || 0,
        percent_change_7d: coinData?.percent_change_7d || 0,
        volume24: coinData?.volume24 || 0,
        market_cap_usd: coinData?.market_cap_usd || 0,
        rank: coinData?.rank || 999
      };

      const confidenceResult = calculateConfidence(marketData);
      const marketAnalysis = analyzeMarket(marketData);

      return {
        summary: `Market analysis available: ${coinData.name} shows ${marketAnalysis.sentiment} sentiment. AI summary temporarily unavailable.`,
        sentiment: marketAnalysis.sentiment,
        confidence: Math.max(15, confidenceResult.confidence - 30), // Reduce confidence due to error
        keyPoints: [
          `Market sentiment: ${marketAnalysis.sentiment}`,
          `Recommendation: ${marketAnalysis.recommendation}`,
          `Risk level: ${marketAnalysis.riskLevel}`,
          'AI analysis temporarily unavailable'
        ],
        riskLevel: marketAnalysis.riskLevel,
        recommendation: marketAnalysis.recommendation,
        timeframe: marketAnalysis.timeframe
      };
    }
  },

  // Analyze portfolio and provide insights
  async analyzePortfolio(holdings: any[]): Promise<AIPortfolioInsight> {
    try {
      // Filter out holdings with invalid data
      const validHoldings = holdings.filter(h =>
        h.amount > 0 &&
        h.current_price > 0 &&
        h.purchase_price > 0
      );

      if (validHoldings.length === 0) {
        return {
          overallHealth: 'The portfolio\'s health cannot be assessed due to missing data. No holdings or values are provided.',
          diversificationScore: 0,
          riskAssessment: 'Cannot assess risk without valid holding data.',
          recommendations: ['Add cryptocurrency holdings to your portfolio', 'Ensure all holdings have valid amounts and prices'],
          rebalancingSuggestions: ['Complete portfolio setup first']
        };
      }

      const portfolioData = validHoldings.map(h => ({
        coin: h.coin_name,
        symbol: h.coin_symbol,
        amount: h.amount,
        value: h.amount * h.current_price,
        purchasePrice: h.purchase_price,
        currentPrice: h.current_price,
        profitLoss: (h.amount * h.current_price) - (h.amount * h.purchase_price),
        profitLossPercentage: ((h.current_price - h.purchase_price) / h.purchase_price) * 100
      }));

      const totalValue = portfolioData.reduce((sum, h) => sum + h.value, 0);
      const totalInvested = portfolioData.reduce((sum, h) => sum + (h.amount * h.purchasePrice), 0);
      const totalProfitLoss = totalValue - totalInvested;
      const totalProfitLossPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

      // Calculate diversification score based on number of holdings and distribution
      const numHoldings = portfolioData.length;
      const largestHoldingPercentage = Math.max(...portfolioData.map(h => (h.value / totalValue) * 100));
      let diversificationScore = Math.min(numHoldings * 15, 60); // Base score from number of holdings
      if (largestHoldingPercentage < 50) diversificationScore += 20; // Bonus for not being too concentrated
      if (largestHoldingPercentage < 30) diversificationScore += 20; // Additional bonus for good distribution
      diversificationScore = Math.min(diversificationScore, 100);

      const prompt = `
        Analyze this cryptocurrency portfolio briefly:

        Portfolio Holdings:
        ${portfolioData.map(h =>
          `- ${h.coin}: $${h.value.toFixed(2)} (${((h.value/totalValue)*100).toFixed(1)}%) - P&L: ${h.profitLossPercentage.toFixed(1)}%`
        ).join('\n')}

        Total Value: $${totalValue.toFixed(2)}
        Total Invested: $${totalInvested.toFixed(2)}
        Total P&L: ${totalProfitLossPercentage.toFixed(1)}%
        Number of Holdings: ${numHoldings}

        Provide concise analysis in JSON:
        {
          "overallHealth": "1-2 sentence assessment based on performance and diversification",
          "diversificationScore": ${diversificationScore},
          "riskAssessment": "brief risk analysis based on holdings and performance",
          "recommendations": ["3 short actionable recommendations"],
          "rebalancingSuggestions": ["2 brief rebalancing suggestions"]
        }

        Keep all responses short and actionable.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Ensure diversification score is set correctly
        parsed.diversificationScore = diversificationScore;
        return parsed;
      }

      return {
        overallHealth: `Portfolio shows ${totalProfitLossPercentage >= 0 ? 'positive' : 'negative'} performance with ${numHoldings} holdings.`,
        diversificationScore: diversificationScore,
        riskAssessment: `${numHoldings < 3 ? 'High' : numHoldings < 6 ? 'Medium' : 'Low'} concentration risk detected.`,
        recommendations: ['Consider diversification', 'Monitor market trends', 'Review allocation'],
        rebalancingSuggestions: ['Rebalance quarterly', 'Consider DCA strategy']
      };
    } catch (error) {
      console.error('Portfolio Analysis Error:', error);
      return {
        overallHealth: 'Analysis temporarily unavailable due to technical issues.',
        diversificationScore: 0,
        riskAssessment: 'Unable to assess risk at this time.',
        recommendations: ['Please try again later'],
        rebalancingSuggestions: ['Retry analysis when service is available']
      };
    }
  },

  // AI Chat for cryptocurrency questions
  async chatWithAI(question: string, context?: any): Promise<AIChatResponse> {
    try {
      if (!API_KEY || API_KEY === 'your-gemini-api-key-here') {
        throw new Error('Gemini API key not configured');
      }

      const prompt = `You are CryptoTrend AI, an expert cryptocurrency advisor. Answer the following question with accurate, helpful information:

Question: ${question}

${context ? `Context: ${JSON.stringify(context)}` : ''}

IMPORTANT: Keep your response concise and precise. Aim for 2-3 sentences maximum. Focus on the most essential information. Be direct and to the point while remaining helpful.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;

      if (!response) {
        throw new Error('No response received from Gemini API');
      }

      let text;
      try {
        // Try standard text() method first
        if (typeof response.text === 'function') {
          text = await response.text();
        }

        // Fallback: Check candidates structure
        if (!text && response.candidates && Array.isArray(response.candidates) && response.candidates.length > 0) {
          const candidate = response.candidates[0];
          if (candidate.content && candidate.content.parts && Array.isArray(candidate.content.parts) && candidate.content.parts.length > 0) {
            text = candidate.content.parts[0].text;
          }
        }

        if (!text) {
          throw new Error('Unable to extract text from response');
        }
      } catch (textError) {
        console.error('AI Chat - Error extracting text:', textError);
        throw new Error(`Failed to extract text from response: ${textError instanceof Error ? textError.message : 'Unknown error'}`);
      }

      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        console.error('AI Chat - Invalid text response:', text);
        throw new Error('Empty or invalid response received from Gemini API');
      }

      console.log('AI Chat - Final response text:', text.substring(0, 100) + '...');

      // Calculate dynamic confidence based on question complexity
      const questionLower = question.toLowerCase();
      let questionComplexity: 'simple' | 'moderate' | 'complex' = 'moderate';

      // Simple questions (basic info, definitions)
      if (questionLower.includes('what is') || questionLower.includes('define') ||
          questionLower.includes('explain') || questionLower.includes('how does')) {
        questionComplexity = 'simple';
      }
      // Complex questions (predictions, specific advice, technical analysis)
      else if (questionLower.includes('should i') || questionLower.includes('predict') ||
               questionLower.includes('will') || questionLower.includes('when') ||
               questionLower.includes('technical analysis') || questionLower.includes('price target')) {
        questionComplexity = 'complex';
      }

      const dynamicConfidence = calculateChatConfidence(questionComplexity, true, true);

      return {
        response: text.trim(),
        confidence: dynamicConfidence,
        sources: ['CryptoTrend AI Analysis']
      };
    } catch (error) {
      console.error('AI Chat Error Details:', error);

      // Provide comprehensive fallback responses based on the question
      let fallbackResponse = '';
      const questionLower = question.toLowerCase();

      if (questionLower.includes('bitcoin') || questionLower.includes('btc')) {
        fallbackResponse = 'Bitcoin (BTC) is the first and largest cryptocurrency by market cap. Created by Satoshi Nakamoto in 2009, it operates on a decentralized network and is often considered "digital gold" due to its store of value properties.';
      } else if (questionLower.includes('ethereum') || questionLower.includes('eth')) {
        fallbackResponse = 'Ethereum (ETH) is a blockchain platform that enables smart contracts and decentralized applications (DApps). Created by Vitalik Buterin in 2015, it\'s the second-largest cryptocurrency and the foundation for most DeFi protocols.';
      } else if (questionLower.includes('invest') || questionLower.includes('buy') || questionLower.includes('should i')) {
        fallbackResponse = 'Cryptocurrency investing carries high risk and volatility. Key principles: only invest what you can afford to lose, diversify your portfolio, do thorough research (DYOR), and consider dollar-cost averaging for long-term investments.';
      } else if (questionLower.includes('defi') || questionLower.includes('decentralized finance')) {
        fallbackResponse = 'DeFi (Decentralized Finance) refers to financial services built on blockchain networks, primarily Ethereum. It includes lending, borrowing, trading, and yield farming without traditional intermediaries like banks.';
      } else if (questionLower.includes('nft') || questionLower.includes('non-fungible')) {
        fallbackResponse = 'NFTs (Non-Fungible Tokens) are unique digital assets stored on blockchain networks. They represent ownership of digital art, collectibles, gaming items, or other unique digital content.';
      } else if (questionLower.includes('wallet') || questionLower.includes('store')) {
        fallbackResponse = 'Crypto wallets store your private keys and allow you to interact with blockchain networks. Hardware wallets (cold storage) are most secure for large amounts, while software wallets offer convenience for daily use.';
      } else if (questionLower.includes('mining') || questionLower.includes('mine')) {
        fallbackResponse = 'Cryptocurrency mining involves using computational power to validate transactions and secure blockchain networks. Bitcoin uses Proof-of-Work mining, while Ethereum has transitioned to Proof-of-Stake.';
      } else if (questionLower.includes('staking') || questionLower.includes('stake')) {
        fallbackResponse = 'Staking involves locking up cryptocurrencies to support network operations and earn rewards. It\'s used in Proof-of-Stake networks like Ethereum 2.0, Cardano, and Solana, typically offering 4-12% annual returns.';
      } else if (questionLower.includes('altcoin') || questionLower.includes('alternative')) {
        fallbackResponse = 'Altcoins are all cryptocurrencies other than Bitcoin. They include established coins like Ethereum, newer projects with specific use cases, and range from utility tokens to meme coins with varying risk levels.';
      } else if (questionLower.includes('market cap') || questionLower.includes('marketcap')) {
        fallbackResponse = 'Market capitalization is calculated by multiplying a cryptocurrency\'s current price by its total circulating supply. It\'s a key metric for comparing the relative size and value of different cryptocurrencies.';
      } else if (questionLower.includes('volatility') || questionLower.includes('volatile')) {
        fallbackResponse = 'Cryptocurrency markets are highly volatile due to factors like regulatory news, market sentiment, adoption rates, and relatively small market size compared to traditional assets. This creates both opportunities and risks.';
      } else if (questionLower.includes('regulation') || questionLower.includes('legal')) {
        fallbackResponse = 'Cryptocurrency regulation varies by country and is evolving rapidly. Some nations embrace crypto (El Salvador, Switzerland), others restrict it (China), while many are developing comprehensive frameworks (US, EU).';
      } else if (questionLower.includes('price') || questionLower.includes('prediction') || questionLower.includes('forecast')) {
        fallbackResponse = 'Cryptocurrency prices are influenced by supply/demand, adoption, regulatory news, market sentiment, and macroeconomic factors. Price predictions are speculative - always do your own research and never invest more than you can afford to lose.';
      } else {
        fallbackResponse = 'I\'m here to help with cryptocurrency questions! You can ask about Bitcoin, Ethereum, DeFi, investing strategies, wallets, staking, market analysis, or any other crypto-related topics.';
      }

      let errorMessage = fallbackResponse;

      // Add a subtle note about AI service status without being too technical
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);

        if (error.message.includes('quota') || error.message.includes('limit')) {
          errorMessage += '\n\n💡 AI assistant is temporarily at capacity. The information above is from our knowledge base.';
        } else if (error.message.includes('API_KEY') || error.message.includes('API key')) {
          errorMessage += '\n\n💡 AI assistant is temporarily unavailable. The information above is from our knowledge base.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage += '\n\n💡 Connection issue detected. The information above is from our knowledge base.';
        } else {
          errorMessage += '\n\n💡 AI assistant is temporarily unavailable. The information above is from our knowledge base.';
        }
      } else {
        errorMessage += '\n\n💡 AI assistant is temporarily unavailable. The information above is from our knowledge base.';
      }

      // Calculate reduced confidence for error responses
      // Reuse the question analysis from above
      let errorQuestionComplexity: 'simple' | 'moderate' | 'complex' = 'moderate';

      if (question.toLowerCase().includes('what is') || question.toLowerCase().includes('define')) {
        errorQuestionComplexity = 'simple';
      } else if (question.toLowerCase().includes('should i') || question.toLowerCase().includes('predict')) {
        errorQuestionComplexity = 'complex';
      }

      const baseConfidence = calculateChatConfidence(errorQuestionComplexity, false, false);
      const errorConfidence = Math.max(15, baseConfidence - 40); // Significantly reduce confidence for errors

      return {
        response: errorMessage,
        confidence: errorConfidence
      };
    }
  },

  // Generate market predictions
  async generateMarketPrediction(marketData: any): Promise<string> {
    try {
      const prompt = `
        Based on current crypto market data, provide a brief prediction:

        ${JSON.stringify(marketData)}

        Give a concise outlook covering:
        - Market sentiment (1 sentence)
        - Key trend (1 sentence)
        - Main opportunity/risk (1 sentence)

        Maximum 3 sentences total.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Market Prediction Error:', error);
      return 'Market prediction temporarily unavailable. Please check back later for AI-powered insights.';
    }
  }
};
