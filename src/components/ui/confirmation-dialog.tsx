import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react'

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'destructive' | 'default'
  onConfirm: () => void | Promise<void>
  loading?: boolean
  icon?: React.ReactNode
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'destructive',
  onConfirm,
  loading = false,
  icon
}: ConfirmationDialogProps) {
  const handleCancel = () => {
    if (!loading) {
      onOpenChange(false)
    }
  }

  const handleConfirm = async () => {
    if (loading) return // Prevent double execution
    await onConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md bg-glass-bg backdrop-blur-glass border-glass-border shadow-2xl">
        <DialogHeader className="space-y-4">
          <div className="flex items-center space-x-3">
            {icon || (
              <div className={`p-3 rounded-full animate-pulse ${
                variant === 'destructive'
                  ? 'bg-crypto-red/10 text-crypto-red border border-crypto-red/20'
                  : 'bg-crypto-blue/10 text-crypto-blue border border-crypto-blue/20'
              }`}>
                {variant === 'destructive' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <Trash2 className="w-6 h-6" />
                )}
              </div>
            )}
            <DialogTitle className="text-xl font-semibold text-foreground">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground leading-relaxed text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="border-border hover:bg-muted/50 transition-all duration-200"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={loading}
            className={`transition-all duration-200 ${
              variant === 'destructive'
                ? 'bg-crypto-red hover:bg-crypto-red/90 text-white shadow-lg hover:shadow-crypto-red/25'
                : 'bg-crypto-green hover:bg-crypto-green/90 shadow-lg hover:shadow-crypto-green/25'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {variant === 'destructive' && <Trash2 className="w-4 h-4 mr-2" />}
                {confirmText}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Hook for easier usage
export function useConfirmationDialog() {
  const [dialogState, setDialogState] = useState<{
    open: boolean
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: 'destructive' | 'default'
    onConfirm: () => void | Promise<void>
    loading?: boolean
    icon?: React.ReactNode
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {}
  })

  const [isProcessing, setIsProcessing] = useState(false)
  const [lastClickTime, setLastClickTime] = useState(0)

  const showConfirmation = (config: Omit<typeof dialogState, 'open'>) => {
    // Prevent showing new dialog if one is already processing
    if (isProcessing) return

    // Debounce rapid clicks (prevent multiple dialogs within 500ms)
    const now = Date.now()
    if (now - lastClickTime < 500) return
    setLastClickTime(now)

    setDialogState({ ...config, open: true })
  }

  const hideConfirmation = () => {
    // Only hide if not processing
    if (!isProcessing) {
      setDialogState(prev => ({ ...prev, open: false }))
    }
  }

  const handleConfirm = async () => {
    if (isProcessing) return // Prevent double execution

    setIsProcessing(true)
    try {
      await dialogState.onConfirm()
      // Close dialog after successful confirmation
      setDialogState(prev => ({ ...prev, open: false }))
    } catch (error) {
      console.error('Confirmation action failed:', error)
      // Keep dialog open on error so user can retry or cancel
    } finally {
      setIsProcessing(false)
    }
  }

  const ConfirmationDialogComponent = () => (
    <ConfirmationDialog
      {...dialogState}
      loading={isProcessing}
      onConfirm={handleConfirm}
      onOpenChange={(open) => {
        if (!open && !isProcessing) {
          hideConfirmation()
        }
      }}
    />
  )

  return {
    showConfirmation,
    hideConfirmation,
    ConfirmationDialog: ConfirmationDialogComponent,
    isProcessing
  }
}
