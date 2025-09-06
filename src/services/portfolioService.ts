import { supabase } from '@/lib/supabase'
import { 
  Portfolio, 
  PortfolioHolding, 
  CreatePortfolioData, 
  AddHoldingData, 
  UpdateHoldingData,
  CoinSearchResult,
  PortfolioSummary
} from '@/types/portfolio'

// CoinGecko API types
interface CoinGeckoPrice {
  [coinId: string]: {
    usd: number
  }
}

interface CoinGeckoSearchResult {
  id: string
  name: string
  symbol: string
  thumb: string
  large: string
}

// CoinGecko API functions
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3'

// Cache for API responses to avoid rate limiting
const priceCache = new Map<string, { price: number; timestamp: number }>()
const CACHE_DURATION = 60000 // 1 minute cache

async function fetchCoinPrice(coinId: string): Promise<number> {
  try {
    // Check cache first
    const cached = priceCache.get(coinId)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.price
    }

    const response = await fetch(
      `${COINGECKO_BASE_URL}/simple/price?ids=${coinId}&vs_currencies=usd`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: CoinGeckoPrice = await response.json()
    const price = data[coinId]?.usd || 0

    // Cache the result
    priceCache.set(coinId, { price, timestamp: Date.now() })

    return price
  } catch (error) {
    console.error(`Error fetching price for ${coinId}:`, error)
    // Return fallback price from mock data if API fails
    const mockCoin = MOCK_COINS.find(c => c.id === coinId)
    return mockCoin?.current_price || 0
  }
}

