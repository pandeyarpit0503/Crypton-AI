import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Portfolio, CreatePortfolioData, AddHoldingData, UpdateHoldingData } from '@/types/portfolio'
import { portfolioService } from '@/services/portfolioService'
import { useAuth } from './AuthContext'

interface PortfolioContextType {
  portfolios: Portfolio[]
  currentPortfolio: Portfolio | null
  loading: boolean
  error: string | null
  createPortfolio: (data: CreatePortfolioData) => Promise<Portfolio>
  updatePortfolio: (id: string, data: Partial<CreatePortfolioData>) => Promise<Portfolio>
  deletePortfolio: (id: string) => Promise<void>
  setCurrentPortfolio: (portfolio: Portfolio | null) => void
  addHolding: (portfolioId: string, data: AddHoldingData) => Promise<void>
  updateHolding: (portfolioId: string, data: UpdateHoldingData) => Promise<void>
  deleteHolding: (portfolioId: string, holdingId: string) => Promise<void>
  refreshPortfolios: () => Promise<void>
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined)

export const usePortfolio = () => {
  const context = useContext(PortfolioContext)
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider')
  }
  return context
}

interface PortfolioProviderProps {
  children: ReactNode
}

export const PortfolioProvider = ({ children }: PortfolioProviderProps) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [currentPortfolio, setCurrentPortfolio] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const refreshPortfolios = async () => {
    if (!user) {
      setPortfolios([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Try to migrate localStorage data to Supabase if needed
      await portfolioService.migrateLocalStorageToSupabase()

      const userPortfolios = await portfolioService.getPortfolios()
      setPortfolios(userPortfolios)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolios')
    } finally {
      setLoading(false)
    }
  }

  const createPortfolio = async (data: CreatePortfolioData): Promise<Portfolio> => {
    setLoading(true)
    setError(null)
    
    try {
      const newPortfolio = await portfolioService.createPortfolio(data)
      setPortfolios(prev => [...prev, newPortfolio])
      return newPortfolio
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create portfolio'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updatePortfolio = async (id: string, data: Partial<CreatePortfolioData>): Promise<Portfolio> => {
    setLoading(true)
    setError(null)
    
    try {
      const updatedPortfolio = await portfolioService.updatePortfolio(id, data)
      setPortfolios(prev => prev.map(p => p.id === id ? updatedPortfolio : p))
      
      if (currentPortfolio?.id === id) {
        setCurrentPortfolio(updatedPortfolio)
      }
      
      return updatedPortfolio
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update portfolio'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const deletePortfolio = async (id: string): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      await portfolioService.deletePortfolio(id)
      setPortfolios(prev => prev.filter(p => p.id !== id))
      
      if (currentPortfolio?.id === id) {
        setCurrentPortfolio(null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete portfolio'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const addHolding = async (portfolioId: string, data: AddHoldingData): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      await portfolioService.addHolding(portfolioId, data)
      await refreshPortfolios()
      
      // Update current portfolio if it's the one being modified
      if (currentPortfolio?.id === portfolioId) {
        const updatedPortfolio = await portfolioService.getPortfolio(portfolioId)
        setCurrentPortfolio(updatedPortfolio)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add holding'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateHolding = async (portfolioId: string, data: UpdateHoldingData): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      await portfolioService.updateHolding(portfolioId, data)
      await refreshPortfolios()
      
      // Update current portfolio if it's the one being modified
      if (currentPortfolio?.id === portfolioId) {
        const updatedPortfolio = await portfolioService.getPortfolio(portfolioId)
        setCurrentPortfolio(updatedPortfolio)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update holding'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const deleteHolding = async (portfolioId: string, holdingId: string): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      await portfolioService.deleteHolding(portfolioId, holdingId)
      await refreshPortfolios()
      
      // Update current portfolio if it's the one being modified
      if (currentPortfolio?.id === portfolioId) {
        const updatedPortfolio = await portfolioService.getPortfolio(portfolioId)
        setCurrentPortfolio(updatedPortfolio)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete holding'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Load portfolios when user changes
  useEffect(() => {
    refreshPortfolios()
  }, [user])

  const value = {
    portfolios,
    currentPortfolio,
    loading,
    error,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    setCurrentPortfolio,
    addHolding,
    updateHolding,
    deleteHolding,
    refreshPortfolios
  }

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  )
}
