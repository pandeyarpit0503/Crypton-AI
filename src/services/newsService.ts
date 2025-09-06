// News service using newsdata.io API for crypto news
export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content?: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: {
    name: string;
  };
  sentiment?: 'positive' | 'negative' | 'neutral';
  category?: 'bitcoin' | 'ethereum' | 'defi' | 'nft' | 'regulation' | 'general';
  impact?: 'high' | 'medium' | 'low';
}

// Get API key from environment variables
const API_KEY = import.meta.env.VITE_NEWSDATA_API_KEY || 'your-newsdata-api-key-here';

// Debug: Log API key status on module load
console.log('🔑 Newsdata.io API Key Status:', {
  hasKey: !!API_KEY,
  keyLength: API_KEY?.length || 0,
  keyPreview: API_KEY ? `${API_KEY.substring(0, 10)}...` : 'Not set',
  isDefault: API_KEY === 'your-newsdata-api-key-here'
});

// Newsdata.io API configuration
const BASE_URL = 'https://newsdata.io/api/1/latest';

// Configuration for news content
const NEWS_CONFIG = {
  maxDescriptionWords: 25, // Maximum words in description
  maxArticles: 25, // Maximum articles to return
  apiRequestSize: 10, // Number of articles to request from API (free plan limit)
  cacheTimeout: 30 * 60 * 1000 // Cache for 30 minutes to reduce API calls
};

// Simple cache to reduce API calls
let newsCache: {
  data: NewsArticle[] | null;
  timestamp: number;
  isRateLimited: boolean;
} = {
  data: null,
  timestamp: 0,
  isRateLimited: false
};

// Crypto-related keywords for better filtering
const CRYPTO_KEYWORDS = [
  'cryptocurrency', 'bitcoin', 'ethereum', 'blockchain', 'crypto', 'defi',
  'nft', 'altcoin', 'dogecoin', 'cardano', 'solana', 'polygon', 'binance',
  'coinbase', 'web3', 'metaverse', 'digital currency', 'stablecoin'
];

// Sentiment analysis based on keywords
const POSITIVE_KEYWORDS = [
  'surge', 'rally', 'bullish', 'gains', 'growth', 'adoption', 'breakthrough',
  'milestone', 'success', 'partnership', 'investment', 'institutional', 'approval'
];

const NEGATIVE_KEYWORDS = [
  'crash', 'plunge', 'bearish', 'decline', 'losses', 'hack', 'scam', 'ban',
  'regulation', 'crackdown', 'warning', 'risk', 'volatility', 'concern'
];

// Category determination based on content
const CATEGORY_KEYWORDS = {
  bitcoin: ['bitcoin', 'btc'],
  ethereum: ['ethereum', 'eth', 'smart contract'],
  defi: ['defi', 'decentralized finance', 'yield', 'liquidity', 'dex'],
  nft: ['nft', 'non-fungible', 'opensea', 'digital art', 'collectible'],
  regulation: ['regulation', 'sec', 'government', 'legal', 'compliance', 'law']
};

// Utility functions
const determineSentiment = (text: string): 'positive' | 'negative' | 'neutral' => {
  const lowerText = text.toLowerCase();
  const positiveCount = POSITIVE_KEYWORDS.filter(keyword => lowerText.includes(keyword)).length;
  const negativeCount = NEGATIVE_KEYWORDS.filter(keyword => lowerText.includes(keyword)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
};

const determineCategory = (text: string): 'bitcoin' | 'ethereum' | 'defi' | 'nft' | 'regulation' | 'general' => {
  const lowerText = text.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return category as any;
    }
  }
  return 'general';
};

const determineImpact = (title: string): 'high' | 'medium' | 'low' => {
  const lowerTitle = title.toLowerCase();
  const highImpactKeywords = ['breaking', 'major', 'massive', 'record', 'historic', 'unprecedented'];
  const mediumImpactKeywords = ['significant', 'notable', 'important', 'key', 'substantial'];

  if (highImpactKeywords.some(keyword => lowerTitle.includes(keyword))) return 'high';
  if (mediumImpactKeywords.some(keyword => lowerTitle.includes(keyword))) return 'medium';
  return 'low';
};

