import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ArrowLeft,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Coins,
  Loader2
} from 'lucide-react'
import { Portfolio, PortfolioSummary, PortfolioHolding } from '@/types/portfolio'
import { portfolioService } from '@/services/portfolioService'
import { AddHoldingDialog } from '@/components/portfolio/AddHoldingDialog'
import { EditHoldingDialog } from '@/components/portfolio/EditHoldingDialog'
import { EditPortfolioDialog } from '@/components/portfolio/EditPortfolioDialog'
import { AIPortfolioInsights } from '@/components/ai/AIPortfolioInsights'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { useConfirmationDialog } from '@/components/ui/confirmation-dialog'

// Component to handle async holding price calculation
function HoldingRow({
  holding,
  index,
  onEdit,
  onDelete,
  deletingId
}: {
  holding: PortfolioHolding
  index: number
  onEdit: (holding: PortfolioHolding) => void
  onDelete: (id: string) => void
  deletingId: string | null
}) {
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPrice = async () => {
      try {
        const price = await portfolioService.getCoinPrice(holding.coin_id)
        setCurrentPrice(price)
      } catch (error) {
        console.error('Failed to load price for', holding.coin_symbol, error)
        setCurrentPrice(0)
      } finally {
        setIsLoading(false)
      }
    }

    loadPrice()
  }, [holding.coin_id])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    return ${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%
  }

  if (isLoading) {
    return (
      <tr className="border-b border-border hover:bg-muted/50 transition-colors">
        <td className="py-3 px-2 sm:px-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
            <div>
              <div className="font-medium text-foreground">{holding.coin_symbol}</div>
              <div className="text-sm text-muted-foreground">{holding.coin_name}</div>
            </div>
          </div>
        </td>
        <td className="text-right py-3 px-2 sm:px-4">
          <div className="w-16 h-4 bg-muted rounded animate-pulse ml-auto" />
        </td>
        <td className="text-right py-3 px-2 sm:px-4">
          <div className="w-20 h-4 bg-muted rounded animate-pulse ml-auto" />
        </td>
        <td className="text-right py-3 px-2 sm:px-4">
          <div className="w-20 h-4 bg-muted rounded animate-pulse ml-auto" />
        </td>
        <td className="text-right py-3 px-2 sm:px-4">
          <div className="w-16 h-4 bg-muted rounded animate-pulse ml-auto" />
        </td>
        <td className="text-right py-3 px-2 sm:px-4">
          <div className="flex justify-end space-x-2">
            <div className="w-8 h-8 bg-muted rounded animate-pulse" />
            <div className="w-8 h-8 bg-muted rounded animate-pulse" />
          </div>
        </td>
      </tr>
    )
  }

  const currentValue = holding.amount * currentPrice
  const investedValue = holding.amount * holding.purchase_price
  const profitLoss = currentValue - investedValue
  const profitLossPercentage = investedValue > 0 ? (profitLoss / investedValue) * 100 : 0
  const isHoldingPositive = profitLossPercentage >= 0

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      <td className="py-3 px-2 sm:px-4">
        <div className="flex items-center space-x-3">
          <img
            src={https://coinicons-api.vercel.app/api/icon/${holding.coin_symbol.toLowerCase()}}
            alt={holding.coin_name}
            className="w-8 h-8 rounded-full"
            onError={(e) => {
              e.currentTarget.src = https://via.placeholder.com/32/1a1a1a/ffffff?text=${holding.coin_symbol.charAt(0)}
            }}
          />
          <div>
            <div className="font-medium text-foreground">{holding.coin_symbol}</div>
            <div className="text-sm text-muted-foreground">{holding.coin_name}</div>
          </div>
        </div>
      </td>
      <td className="text-right py-3 px-2 sm:px-4 font-mono text-foreground">
        {holding.amount.toLocaleString(undefined, { maximumFractionDigits: 8 })}
      </td>
      <td className="text-right py-3 px-2 sm:px-4 font-mono text-muted-foreground">
        {formatCurrency(holding.purchase_price)}
      </td>
      <td className="text-right py-3 px-2 sm:px-4 font-mono text-foreground">
        {formatCurrency(currentPrice)}
      </td>
      <td className="text-right py-3 px-2 sm:px-4 font-mono text-foreground">
        {formatCurrency(currentValue)}
      </td>
      <td className="text-right py-3 px-2 sm:px-4">
        <div className={font-mono ${isHoldingPositive ? 'text-crypto-green' : 'text-crypto-red'}}>
          {formatPercentage(profitLossPercentage)}
        </div>
      </td>
      <td className="text-right py-3 px-2 sm:px-4">
        <div className="flex justify-end space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(holding)}
            className="text-muted-foreground hover:text-crypto-blue"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(holding.id)}
            disabled={deletingId === holding.id}
            className="text-muted-foreground hover:text-crypto-red"
          >
            {deletingId === holding.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </td>
    </tr>
  )
}

