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
  Edit, 
  AlertTriangle, 
  Calendar,
  DollarSign,
  Hash
} from 'lucide-react'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { PortfolioHolding } from '@/types/portfolio'

const editHoldingSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  purchase_price: z.number().positive('Purchase price must be greater than 0'),
  purchase_date: z.string().min(1, 'Purchase date is required'),
  notes: z.string().optional()
})

type EditHoldingFormData = z.infer<typeof editHoldingSchema>

interface EditHoldingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  portfolioId: string
  holding: PortfolioHolding | null
  onHoldingUpdated?: () => void
}

export const EditHoldingDialog = ({ 
  open, 
  onOpenChange, 
  portfolioId, 
  holding,
  onHoldingUpdated 
}: EditHoldingDialogProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { updateHolding } = usePortfolio()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<EditHoldingFormData>({
    resolver: zodResolver(editHoldingSchema),
    defaultValues: {
      amount: 0,
      purchase_price: 0,
      purchase_date: '',
      notes: ''
    }
  })

  const amount = watch('amount')
  const purchasePrice = watch('purchase_price')

  // Reset form when holding changes
  useEffect(() => {
    if (holding) {
      reset({
        amount: holding.amount,
        purchase_price: holding.purchase_price,
        purchase_date: holding.purchase_date,
        notes: holding.notes || ''
      })
    }
  }, [holding, reset])

  const onSubmit = async (data: EditHoldingFormData) => {
    if (!holding) return

    setIsLoading(true)
    setError(null)

    try {
      await updateHolding(portfolioId, {
        id: holding.id,
        amount: data.amount,
        purchase_price: data.purchase_price,
        purchase_date: data.purchase_date,
        notes: data.notes
      })

      onOpenChange(false)
      onHoldingUpdated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update holding')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setError(null)
      onOpenChange(false)
    }
  }

  const totalValue = amount && purchasePrice ? amount * purchasePrice : 0

  if (!holding) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-glass-bg backdrop-blur-glass border-glass-border">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-foreground">
            <div className="p-2 bg-crypto-blue/20 rounded-lg">
              <Edit className="w-5 h-5 text-crypto-blue" />
            </div>
            <span>Edit Holding</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update your {holding.coin_name} holding details
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

          {/* Coin Info (Read-only) */}
          <div className="p-3 bg-muted/20 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{holding.coin_name}</p>
                <p className="text-sm text-muted-foreground">{holding.coin_symbol.toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Cannot be changed</p>
              </div>
            </div>
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
              className="bg-card border-border focus:border-crypto-blue/50 font-mono"
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-crypto-red">{errors.amount.message}</p>
            )}
          </div>

          {/* Purchase Price */}
          <div className="space-y-2">
            <Label htmlFor="purchase_price" className="text-foreground flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>Purchase Price (USD) *</span>
            </Label>
            <Input
              id="purchase_price"
              type="number"
              step="any"
              placeholder="0.00"
              className="bg-card border-border focus:border-crypto-blue/50 font-mono"
              {...register('purchase_price', { valueAsNumber: true })}
            />
            {errors.purchase_price && (
              <p className="text-sm text-crypto-red">{errors.purchase_price.message}</p>
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
              className="bg-card border-border focus:border-crypto-blue/50"
              {...register('purchase_date')}
            />
            {errors.purchase_date && (
              <p className="text-sm text-crypto-red">{errors.purchase_date.message}</p>
            )}
          </div>

          {/* Total Value Display */}
          {totalValue > 0 && (
            <div className="p-3 bg-crypto-blue/10 rounded-lg border border-crypto-blue/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Investment:</span>
                <span className="font-mono font-bold text-crypto-blue">
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
              placeholder="Add any notes about this holding..."
              className="bg-card border-border focus:border-crypto-blue/50 resize-none"
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
              disabled={isLoading}
              className="flex-1 bg-crypto-blue hover:bg-crypto-blue/90 text-primary-foreground"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Holding'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