// Utility function to truncate text to a specific word count
const truncateDescription = (text: string, maxWords: number = NEWS_CONFIG.maxDescriptionWords): string => {
  if (!text) return 'No description available';

  const words = text.split(' ');
  if (words.length <= maxWords) return text;

  return words.slice(0, maxWords).join(' ') + '...';
};

// Main news service
export const newsService = {
  // Fetch crypto news from newsdata.io
  async fetchCryptoNews(): Promise<NewsArticle[]> {
    console.log('� === STARTING NEWS FETCH ===');

    // Check cache first
    const now = Date.now();
    const cacheAge = now - newsCache.timestamp;
    const isCacheValid = newsCache.data && cacheAge < NEWS_CONFIG.cacheTimeout;

    if (isCacheValid) {
      console.log('📦 Using cached news data (age:', Math.round(cacheAge / 1000 / 60), 'minutes)');
      return newsCache.data!;
    }

    if (newsCache.isRateLimited && cacheAge < 60 * 60 * 1000) { // Rate limited within last hour
      console.info('Rate limited - using fallback news (resets in 24h)');
      return this.getFallbackNews();
    }

    console.log('�🔍 API Key check:', {
      hasKey: !!API_KEY,
      keyLength: API_KEY?.length || 0,
      keyPreview: API_KEY ? `${API_KEY.substring(0, 15)}...` : 'Not set',
      isDefault: API_KEY === 'your-newsdata-api-key-here'
    });

    try {
      if (!API_KEY || API_KEY === 'your-newsdata-api-key-here') {
        console.warn('❌ Newsdata.io API key not configured, using fallback data');
        console.warn('Expected format: pub_xxxxxxxxxxxxxxxxxxxxxxxxx');
        return this.getFallbackNews();
      }

      console.log('✅ API key found, attempting to fetch news from newsdata.io...');

      // Build request with multiple crypto terms and English language (free plan max size=10)
      const cryptoQuery = 'bitcoin OR cryptocurrency OR ethereum OR blockchain OR crypto';
      const url = `${BASE_URL}?apikey=${API_KEY}&q=${encodeURIComponent(cryptoQuery)}&language=en&size=10`;
      console.log('📡 Making crypto-focused API request to:', url.replace(API_KEY, 'API_KEY_HIDDEN'));

      const response = await fetch(url);

      console.log('📥 API Response status:', response.status, response.statusText);

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ API request failed:', response.status, response.statusText);
        console.error('❌ API error details:', data);
        console.error('❌ Full error response:', JSON.stringify(data, null, 2));

        // Handle specific error cases
        if (response.status === 429) {
          console.warn('⚠️ Rate limit exceeded - using cached/fallback data');
          console.warn('💡 Newsdata.io free plan: 200 requests/day');
          console.warn('🔄 Rate limit resets daily');
          throw new Error('Rate limit exceeded');
        } else if (response.status === 422) {
          console.error('❌ Invalid request parameters');
          console.error('❌ Specific error:', data.results?.message || data.message);
          console.error('❌ Error code:', data.results?.code || data.code);
          throw new Error('Invalid API request parameters');
        }

        throw new Error(`Newsdata.io API error: ${response.status} ${response.statusText} - ${data.results?.message || data.message || 'Unknown error'}`);
      }

      console.log('📊 API Response data:', {
        status: data.status,
        totalResults: data.totalResults,
        resultsCount: data.results?.length || 0
      });

      if (data.status !== 'success') {
        console.error('❌ API returned error status:', data);
        throw new Error(`API returned error: ${data.message || 'Unknown error'}`);
      }

      // Transform newsdata.io response to our format
      console.log('🔄 Processing API results...');
      console.log('Raw results count:', data.results?.length || 0);

      const filteredResults = data.results.filter((article: any) => {
        // More lenient filtering for crypto-relevant content
        const text = (article.title + ' ' + (article.description || '') + ' ' + (article.content || '')).toLowerCase();

        // Primary crypto keywords (high relevance)
        const primaryKeywords = ['bitcoin', 'cryptocurrency', 'crypto', 'blockchain', 'ethereum', 'btc', 'eth'];
        const hasPrimaryKeyword = primaryKeywords.some(keyword => text.includes(keyword));

        // Secondary crypto keywords (medium relevance)
        const secondaryKeywords = ['digital currency', 'virtual currency', 'altcoin', 'defi', 'nft', 'web3', 'metaverse'];
        const hasSecondaryKeyword = secondaryKeywords.some(keyword => text.includes(keyword));

        // Financial keywords that might be crypto-related
        const financialKeywords = ['digital asset', 'virtual asset', 'token', 'mining', 'wallet', 'exchange'];
        const hasFinancialKeyword = financialKeywords.some(keyword => text.includes(keyword));

        const isRelevant = hasPrimaryKeyword || hasSecondaryKeyword || hasFinancialKeyword;

        if (!isRelevant) {
          console.log('❌ Filtered out:', article.title?.substring(0, 50) + '...');
        } else {
          console.log('✅ Included:', article.title?.substring(0, 50) + '...');
        }

        return isRelevant;
      });

      console.log('Filtered results count:', filteredResults.length);

      const articles: NewsArticle[] = filteredResults
        .map((article: any, index: number) => ({
          id: article.article_id || index.toString(),
          title: article.title || 'No title',
          description: truncateDescription(article.description, 25), // Limit to 25 words
          content: article.content || article.description,
          url: article.link || '#',
          urlToImage: article.image_url || null,
          publishedAt: article.pubDate || new Date().toISOString(),
          source: {
            name: article.source_id || 'Unknown Source'
          },
          sentiment: determineSentiment(article.title + ' ' + (article.description || '')),
          category: determineCategory(article.title + ' ' + (article.description || '')),
          impact: determineImpact(article.title || '')
        }))
        .slice(0, NEWS_CONFIG.maxArticles); // Limit to configured number of articles

      console.log(`✅ Final articles count: ${articles.length}`);
      console.log('📰 Sample titles:', articles.slice(0, 3).map(a => a.title));

      if (articles.length < 15) {
        console.warn(`⚠️ Only ${articles.length} articles found, less than minimum 15`);
        console.warn('💡 Consider supplementing with fallback articles or trying broader search terms');

        // If we have very few articles, supplement with fallback
        if (articles.length < 5) {
          console.warn('🔄 Too few articles from API, supplementing with fallback news');
          const fallbackArticles = this.getFallbackNews();
          const supplemented = [...articles, ...fallbackArticles.slice(0, 15 - articles.length)];

          // Update cache with supplemented results
          newsCache = {
            data: supplemented,
            timestamp: Date.now(),
            isRateLimited: false
          };

          return supplemented;
        }
      }

      // Cache successful results
      newsCache = {
        data: articles,
        timestamp: Date.now(),
        isRateLimited: false
      };

      return articles;

    } catch (error) {
      // Handle rate limiting gracefully
      if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
        newsCache.isRateLimited = true;
        newsCache.timestamp = Date.now();
        console.warn('⚠️ Newsdata.io rate limit exceeded (200/day) - using high-quality fallback news');
        console.info('💡 Rate limit resets in 24 hours. Fallback news provides 15+ crypto articles.');
      } else {
        console.error('❌ Error fetching news from newsdata.io:', error);
      }

      return this.getFallbackNews();
    }
  },

  // Fallback news data when API is unavailable
  getFallbackNews(): NewsArticle[] {
    const fallbackArticles: NewsArticle[] = [
      {
        id: '1',
        title: "Bitcoin ETF Inflows Reach Record Highs as Institutional Adoption Accelerates",
        description: "Spot Bitcoin ETFs see unprecedented institutional demand from major pension funds and endowments allocating to digital assets.",
        url: "#",
        urlToImage: null,
        publishedAt: new Date().toISOString(),
        source: { name: "CoinDesk" },
        sentiment: 'positive',
        category: 'bitcoin',
        impact: 'high'
      },
      {
        id: '2',
        title: "Ethereum Layer 2 Solutions See 300% Growth in Transaction Volume",
        description: "Layer 2 scaling solutions experience massive growth as users seek lower fees and faster transactions.",
        url: "#",
        urlToImage: null,
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { name: "The Block" },
        sentiment: 'positive',
        category: 'ethereum',
        impact: 'medium'
      },
      {
        id: '3',
        title: "DeFi Total Value Locked Surpasses $100 Billion Milestone",
        description: "Decentralized Finance protocols reach new heights as institutional and retail investors embrace DeFi yields.",
        url: "#",
        urlToImage: null,
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: { name: "DeFi Pulse" },
        sentiment: 'positive',
        category: 'defi',
        impact: 'high'
      },
      {
        id: '4',
        title: "Major Central Banks Accelerate CBDC Development Programs",
        description: "Multiple countries announce progress on Central Bank Digital Currencies, potentially reshaping global finance.",
        url: "#",
        urlToImage: null,
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        source: { name: "Reuters" },
        sentiment: 'neutral',
        category: 'regulation',
        impact: 'high'
      },
      {
        id: '5',
        title: "NFT Market Shows Signs of Recovery with Blue-Chip Collections",
        description: "Premium NFT collections see renewed interest from collectors as the market stabilizes after downturn.",
        url: "#",
        urlToImage: null,
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        source: { name: "NFT Now" },
        sentiment: 'neutral',
        category: 'nft',
        impact: 'medium'
      },
      {
        id: '6',
        title: "Solana Network Achieves Record Transaction Throughput",
        description: "Solana blockchain processes over 3,000 transactions per second during peak usage, demonstrating scalability improvements.",
        url: "#",
        urlToImage: null,
        publishedAt: new Date(Date.now() - 18000000).toISOString(),
        source: { name: "Solana Labs" },
        sentiment: 'positive',
        category: 'general',
        impact: 'medium'
      },
      {
        id: '7',
        title: "Institutional Crypto Custody Solutions See 400% Growth",
        description: "Traditional financial institutions rapidly adopt cryptocurrency custody services to meet growing client demand.",
        url: "#",
        urlToImage: null,
        publishedAt: new Date(Date.now() - 21600000).toISOString(),
        source: { name: "Coinbase Institutional" },
        sentiment: 'positive',
        category: 'general',
        impact: 'high'
      },
      {
        id: '8',
        title: "Web3 Gaming Tokens Rally as Metaverse Interest Resurges",
        description: "Gaming-focused cryptocurrencies experience significant price appreciation as major studios announce blockchain integration.",
        url: "#",
        urlToImage: null,
        publishedAt: new Date(Date.now() - 25200000).toISOString(),
        source: { name: "GameFi News" },
        sentiment: 'positive',
        category: 'general',
        impact: 'medium'
      },
      {
        id: '9',
        title: "Ethereum Staking Yields Stabilize Around 4% as Network Matures",
        description: "Post-merge Ethereum staking rewards find equilibrium as validator participation reaches optimal levels.",
        url: "#",
        urlToImage: null,
        publishedAt: new Date(Date.now() - 28800000).toISOString(),
        source: { name: "Ethereum Foundation" },
        sentiment: 'positive',
        category: 'ethereum',
        impact: 'medium'
      },
      {
        id: '10',
        title: "Crypto Market Volatility Drops to 6-Month Low",
        description: "Reduced volatility signals market maturation as institutional investors increase cryptocurrency allocations significantly.",
        url: "#",
        urlToImage: null,
        publishedAt: new Date(Date.now() - 32400000).toISOString(),
        source: { name: "MarketWatch" },
        sentiment: 'positive',
        category: 'general',
        impact: 'medium'
      },
      {
        id: '11',
        title: "Polygon zkEVM Mainnet Launch Attracts Major DeFi Protocols",
        description: "Zero-knowledge Ethereum Virtual Machine goes live, enabling faster and cheaper transactions for DeFi.",
        url: "#",
        urlToImage: null,
        publishedAt: new Date(Date.now() - 36000000).toISOString(),
        source: { name: "Polygon Labs" },
        sentiment: 'positive',
        category: 'ethereum',
        impact: 'high'
      },
      {
        id: '12',
        title: "Bitcoin Mining Difficulty Reaches All-Time High",
        description: "Network security strengthens as mining difficulty adjustment reflects increased computational power dedicated to Bitcoin.",
        url: "#",
        urlToImage: null,
        publishedAt: new Date(Date.now() - 39600000).toISOString(),
        source: { name: "Bitcoin Magazine" },
        sentiment: 'positive',
        category: 'bitcoin',
        impact: 'medium'
      },
      {
        id: '13',
        title: "Chainlink Expands Cross-Chain Infrastructure with New Protocols",
        description: "Oracle network enhances interoperability solutions, connecting more blockchains for seamless data transfer.",
        url: "#",
        urlToImage: null,
        publishedAt: new Date(Date.now() - 43200000).toISOString(),
        source: { name: "Chainlink Labs" },
        sentiment: 'positive',
        category: 'general',
        impact: 'medium'
      },
      {
        id: '14',
        title: "Uniswap V4 Introduces Customizable Liquidity Pools",
        description: "Next-generation DEX allows developers to create tailored automated market makers with advanced features.",
        url: "#",
        urlToImage: null,
        publishedAt: new Date(Date.now() - 46800000).toISOString(),
        source: { name: "Uniswap Labs" },
        sentiment: 'positive',
        category: 'defi',
        impact: 'high'
      },
      {
        id: '15',
        title: "Crypto Regulatory Framework Gains Bipartisan Support",
        description: "Comprehensive digital asset legislation moves forward with support from both political parties.",
        url: "#",
        urlToImage: null,
        publishedAt: new Date(Date.now() - 50400000).toISOString(),
        source: { name: "Congressional News" },
        sentiment: 'positive',
        category: 'regulation',
        impact: 'high'
      }
    ];

    const rateLimitStatus = newsCache.isRateLimited ? ' (Rate Limited)' : '';
    console.log(`📰 Using fallback crypto news data${rateLimitStatus}`);
    return fallbackArticles;
  },

  // Search news by keyword
  async searchNews(query: string): Promise<NewsArticle[]> {
    try {
      if (!API_KEY || API_KEY === 'your-newsdata-api-key-here') {
        return this.getFallbackNews().filter((article: NewsArticle) =>
          article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.description.toLowerCase().includes(query.toLowerCase())
        );
      }

      const params = new URLSearchParams({
        apikey: API_KEY,
        q: `${query} AND (${CRYPTO_KEYWORDS.slice(0, 3).join(' OR ')})`,
        language: 'en',
        size: '20'
      });

      const response = await fetch(`${BASE_URL}?${params}`);
      const data = await response.json();

      if (data.status !== 'success') {
        throw new Error('Search failed');
      }

      return data.results.map((article: any, index: number) => ({
        id: article.article_id || index.toString(),
        title: article.title || 'No title',
        description: truncateDescription(article.description, 25), // Limit to 25 words
        content: article.content || article.description,
        url: article.link || '#',
        urlToImage: article.image_url || null,
        publishedAt: article.pubDate || new Date().toISOString(),
        source: { name: article.source_id || 'Unknown Source' },
        sentiment: determineSentiment(article.title + ' ' + (article.description || '')),
        category: determineCategory(article.title + ' ' + (article.description || '')),
        impact: determineImpact(article.title || '')
      }));

    } catch (error) {
      console.error('Error searching news:', error);
      return [];
    }
  },

  // Clear cache and rate limit status
  clearCache(): void {
    newsCache = {
      data: null,
      timestamp: 0,
      isRateLimited: false
    };
    console.log('🗑️ News cache cleared');
  },

  // Get cache status
  getCacheStatus(): { hasCache: boolean; age: number; isRateLimited: boolean } {
    const age = Date.now() - newsCache.timestamp;
    return {
      hasCache: !!newsCache.data,
      age: Math.round(age / 1000 / 60), // Age in minutes
      isRateLimited: newsCache.isRateLimited
    };
  },

  // Test function for debugging
  async testAPI(): Promise<void> {
    console.log('🧪 === MANUAL API TEST ===');
;

    // Test direct API call
    try {
      const testUrl = `https://newsdata.io/api/1/news?apikey=${API_KEY}&q=bitcoin&language=en&size=10`;
      console.log('🔗 Test URL:', testUrl.replace(API_KEY, 'API_KEY_HIDDEN'));

      const response = await fetch(testUrl);
      console.log('📡 Direct API Response:', response.status, response.statusText);

      const data = await response.json();
      console.log('📊 Direct API Data:', data);

      // Test through service
      const articles = await this.fetchCryptoNews();
      console.log('✅ Service Test Result:', {
        articlesCount: articles.length,
        firstArticle: articles[0]?.title || 'No articles',
        isFromAPI: articles[0]?.source?.name !== 'CoinDesk' // CoinDesk is fallback
      });
    } catch (error) {
      console.error('❌ API Test Failed:', error);
    }
  }
};

// Make functions available globally for debugging
(window as any).testNewsAPI = newsService.testAPI.bind(newsService);
(window as any).clearNewsCache = newsService.clearCache.bind(newsService);
(window as any).getNewsCacheStatus = newsService.getCacheStatus.bind(newsService);
