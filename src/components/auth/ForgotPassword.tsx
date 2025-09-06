import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, ArrowLeft, CheckCircle, KeyRound } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { resetPassword } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await resetPassword(data.email)
      
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-crypto flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-crypto-green/5 via-transparent to-crypto-blue/5" />
        <Card className="relative w-full max-w-md bg-glass-bg backdrop-blur-glass border-glass-border animate-scale-in">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-crypto-green/20 rounded-xl">
                <CheckCircle className="w-8 h-8 text-crypto-green" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h2>
            <p className="text-muted-foreground mb-6">
              We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
            </p>
            <Link to="/login">
              <Button className="w-full bg-crypto-green hover:bg-crypto-green/90 text-primary-foreground">
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-crypto flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-crypto-green/5 via-transparent to-crypto-blue/5" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-crypto-green/10 rounded-full blur-xl animate-pulse-glow" />
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-crypto-blue/10 rounded-full blur-xl animate-pulse-glow" />
      
      <Card className="relative w-full max-w-md bg-glass-bg backdrop-blur-glass border-glass-border animate-scale-in">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-crypto-green/20 rounded-xl">
              <KeyRound className="w-8 h-8 text-crypto-green" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Reset Password
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert className="border-crypto-red/50 bg-crypto-red/10">
                <AlertDescription className="text-crypto-red">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10 bg-card border-border focus:border-crypto-green/50"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-crypto-red">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-crypto-green hover:bg-crypto-green/90 text-primary-foreground transition-all duration-300 hover:scale-105"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending reset link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>

            <div className="text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center text-sm text-crypto-green hover:text-crypto-green/80 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
