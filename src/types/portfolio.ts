export interface PortfolioHolding {
  id: string
  coin_id: string
  coin_symbol: string
  coin_name: string
  amount: number
  purchase_price: number
  purchase_date: string
  notes?: string
}

export interface Portfolio {
  id: string
  user_id: string
  name: string
  description?: string
  is_public: boolean
  created_at: string
  updated_at: string
  holdings: PortfolioHolding[]
}

export interface PortfolioSummary {
  total_value: number
  total_invested: number
  total_profit_loss: number
  profit_loss_percentage: number
  best_performer: {
    symbol: string
    profit_loss_percentage: number
  } | null
  worst_performer: {
    symbol: string
    profit_loss_percentage: number
  } | null
}

export interface CoinSearchResult {
  id: string
  symbol: string
  name: string
  current_price: number
  image?: string
}

export interface CreatePortfolioData {
  name: string
  description?: string
  is_public: boolean
}

export interface AddHoldingData {
  coin_id: string
  coin_symbol: string
  coin_name: string
  amount: number
  purchase_price: number
  purchase_date: string
  notes?: string
}

export interface UpdateHoldingData extends Partial<AddHoldingData> {
  id: string
}