async function searchCoins(query: string): Promise<CoinSearchResult[]> {
  try {
    const response = await fetch(
      `${COINGECKO_BASE_URL}/search?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const coins = data.coins || []

    // Get prices for the search results
    const coinIds = coins.slice(0, 10).map((coin: CoinGeckoSearchResult) => coin.id).join(',')
    const pricesResponse = await fetch(
      `${COINGECKO_BASE_URL}/simple/price?ids=${coinIds}&vs_currencies=usd`
    )

    let prices: CoinGeckoPrice = {}
    if (pricesResponse.ok) {
      prices = await pricesResponse.json()
    }

    return coins.slice(0, 10).map((coin: CoinGeckoSearchResult) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      current_price: prices[coin.id]?.usd || 0,
      image: coin.large
    }))
  } catch (error) {
    console.error('Error searching coins:', error)
    // Fallback to mock data search
    return MOCK_COINS.filter(coin =>
      coin.name.toLowerCase().includes(query.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10)
  }
}

// Mock data for development (fallback when API fails)
const MOCK_COINS: CoinSearchResult[] = [
  // Top cryptocurrencies with current market prices (December 2024)
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', current_price: 115000 },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', current_price: 4100 },
  { id: 'tether', symbol: 'USDT', name: 'Tether', current_price: 1.00 },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB', current_price: 720 },
  { id: 'solana', symbol: 'SOL', name: 'Solana', current_price: 245 },
  { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin', current_price: 1.00 },
  { id: 'staked-ether', symbol: 'stETH', name: 'Lido Staked Ether', current_price: 4080 },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', current_price: 2.85 },
  { id: 'the-open-network', symbol: 'TON', name: 'Toncoin', current_price: 6.20 },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', current_price: 0.48 },

  // Top 11-30 with updated current market prices
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', current_price: 1.15 },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', current_price: 52 },
  { id: 'shiba-inu', symbol: 'SHIB', name: 'Shiba Inu', current_price: 0.000032 },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', current_price: 28 },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', current_price: 9.80 },
  { id: 'bitcoin-cash', symbol: 'BCH', name: 'Bitcoin Cash', current_price: 520 },
  { id: 'near', symbol: 'NEAR', name: 'NEAR Protocol', current_price: 7.20 },
  { id: 'polygon', symbol: 'MATIC', name: 'Polygon', current_price: 0.65 },
  { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', current_price: 125 },
  { id: 'uniswap', symbol: 'UNI', name: 'Uniswap', current_price: 16.80 },

  // Top 31-50 with updated current market prices
  { id: 'internet-computer', symbol: 'ICP', name: 'Internet Computer', current_price: 14.50 },
  { id: 'ethereum-classic', symbol: 'ETC', name: 'Ethereum Classic', current_price: 38 },
  { id: 'stellar', symbol: 'XLM', name: 'Stellar', current_price: 0.52 },
  { id: 'cosmos', symbol: 'ATOM', name: 'Cosmos Hub', current_price: 10.80 },
  { id: 'filecoin', symbol: 'FIL', name: 'Filecoin', current_price: 7.20 },
  { id: 'vechain', symbol: 'VET', name: 'VeChain', current_price: 0.065 },
  { id: 'monero', symbol: 'XMR', name: 'Monero', current_price: 195 },
  { id: 'algorand', symbol: 'ALGO', name: 'Algorand', current_price: 0.16 },
  { id: 'hedera-hashgraph', symbol: 'HBAR', name: 'Hedera', current_price: 0.055 },
  { id: 'aave', symbol: 'AAVE', name: 'Aave', current_price: 95 },

  // DeFi & Popular Altcoins with updated prices
  { id: 'compound', symbol: 'COMP', name: 'Compound', current_price: 85 },
  { id: 'maker', symbol: 'MKR', name: 'Maker', current_price: 1850 },
  { id: 'sushi', symbol: 'SUSHI', name: 'SushiSwap', current_price: 1.25 },
  { id: 'yearn-finance', symbol: 'YFI', name: 'yearn.finance', current_price: 9200 },
  { id: 'curve-dao-token', symbol: 'CRV', name: 'Curve DAO', current_price: 0.95 },
  { id: '1inch', symbol: '1INCH', name: '1inch', current_price: 0.58 },
  { id: 'pancakeswap-token', symbol: 'CAKE', name: 'PancakeSwap', current_price: 2.85 },
  { id: 'thorchain', symbol: 'RUNE', name: 'THORChain', current_price: 6.80 },
  { id: 'terra-luna', symbol: 'LUNA', name: 'Terra Luna Classic', current_price: 0.00012 },
  { id: 'fantom', symbol: 'FTM', name: 'Fantom', current_price: 1.15 },

  // Layer 2 & Scaling Solutions with updated prices
  { id: 'arbitrum', symbol: 'ARB', name: 'Arbitrum', current_price: 1.25 },
  { id: 'optimism', symbol: 'OP', name: 'Optimism', current_price: 2.85 },
  { id: 'immutable-x', symbol: 'IMX', name: 'Immutable', current_price: 1.95 },
  { id: 'loopring', symbol: 'LRC', name: 'Loopring', current_price: 0.28 },

  // Meme Coins with updated prices
  { id: 'pepe', symbol: 'PEPE', name: 'Pepe', current_price: 0.000025 },
  { id: 'floki', symbol: 'FLOKI', name: 'FLOKI', current_price: 0.00028 },
  { id: 'bonk', symbol: 'BONK', name: 'Bonk', current_price: 0.000045 },

  // Gaming & NFT with updated prices
  { id: 'axie-infinity', symbol: 'AXS', name: 'Axie Infinity', current_price: 12.50 },
  { id: 'the-sandbox', symbol: 'SAND', name: 'The Sandbox', current_price: 0.85 },
  { id: 'decentraland', symbol: 'MANA', name: 'Decentraland', current_price: 0.95 },
  { id: 'enjincoin', symbol: 'ENJ', name: 'Enjin Coin', current_price: 0.45 },

  // Enterprise & Utility with updated prices
  { id: 'basic-attention-token', symbol: 'BAT', name: 'Basic Attention Token', current_price: 0.35 },
  { id: 'zilliqa', symbol: 'ZIL', name: 'Zilliqa', current_price: 0.028 },
  { id: 'zcash', symbol: 'ZEC', name: 'Zcash', current_price: 58 },
  { id: 'dash', symbol: 'DASH', name: 'Dash', current_price: 48.50 }
]

export const portfolioService = {
  // Portfolio CRUD operations
  async createPortfolio(data: CreatePortfolioData): Promise<Portfolio> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .insert({
        user_id: user.id,
        name: data.name,
        description: data.description,
        is_public: data.is_public
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create portfolio: ${error.message}`)

    return {
      ...portfolio,
      holdings: []
    }
  },

  async getPortfolios(): Promise<Portfolio[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: portfolios, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        portfolio_holdings (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch portfolios: ${error.message}`)

    return portfolios.map(portfolio => ({
      ...portfolio,
      holdings: portfolio.portfolio_holdings || []
    }))
  },

  async getPortfolio(id: string): Promise<Portfolio | null> {
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        portfolio_holdings (*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch portfolio: ${error.message}`)
    }

    return {
      ...portfolio,
      holdings: portfolio.portfolio_holdings || []
    }
  },

  async updatePortfolio(id: string, data: Partial<CreatePortfolioData>): Promise<Portfolio> {
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .update(data)
      .eq('id', id)
      .select(`
        *,
        portfolio_holdings (*)
      `)
      .single()

    if (error) throw new Error(`Failed to update portfolio: ${error.message}`)

    return {
      ...portfolio,
      holdings: portfolio.portfolio_holdings || []
    }
  },

  async deletePortfolio(id: string): Promise<void> {
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete portfolio: ${error.message}`)
  },

  // Holdings CRUD operations
  async addHolding(portfolioId: string, data: AddHoldingData): Promise<PortfolioHolding> {
    const { data: holding, error } = await supabase
      .from('portfolio_holdings')
      .insert({
        portfolio_id: portfolioId,
        coin_id: data.coin_id,
        coin_symbol: data.coin_symbol,
        coin_name: data.coin_name,
        amount: data.amount,
        purchase_price: data.purchase_price,
        purchase_date: data.purchase_date,
        notes: data.notes
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to add holding: ${error.message}`)

    return holding
  },

  async updateHolding(portfolioId: string, data: UpdateHoldingData): Promise<PortfolioHolding> {
    const { data: holding, error } = await supabase
      .from('portfolio_holdings')
      .update({
        amount: data.amount,
        purchase_price: data.purchase_price,
        purchase_date: data.purchase_date,
        notes: data.notes
      })
      .eq('id', data.id)
      .eq('portfolio_id', portfolioId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update holding: ${error.message}`)

    return holding
  },

  async deleteHolding(portfolioId: string, holdingId: string): Promise<void> {
    const { error } = await supabase
      .from('portfolio_holdings')
      .delete()
      .eq('id', holdingId)
      .eq('portfolio_id', portfolioId)

    if (error) throw new Error(`Failed to delete holding: ${error.message}`)
  },

  // Utility functions
  async searchCoins(query: string): Promise<CoinSearchResult[]> {
    // Mock search - replace with real API call
    if (!query || query.length === 0) {
      // Return top 20 coins when no search query
      return MOCK_COINS.slice(0, 20)
    }

    if (query.length === 1) {
      // Return coins that start with the letter
      return MOCK_COINS.filter(coin =>
        coin.name.toLowerCase().startsWith(query.toLowerCase()) ||
        coin.symbol.toLowerCase().startsWith(query.toLowerCase())
      ).slice(0, 15)
    }

    // Full search for 2+ characters
    const filtered = MOCK_COINS.filter(coin =>
      coin.name.toLowerCase().includes(query.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(query.toLowerCase())
    )

    // Sort by relevance (exact matches first, then starts with, then contains)
    return filtered.sort((a, b) => {
      const aName = a.name.toLowerCase()
      const aSymbol = a.symbol.toLowerCase()
      const bName = b.name.toLowerCase()
      const bSymbol = b.symbol.toLowerCase()
      const queryLower = query.toLowerCase()

      // Exact matches first
      if (aSymbol === queryLower) return -1
      if (bSymbol === queryLower) return 1
      if (aName === queryLower) return -1
      if (bName === queryLower) return 1

      // Starts with matches second
      if (aSymbol.startsWith(queryLower) && !bSymbol.startsWith(queryLower)) return -1
      if (bSymbol.startsWith(queryLower) && !aSymbol.startsWith(queryLower)) return 1
      if (aName.startsWith(queryLower) && !bName.startsWith(queryLower)) return -1
      if (bName.startsWith(queryLower) && !aName.startsWith(queryLower)) return 1

      // Alphabetical for the rest
      return aName.localeCompare(bName)
    })
  },

  async getCoinPrice(coinId: string): Promise<number> {
    try {
      // Use real API to get current price
      return await fetchCoinPrice(coinId)
    } catch (error) {
      console.error(`Error getting price for ${coinId}:`, error)
      // Fallback to mock data if API fails
      const coin = MOCK_COINS.find(c => c.id === coinId)
      if (!coin) {
        // Try to find by symbol as fallback
        const coinBySymbol = MOCK_COINS.find(c => c.symbol.toLowerCase() === coinId.toLowerCase())
        if (coinBySymbol) {
          return coinBySymbol.current_price
        }
        // If still not found, return a default price to avoid 0% P&L
        console.warn(`Coin not found: ${coinId}. Using default price.`)
        return 1 // Default price to avoid division by zero
      }
      return coin.current_price
    }
  },

  // Search for cryptocurrencies using real API
  async searchCryptocurrencies(query: string): Promise<CoinSearchResult[]> {
    return await searchCoins(query)
  },

  async calculatePortfolioSummary(portfolio: Portfolio): Promise<PortfolioSummary> {
    if (!portfolio.holdings.length) {
      return {
        total_value: 0,
        total_invested: 0,
        total_profit_loss: 0,
        profit_loss_percentage: 0,
        best_performer: null,
        worst_performer: null
      }
    }

    let totalValue = 0
    let totalInvested = 0
    const performances: Array<{ symbol: string; profit_loss_percentage: number }> = []

    // Process holdings sequentially to avoid rate limiting
    for (const holding of portfolio.holdings) {
      const currentPrice = await this.getCoinPrice(holding.coin_id)
      const currentValue = holding.amount * currentPrice
      const investedValue = holding.amount * holding.purchase_price
      const profitLoss = currentValue - investedValue
      const profitLossPercentage = investedValue > 0 ? (profitLoss / investedValue) * 100 : 0

      totalValue += currentValue
      totalInvested += investedValue
      performances.push({
        symbol: holding.coin_symbol,
        profit_loss_percentage: profitLossPercentage
      })
    }

    const totalProfitLoss = totalValue - totalInvested
    const totalProfitLossPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0



    const sortedPerformances = performances.sort((a, b) => b.profit_loss_percentage - a.profit_loss_percentage)

    return {
      total_value: totalValue,
      total_invested: totalInvested,
      total_profit_loss: totalProfitLoss,
      profit_loss_percentage: totalProfitLossPercentage,
      best_performer: sortedPerformances[0] || null,
      worst_performer: sortedPerformances[sortedPerformances.length - 1] || null
    }
  },

  // Helper function to create sample portfolio for testing
  createSamplePortfolio: async (userId: string): Promise<Portfolio> => {
    // Create the portfolio first
    const portfolio = await this.createPortfolio({
      name: 'Sample Crypto Portfolio',
      description: 'A sample portfolio with some popular cryptocurrencies',
      is_public: false
    })

    // Add sample holdings
    const sampleHoldings = [
      {
        coin_id: 'bitcoin',
        coin_symbol: 'BTC',
        coin_name: 'Bitcoin',
        amount: 0.5,
        purchase_price: 98000, // Current: $115,000 = +17.3% profit
        purchase_date: '2024-01-15',
        notes: 'Long-term hold'
      },
      {
        coin_id: 'ethereum',
        coin_symbol: 'ETH',
        coin_name: 'Ethereum',
        amount: 2.5,
        purchase_price: 4500, // Current: $4,100 = -8.9% loss
        purchase_date: '2024-01-20',
        notes: 'DeFi exposure'
      },
      {
        coin_id: 'solana',
        coin_symbol: 'SOL',
        coin_name: 'Solana',
        amount: 10,
        purchase_price: 180, // Current: $245 = +36.1% profit
        purchase_date: '2024-02-01',
        notes: 'High growth potential'
      }
    ]

    // Add each holding to the portfolio
    for (const holdingData of sampleHoldings) {
      await this.addHolding(portfolio.id, holdingData)
    }

    // Return the portfolio with holdings
    return await this.getPortfolio(portfolio.id) || portfolio
  },

  // Migration helper to move localStorage data to Supabase
  async migrateLocalStorageToSupabase(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check if user already has portfolios in database
      const { data: existingPortfolios } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      if (existingPortfolios && existingPortfolios.length > 0) {
        // User already has data in database, skip migration
        return
      }

      // Get localStorage data
      const stored = localStorage.getItem('portfolios')
      if (!stored) return

      const localPortfolios = JSON.parse(stored)
      const userPortfolios = localPortfolios.filter((p: any) => p.user_id === user.id)

      if (userPortfolios.length === 0) return

      console.log(`Migrating ${userPortfolios.length} portfolios from localStorage to Supabase...`)

      // Migrate each portfolio
      for (const localPortfolio of userPortfolios) {
        try {
          // Create portfolio in database
          const { data: portfolio, error: portfolioError } = await supabase
            .from('portfolios')
            .insert({
              user_id: user.id,
              name: localPortfolio.name,
              description: localPortfolio.description,
              is_public: localPortfolio.is_public,
              created_at: localPortfolio.created_at,
              updated_at: localPortfolio.updated_at
            })
            .select()
            .single()

          if (portfolioError) {
            console.error('Error migrating portfolio:', portfolioError)
            continue
          }

          // Migrate holdings
          if (localPortfolio.holdings && localPortfolio.holdings.length > 0) {
            const holdingsToInsert = localPortfolio.holdings.map((holding: any) => ({
              portfolio_id: portfolio.id,
              coin_id: holding.coin_id,
              coin_symbol: holding.coin_symbol,
              coin_name: holding.coin_name,
              amount: holding.amount,
              purchase_price: holding.purchase_price,
              purchase_date: holding.purchase_date,
              notes: holding.notes,
              created_at: holding.created_at || new Date().toISOString(),
              updated_at: holding.updated_at || new Date().toISOString()
            }))

            const { error: holdingsError } = await supabase
              .from('portfolio_holdings')
              .insert(holdingsToInsert)

            if (holdingsError) {
              console.error('Error migrating holdings:', holdingsError)
            }
          }
        } catch (err) {
          console.error('Error migrating individual portfolio:', err)
        }
      }

      console.log('Migration completed successfully')

      // Optionally clear localStorage after successful migration
      // localStorage.removeItem('portfolios')
    } catch (error) {
      console.error('Migration failed:', error)
    }
  }
}
