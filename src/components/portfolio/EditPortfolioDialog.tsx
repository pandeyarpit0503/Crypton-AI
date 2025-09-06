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
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Edit, AlertTriangle } from 'lucide-react'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { Portfolio } from '@/types/portfolio'

const portfolioSchema = z.object({
  name: z.string().min(1, 'Portfolio name is required').max(50, 'Name must be less than 50 characters'),
  description: z.string().max(200, 'Description must be less than 200 characters').optional(),
  is_public: z.boolean()
})

type PortfolioFormData = z.infer<typeof portfolioSchema>

interface EditPortfolioDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  portfolio: Portfolio | null
}

export const EditPortfolioDialog = ({ open, onOpenChange, portfolio }: EditPortfolioDialogProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { updatePortfolio } = usePortfolio()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      name: '',
      description: '',
      is_public: false
    }
  })

  const isPublic = watch('is_public')

  // Reset form when portfolio changes
  useEffect(() => {
    if (portfolio) {
      reset({
        name: portfolio.name,
        description: portfolio.description || '',
        is_public: portfolio.is_public
      })
    }
  }, [portfolio, reset])

  const onSubmit = async (data: PortfolioFormData) => {
    if (!portfolio) return

    setIsLoading(true)
    setError(null)

    try {
      await updatePortfolio(portfolio.id, data)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update portfolio')
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

  if (!portfolio) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-glass-bg backdrop-blur-glass border-glass-border">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-foreground">
            <div className="p-2 bg-crypto-blue/20 rounded-lg">
              <Edit className="w-5 h-5 text-crypto-blue" />
            </div>
            <span>Edit Portfolio</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update your portfolio details and settings
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

          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              Portfolio Name *
            </Label>
            <Input
              id="name"
              placeholder="e.g., My Crypto Portfolio"
              className="bg-card border-border focus:border-crypto-blue/50"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-crypto-red">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your investment strategy or goals..."
              className="bg-card border-border focus:border-crypto-blue/50 resize-none"
              rows={3}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-crypto-red">{errors.description.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="is_public" className="text-foreground font-medium">
                Make Portfolio Public
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow others to view your portfolio (holdings amounts will be hidden)
              </p>
            </div>
            <Switch
              id="is_public"
              checked={isPublic}
              onCheckedChange={(checked) => setValue('is_public', checked)}
              className="data-[state=checked]:bg-crypto-blue"
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
                'Update Portfolio'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
