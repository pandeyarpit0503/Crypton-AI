import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, Eye, EyeOff, LogIn, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { isSupabaseConfigured } from '@/lib/supabase'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

type LoginFormData = z.infer<typeof loginSchema>

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        setError('Supabase is not configured. Please check the setup instructions in the Auth Demo page.')
        setIsLoading(false)
        return
      }

      console.log('Submitting login form with email:', data.email)

      const { error } = await signIn(data.email, data.password)

      console.log('Login result:', { error })

      if (error) {
        console.error('Login error:', error)
        setError(error.message)
      } else {
        console.log('Login successful!')
        // Add a small delay to ensure auth state is updated
        setTimeout(() => {
          console.log('Navigating to dashboard...')
          navigate('/')
        }, 100)
      }
    } catch (err) {
      console.error('Unexpected login error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError(null)

    try {
      console.log('Starting Google sign-in...')
      const { error } = await signInWithGoogle()

      if (error) {
        console.error('Google sign-in error:', error)
        setError(error.message)
      } else {
        console.log('Google sign-in initiated successfully')
        // The redirect will happen automatically
      }
    } catch (err) {
      console.error('Unexpected Google sign-in error:', err)
      setError('An unexpected error occurred with Google sign-in.')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-crypto flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-crypto-green/5 via-transparent to-crypto-blue/5" />
      <div className="absolute top-10 sm:top-20 left-4 sm:left-10 w-16 h-16 sm:w-32 sm:h-32 bg-crypto-green/10 rounded-full blur-xl animate-pulse-glow" />
      <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-10 w-12 h-12 sm:w-24 sm:h-24 bg-crypto-blue/10 rounded-full blur-xl animate-pulse-glow" />

      <Card className="relative w-full max-w-sm sm:max-w-md bg-glass-bg backdrop-blur-glass border-glass-border animate-scale-in">
        <CardHeader className="space-y-1 text-center px-4 sm:px-6">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-crypto-green/20 rounded-xl">
              <LogIn className="w-6 h-6 sm:w-8 sm:h-8 text-crypto-green" />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-muted-foreground">
            Sign in to your CryptoTrend AI account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6">
          {!isSupabaseConfigured() && (
            <Alert className="border-crypto-orange/50 bg-crypto-orange/10 mb-4">
              <AlertTriangle className="w-4 h-4 text-crypto-orange" />
              <AlertDescription className="text-crypto-orange">
                <div className="space-y-1">
                  <p className="font-medium">Supabase not configured!</p>
                  <p className="text-sm">
                    Authentication won't work until you set up your Supabase credentials.
                    Check the <Link to="/auth-demo" className="underline hover:no-underline">Auth Demo</Link> page for setup instructions.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

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

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 bg-card border-border focus:border-crypto-green/50"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-crypto-red">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Link 
                to="/forgot-password" 
                className="text-sm text-crypto-green hover:text-crypto-green/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full bg-crypto-green hover:bg-crypto-green/90 text-primary-foreground transition-all duration-300 hover:scale-105"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
              className="w-full border-border hover:bg-muted/50 transition-all duration-300 hover:scale-105"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting to Google...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-crypto-green hover:text-crypto-green/80 font-medium transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