// Mobile card component for holdings
function HoldingCard({
  holding,
  onEdit,
  onDelete,
  deletingId
}: {
  holding: PortfolioHolding
  onEdit: (holding: PortfolioHolding) => void
  onDelete: (id: string) => void
  deletingId: string | null
}) {
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPrice = async () => {
      try {
        const price = await portfolioService.getCoinPrice(holding.coin_id)
        setCurrentPrice(price)
      } catch (error) {
        console.error('Failed to load price for', holding.coin_symbol, error)
        setCurrentPrice(0)
      } finally {
        setIsLoading(false)
      }
    }

    loadPrice()
  }, [holding.coin_id])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    return ${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <Card className="bg-muted/20 border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="w-24 h-4 bg-muted rounded animate-pulse mb-1" />
              <div className="w-16 h-3 bg-muted rounded animate-pulse" />
            </div>
            <div className="flex space-x-2">
              <div className="w-8 h-8 bg-muted rounded animate-pulse" />
              <div className="w-8 h-8 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="w-16 h-3 bg-muted rounded animate-pulse mb-1" />
                <div className="w-20 h-4 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentValue = holding.amount * currentPrice
  const investedValue = holding.amount * holding.purchase_price
  const profitLoss = currentValue - investedValue
  const profitLossPercentage = investedValue > 0 ? (profitLoss / investedValue) * 100 : 0
  const isHoldingPositive = profitLossPercentage >= 0

  return (
    <Card className="bg-muted/20 border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-medium text-foreground">{holding.coin_name}</h4>
            <p className="text-sm text-muted-foreground">{holding.coin_symbol.toUpperCase()}</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(holding)}
              className="hover:bg-crypto-blue/10"
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(holding.id)}
              disabled={deletingId === holding.id}
              className="text-crypto-red hover:bg-crypto-red/10"
            >
              {deletingId === holding.id ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Trash2 className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Amount</p>
            <p className="font-mono">{holding.amount.toFixed(8)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Current Value</p>
            <p className="font-mono">{formatCurrency(currentValue)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Purchase Price</p>
            <p className="font-mono">{formatCurrency(holding.purchase_price)}</p>
            <p className="text-xs text-muted-foreground">{formatDate(holding.purchase_date)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">P&L</p>
            <p className={`font-mono ${
              isHoldingPositive ? 'text-crypto-green' : 'text-crypto-red'
            }`}>
              {formatCurrency(profitLoss)}
            </p>
            <p className={`text-xs ${
              isHoldingPositive ? 'text-crypto-green' : 'text-crypto-red'
            }`}>
              {formatPercentage(profitLossPercentage)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PortfolioDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddHolding, setShowAddHolding] = useState(false)
  const [editingHolding, setEditingHolding] = useState<any>(null)
  const [deletingHoldingId, setDeletingHoldingId] = useState<string | null>(null)
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const [showEditPortfolio, setShowEditPortfolio] = useState(false)
  const { deleteHolding } = usePortfolio()
  const { showConfirmation, ConfirmationDialog, isProcessing } = useConfirmationDialog()

  const loadPortfolioSummary = async (portfolioData: Portfolio) => {
    setIsLoadingSummary(true)
    try {
      const summaryData = await portfolioService.calculatePortfolioSummary(portfolioData)
      setSummary(summaryData)
    } catch (err) {
      console.error('Failed to load portfolio summary:', err)
      // Set a default summary if calculation fails
      setSummary({
        total_value: 0,
        total_invested: 0,
        total_profit_loss: 0,
        profit_loss_percentage: 0,
        best_performer: null,
        worst_performer: null
      })
    } finally {
      setIsLoadingSummary(false)
    }
  }

  useEffect(() => {
    const loadPortfolio = async () => {
      if (!id) {
        setError('Portfolio ID not provided')
        setLoading(false)
        return
      }

      try {
        const portfolioData = await portfolioService.getPortfolio(id)
        if (!portfolioData) {
          setError('Portfolio not found')
        } else {
          setPortfolio(portfolioData)
          // Load summary after portfolio is loaded
          await loadPortfolioSummary(portfolioData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load portfolio')
      } finally {
        setLoading(false)
      }
    }

    loadPortfolio()
  }, [id])

  const handleDeleteHolding = async (holdingId: string) => {
    // Prevent multiple dialogs if one is already processing
    if (isProcessing || deletingHoldingId) return

    const holding = portfolio?.holdings.find(h => h.id === holdingId)
    const holdingName = holding ? ${holding.coin_name} (${holding.coin_symbol}) : 'this holding'

    showConfirmation({
      title: 'Delete Holding',
      description: Are you sure you want to delete ${holdingName}? This action cannot be undone and will permanently remove this holding from your portfolio.,
      confirmText: 'Delete Holding',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        await deleteHolding(portfolio!.id, holdingId)
        // Refresh portfolio data
        const updatedPortfolio = await portfolioService.getPortfolio(portfolio!.id)
        if (updatedPortfolio) {
          setPortfolio(updatedPortfolio)
          // Refresh summary with updated portfolio
          await loadPortfolioSummary(updatedPortfolio)
        }
      }
    })
  }

  const handleEditHolding = (holding: any) => {
    setEditingHolding(holding)
  }

  const handleHoldingUpdated = async () => {
    // Refresh portfolio data
    const updatedPortfolio = await portfolioService.getPortfolio(portfolio!.id)
    if (updatedPortfolio) {
      setPortfolio(updatedPortfolio)
      // Refresh summary with updated portfolio
      await loadPortfolioSummary(updatedPortfolio)
    }
    setEditingHolding(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    return ${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crypto-green mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading portfolio...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="container mx-auto px-4 py-10">
          <Alert className="border-crypto-red/50 bg-crypto-red/10 max-w-md mx-auto">
            <AlertDescription className="text-crypto-red">
              {error || 'Portfolio not found'}
            </AlertDescription>
          </Alert>
          <div className="text-center mt-6">
            <Button asChild variant="outline">
              <Link to="/portfolio">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Portfolios
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state if summary is not ready
  if (!summary || isLoadingSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-crypto-green" />
            <span className="ml-2 text-muted-foreground">Loading portfolio summary...</span>
          </div>
        </div>
      </div>
    )
  }

  const isPositive = summary.profit_loss_percentage >= 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
                  <Button variant="outline" asChild size="sm">
                    <Link to="/portfolio">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Back</span>
                    </Link>
                  </Button>
                  <div className="min-w-0 flex-1 sm:flex-initial">
                    <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                      <span className="break-words">{portfolio.name}</span>
                      {portfolio.is_public && (
                        <Badge variant="outline" className="text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          Public
                        </Badge>
                      )}
                    </CardTitle>
                    {portfolio.description && (
                      <CardDescription className="text-muted-foreground text-lg mt-1">
                        {portfolio.description}
                      </CardDescription>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Created {formatDate(portfolio.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Coins className="w-4 h-4" />
                        <span>{portfolio.holdings.length} holdings</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                  <Button
                    onClick={() => setShowAddHolding(true)}
                    size="sm"
                    className="bg-crypto-green hover:bg-crypto-green/90 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Add Holding</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => setShowEditPortfolio(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Portfolio Summary */}
        <div className="animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-crypto-green" />
                  <span className="text-sm text-muted-foreground">Total Value</span>
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mt-2">
                  {formatCurrency(summary.total_value)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-crypto-blue" />
                  <span className="text-sm text-muted-foreground">Total Invested</span>
                </div>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {formatCurrency(summary.total_invested)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  {isPositive ? (
                    <TrendingUp className="w-5 h-5 text-crypto-green" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-crypto-red" />
                  )}
                  <span className="text-sm text-muted-foreground">P&L</span>
                </div>
                <p className={`text-2xl font-bold mt-2 ${
                  isPositive ? 'text-crypto-green' : 'text-crypto-red'
                }`}>
                  {formatCurrency(summary.total_profit_loss)}
                </p>
                <p className={`text-sm ${
                  isPositive ? 'text-crypto-green' : 'text-crypto-red'
                }`}>
                  {formatPercentage(summary.profit_loss_percentage)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Coins className="w-5 h-5 text-crypto-purple" />
                  <span className="text-sm text-muted-foreground">Holdings</span>
                </div>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {portfolio.holdings.length}
                </p>
                {summary.best_performer && (
                  <p className="text-sm text-crypto-green">
                    Best: {summary.best_performer.symbol} {formatPercentage(summary.best_performer.profit_loss_percentage)}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Portfolio Insights */}
        {portfolio.holdings.length > 0 && (
          <div className="animate-fade-in">
            <AIPortfolioInsights
              holdings={portfolio.holdings}
              totalValue={summary.total_value}
            />
          </div>
        )}

        {/* Holdings Table */}
        <div className="animate-fade-in">
          <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Holdings</CardTitle>
              <CardDescription>
                Your cryptocurrency holdings and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {portfolio.holdings.length === 0 ? (
                <div className="text-center py-12">
                  <Coins className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Holdings Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Add your first cryptocurrency holding to start tracking your portfolio
                  </p>
                  <Button
                    onClick={() => setShowAddHolding(true)}
                    className="bg-crypto-green hover:bg-crypto-green/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Holding
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="hidden sm:table-header-group">
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Asset</th>
                        <th className="text-right py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Amount</th>
                        <th className="text-right py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Purchase Price</th>
                        <th className="text-right py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Current Price</th>
                        <th className="text-right py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Current Value</th>
                        <th className="text-right py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">P&L</th>
                        <th className="text-right py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="hidden sm:table-row-group">
                      {portfolio.holdings.map((holding, index) => (
                        <HoldingRow
                          key={holding.id}
                          holding={holding}
                          index={index}
                          onEdit={handleEditHolding}
                          onDelete={handleDeleteHolding}
                          deletingId={deletingHoldingId}
                        />
                      ))}
                    </tbody>
                  </table>

                  {/* Mobile Card Layout */}
                  <div className="sm:hidden space-y-4">
                    {portfolio.holdings.map((holding) => (
                      <HoldingCard
                        key={holding.id}
                        holding={holding}
                        onEdit={handleEditHolding}
                        onDelete={handleDeleteHolding}
                        deletingId={deletingHoldingId}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add Holding Dialog */}
        <AddHoldingDialog
          open={showAddHolding}
          onOpenChange={setShowAddHolding}
          portfolioId={portfolio.id}
          onHoldingAdded={async () => {
            // Refresh portfolio data
            const updatedPortfolio = await portfolioService.getPortfolio(portfolio.id)
            if (updatedPortfolio) {
              setPortfolio(updatedPortfolio)
              // Refresh summary with updated portfolio
              await loadPortfolioSummary(updatedPortfolio)
            }
          }}
        />

        {/* Edit Holding Dialog */}
        <EditHoldingDialog
          open={!!editingHolding}
          onOpenChange={(open) => !open && setEditingHolding(null)}
          portfolioId={portfolio.id}
          holding={editingHolding}
          onHoldingUpdated={handleHoldingUpdated}
        />

        {/* Edit Portfolio Dialog */}
        <EditPortfolioDialog
          open={showEditPortfolio}
          onOpenChange={async (open) => {
            setShowEditPortfolio(open)
            if (!open) {
              // Refresh portfolio data after closing the edit dialog
              const updated = await portfolioService.getPortfolio(portfolio.id)
              if (updated) {
                setPortfolio(updated)
                await loadPortfolioSummary(updated)
              }
            }
          }}
          portfolio={portfolio}
        />

        {/* Confirmation Dialog */}
        <ConfirmationDialog />
      </div>
    </div>
  )
}