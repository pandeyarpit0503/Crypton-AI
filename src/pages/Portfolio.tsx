import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Plus,
  Briefcase,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Loader2
} from 'lucide-react'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { useAuth } from '@/contexts/AuthContext'
import { portfolioService } from '@/services/portfolioService'
import { CreatePortfolioDialog } from '@/components/portfolio/CreatePortfolioDialog'
import { Portfolio, PortfolioSummary } from '@/types/portfolio'
import { useConfirmationDialog } from '@/components/ui/confirmation-dialog'

// Component to handle async portfolio summary calculation
function PortfolioCard({
  portfolio,
  index,
  onDelete,
  isDeleting = false
}: {
  portfolio: Portfolio
  index: number
  onDelete: (id: string) => void
  isDeleting?: boolean
}) {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const summaryData = await portfolioService.calculatePortfolioSummary(portfolio)
        setSummary(summaryData)
      } catch (error) {
        console.error('Failed to calculate portfolio summary:', error)
        // Set default summary on error
        setSummary({
          total_value: 0,
          total_invested: 0,
          total_profit_loss: 0,
          profit_loss_percentage: 0,
          best_performer: null,
          worst_performer: null
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSummary()
  }, [portfolio])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`
  }

  if (isLoading || !summary) {
    return (
      <Card
        className="group bg-glass-bg backdrop-blur-glass border-glass-border transition-all duration-500 overflow-hidden animate-scale-in"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-xl text-foreground">{portfolio.name}</CardTitle>
          {portfolio.description && (
            <CardDescription className="text-muted-foreground">
              {portfolio.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center h-20">
            <Loader2 className="w-6 h-6 animate-spin text-crypto-green" />
            <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isPositive = summary.profit_loss_percentage >= 0

  return (
    <Card
      className="group bg-glass-bg backdrop-blur-glass border-glass-border hover:border-crypto-green/50 hover:scale-105 hover:shadow-xl hover:shadow-crypto-green/20 transition-all duration-500 overflow-hidden animate-scale-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl text-foreground group-hover:text-crypto-green transition-colors">
              {portfolio.name}
            </CardTitle>
            {portfolio.description && (
              <CardDescription className="text-muted-foreground mt-1">
                {portfolio.description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {portfolio.is_public && (
              <Badge variant="outline" className="text-xs">
                <Eye className="w-3 h-3 mr-1" />
                Public
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(portfolio.id)}
              disabled={isDeleting}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-crypto-red disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">Total Value</span>
            </div>
            <p className="text-lg font-bold text-foreground mt-1">
              {formatCurrency(summary.total_value)}
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-crypto-green" />
              ) : (
                <TrendingDown className="w-4 h-4 text-crypto-red" />
              )}
              <span className="text-sm">P&L</span>
            </div>
            <p className={`text-lg font-bold mt-1 ${
              isPositive ? 'text-crypto-green' : 'text-crypto-red'
            }`}>
              {formatPercentage(summary.profit_loss_percentage)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm">{portfolio.holdings.length} Holdings</span>
          </div>
          <Link to={`/portfolio/${portfolio.id}`}>
            <Button size="sm" className="bg-crypto-green hover:bg-crypto-green/90">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Portfolio() {
  const { portfolios, loading, error, deletePortfolio, refreshPortfolios } = usePortfolio()
  const { user } = useAuth()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [creatingSample, setCreatingSample] = useState(false)
  const { showConfirmation, ConfirmationDialog, isProcessing } = useConfirmationDialog()

  const handleDeletePortfolio = async (id: string) => {
    // Prevent multiple dialogs if one is already processing
    if (isProcessing || deletingId) return

    const portfolio = portfolios.find(p => p.id === id)
    const portfolioName = portfolio?.name || 'this portfolio'

    showConfirmation({
      title: 'Delete Portfolio',
      description: `Are you sure you want to delete "${portfolioName}"? This action cannot be undone and will permanently remove all holdings and data associated with this portfolio.`,
      confirmText: 'Delete Portfolio',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        await deletePortfolio(id)
      }
    })
  }

  const handleCreateSamplePortfolio = async () => {
    if (!user) return

    setCreatingSample(true)
    try {
      await portfolioService.createSamplePortfolio(user.id)
      await refreshPortfolios()
    } catch (err) {
      console.error('Failed to create sample portfolio:', err)
    } finally {
      setCreatingSample(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crypto-green mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading portfolios...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center space-x-2 sm:space-x-3 bg-gradient-primary bg-clip-text text-transparent">
                    <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-crypto-green" />
                    <span>My Portfolios</span>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm sm:text-base lg:text-lg mt-2">
                    Track and manage your cryptocurrency investments
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                  <Button
                    onClick={handleCreateSamplePortfolio}
                    disabled={creatingSample}
                    variant="outline"
                    size="sm"
                    className="border-crypto-blue text-crypto-blue hover:bg-crypto-blue/10 w-full sm:w-auto"
                  >
                    {creatingSample ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Sample Portfolio</span>
                        <span className="sm:hidden">Sample</span>
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    size="sm"
                    className="bg-crypto-green hover:bg-crypto-green/90 text-primary-foreground transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Portfolio
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-crypto-red/50 bg-crypto-red/10">
            <AlertDescription className="text-crypto-red">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Portfolios Grid */}
        <div className="animate-fade-in">
          {portfolios.length === 0 ? (
            <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
              <CardContent className="p-12 text-center">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Portfolios Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first portfolio to start tracking your cryptocurrency investments
                </p>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-crypto-green hover:bg-crypto-green/90 text-primary-foreground"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Portfolio
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {portfolios.map((portfolio, index) => (
                <PortfolioCard
                  key={portfolio.id}
                  portfolio={portfolio}
                  index={index}
                  onDelete={handleDeletePortfolio}
                  isDeleting={isProcessing && deletingId === portfolio.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Create Portfolio Dialog */}
        <CreatePortfolioDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />

        {/* Confirmation Dialog */}
        <ConfirmationDialog />
      </div>
    </div>
  )
}
