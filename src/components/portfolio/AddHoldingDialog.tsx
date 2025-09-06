import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Loader2, 
  Plus,
  AlertTriangle,
  Search,
  Calendar,
  DollarSign,
  Hash
} from 'lucide-react'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { portfolioService } from '@/services/portfolioService'
import { CoinSearchResult } from '@/types/portfolio'

const holdingSchema = z.object({
  coin_id: z.string().min(1, 'Please select a cryptocurrency'),
  amount: z.number().positive('Amount must be greater than 0'),
  purchase_price: z.number().positive('Purchase price must be greater than 0'),
  purchase_date: z.string().min(1, 'Purchase date is required'),
  notes: z.string().optional()
})

type HoldingFormData = z.infer<typeof holdingSchema>

interface AddHoldingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  portfolioId: string
  onHoldingAdded?: () => void
}

export const AddHoldingDialog = ({ 
  open, 
  onOpenChange, 
  portfolioId, 
  onHoldingAdded 
}: AddHoldingDialogProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<CoinSearchResult[]>([])
  const [selectedCoin, setSelectedCoin] = useState<CoinSearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const { addHolding } = usePortfolio()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<HoldingFormData>({
    resolver: zodResolver(holdingSchema),
    defaultValues: {
      coin_id: '',
      amount: 0,
      purchase_price: 0,
      purchase_date: new Date().toISOString().split('T')[0],
      notes: ''
    }
  })

  const amount = watch('amount')
  const purchasePrice = watch('purchase_price')

  // Search for coins
  useEffect(() => {
    const searchCoins = async () => {
      setIsSearching(true)
      try {
        const results = await portfolioService.searchCryptocurrencies(searchQuery)
        setSearchResults(results)
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(searchCoins, searchQuery.length === 0 ? 0 : 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  // Load initial coins when dialog opens
  useEffect(() => {
    if (open && searchResults.length === 0 && !searchQuery) {
      const loadInitialCoins = async () => {
        setIsSearching(true)
        try {
          const results = await portfolioService.searchCryptocurrencies('')
          setSearchResults(results)
        } catch (err) {
          console.error('Initial load error:', err)
        } finally {
          setIsSearching(false)
        }
      }
      loadInitialCoins()
    }
  }, [open])

  const handleCoinSelect = (coin: CoinSearchResult) => {
    setSelectedCoin(coin)
    setValue('coin_id', coin.id)
    // Don't auto-fill purchase price - let user enter their actual purchase price
    setSearchQuery('')
    setSearchResults([])
  }

  const onSubmit = async (data: HoldingFormData) => {
    if (!selectedCoin) {
      setError('Please select a cryptocurrency')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await addHolding(portfolioId, {
        coin_id: data.coin_id,
        coin_symbol: selectedCoin.symbol,
        coin_name: selectedCoin.name,
        amount: data.amount,
        purchase_price: data.purchase_price,
        purchase_date: data.purchase_date,
        notes: data.notes
      })

      reset()
      setSelectedCoin(null)
      onOpenChange(false)
      onHoldingAdded?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add holding')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      reset()
      setSelectedCoin(null)
      setSearchQuery('')
      setSearchResults([])
      setError(null)
      onOpenChange(false)
    }
  }

  const totalValue = amount && purchasePrice ? amount * purchasePrice : 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-glass-bg backdrop-blur-glass border-glass-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-foreground">
            <div className="p-2 bg-crypto-green/20 rounded-lg">
              <Plus className="w-5 h-5 text-crypto-green" />
            </div>
            <span>Add New Holding</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a cryptocurrency holding to your portfolio
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert className="border-crypto-red/50 bg-crypto-red/10">
              <AlertTriangle className="w-4 h-4 text-crypto-red" />
              <AlertDescription className="text-crypto-red">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Coin Selection */}
          <div className="space-y-2">
            <Label className="text-foreground">Cryptocurrency *</Label>
            {selectedCoin ? (
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border">
                <div>
                  <p className="font-medium text-foreground">{selectedCoin.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedCoin.symbol.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-foreground">${selectedCoin.current_price.toLocaleString()}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCoin(null)
                      setValue('coin_id', '')
                    }}
                    className="text-crypto-red hover:bg-crypto-red/10"
                  >
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search cryptocurrencies (BTC, ETH, ADA, etc.)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card border-border focus:border-crypto-green/50"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                )}
                
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {searchResults.map((coin) => (
                      <button
                        key={coin.id}
                        type="button"
                        onClick={() => handleCoinSelect(coin)}
                        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
                      >
                        <div>
                          <p className="font-medium text-foreground">{coin.name}</p>
                          <p className="text-sm text-muted-foreground">{coin.symbol.toUpperCase()}</p>
                        </div>
                        <p className="font-mono text-foreground">${coin.current_price.toLocaleString()}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-foreground flex items-center space-x-2">
              <Hash className="w-4 h-4" />
              <span>Amount *</span>
            </Label>
            <Input
              id="amount"
              type="number"
              step="any"
              placeholder="0.00000000"
              className="bg-card border-border focus:border-crypto-green/50 font-mono"
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-crypto-red">{errors.amount.message}</p>
            )}
          </div>

          {/* Purchase Price */}
          <div className="space-y-2">
            <Label htmlFor="purchase_price" className="text-foreground flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Purchase Price (USD) *</span>
              </div>
              {selectedCoin && (
                <span className="text-xs text-muted-foreground">
                  Current: ${selectedCoin.current_price.toLocaleString()}
                </span>
              )}
            </Label>
            <div className="flex space-x-2">
              <Input
                id="purchase_price"
                type="number"
                step="any"
                placeholder={selectedCoin ? `e.g., ${selectedCoin.current_price}` : "Enter your purchase price"}
                className="bg-card border-border focus:border-crypto-green/50 font-mono flex-1"
                {...register('purchase_price', { valueAsNumber: true })}
              />
              {selectedCoin && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setValue('purchase_price', selectedCoin.current_price)}
                  className="px-3 text-xs whitespace-nowrap"
                >
                  Use Current
                </Button>
              )}
            </div>
            {errors.purchase_price && (
              <p className="text-sm text-crypto-red">{errors.purchase_price.message}</p>
            )}
            {selectedCoin && (
              <p className="text-xs text-muted-foreground">
                Enter the price you actually paid, or click "Use Current" for recent purchases
              </p>
            )}
          </div>

          {/* Purchase Date */}
          <div className="space-y-2">
            <Label htmlFor="purchase_date" className="text-foreground flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Purchase Date *</span>
            </Label>
            <Input
              id="purchase_date"
              type="date"
              className="bg-card border-border focus:border-crypto-green/50"
              {...register('purchase_date')}
            />
            {errors.purchase_date && (
              <p className="text-sm text-crypto-red">{errors.purchase_date.message}</p>
            )}
          </div>

          {/* Total Value Display */}
          {totalValue > 0 && (
            <div className="p-3 bg-crypto-green/10 rounded-lg border border-crypto-green/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Investment:</span>
                <span className="font-mono font-bold text-crypto-green">
                  ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this purchase..."
              className="bg-card border-border focus:border-crypto-green/50 resize-none"
              rows={2}
              {...register('notes')}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !selectedCoin}
              className="flex-1 bg-crypto-green hover:bg-crypto-green/90 text-primary-foreground"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Holding'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
