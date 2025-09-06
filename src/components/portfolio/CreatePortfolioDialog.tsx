import { useState } from 'react'
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
import { Loader2, Briefcase, AlertTriangle } from 'lucide-react'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { CreatePortfolioData } from '@/types/portfolio'

const portfolioSchema = z.object({
  name: z.string().min(1, 'Portfolio name is required').max(50, 'Name must be less than 50 characters'),
  description: z.string().max(200, 'Description must be less than 200 characters').optional(),
  is_public: z.boolean()
})

type PortfolioFormData = z.infer<typeof portfolioSchema>

interface CreatePortfolioDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const CreatePortfolioDialog = ({ open, onOpenChange }: CreatePortfolioDialogProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { createPortfolio } = usePortfolio()

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

  const onSubmit = async (data: PortfolioFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      await createPortfolio(data)
      reset()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create portfolio')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      reset()
      setError(null)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-glass-bg backdrop-blur-glass border-glass-border">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-foreground">
            <div className="p-2 bg-crypto-green/20 rounded-lg">
              <Briefcase className="w-5 h-5 text-crypto-green" />
            </div>
            <span>Create New Portfolio</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a new portfolio to track your cryptocurrency investments
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
              className="bg-card border-border focus:border-crypto-green/50"
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
              className="bg-card border-border focus:border-crypto-green/50 resize-none"
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
              className="data-[state=checked]:bg-crypto-green"
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
              className="flex-1 bg-crypto-green hover:bg-crypto-green/90 text-primary-foreground"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Portfolio'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
