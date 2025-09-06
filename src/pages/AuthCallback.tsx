import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('=== HANDLING AUTH CALLBACK ===')
        console.log('Current URL:', window.location.href)
        console.log('URL Hash:', window.location.hash)
        console.log('URL Search:', window.location.search)

        // Handle OAuth callback from URL hash or search params
        const { data, error } = await supabase.auth.getSession()

        console.log('Initial session check:', { data, error })

        // If no session yet, try to get session from URL
        if (!data.session) {
          console.log('No session found, checking URL for auth tokens...')

          // Check if we have auth tokens in the URL
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const searchParams = new URLSearchParams(window.location.search)

          const accessToken = hashParams.get('access_token') || searchParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token')

          console.log('URL tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken })

          if (accessToken) {
            console.log('Found access token in URL, setting session...')
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            })

            console.log('Set session result:', { sessionData, sessionError })

            if (sessionError) {
              console.error('Session setting error:', sessionError)
              setStatus('error')
              setMessage(sessionError.message)
              return
            }

            if (sessionData.session) {
              console.log('Session set successfully:', sessionData.session.user)
              setStatus('success')
              setMessage('Successfully authenticated! Redirecting...')

              // Clean up URL and redirect
              window.history.replaceState({}, document.title, window.location.pathname)
              setTimeout(() => {
                navigate('/', { replace: true })
              }, 2000)
              return
            }
          }
        }

        if (error) {
          console.error('Auth callback error:', error)
          setStatus('error')
          setMessage(error.message)
          return
        }

        if (data.session) {
          console.log('Auth callback successful, user:', data.session.user)
          setStatus('success')
          setMessage('Successfully authenticated! Redirecting...')

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/', { replace: true })
          }, 2000)
        } else {
          console.log('No session found in callback')
          setStatus('error')
          setMessage('No authentication session found. Please try logging in again.')

          // Redirect to login after a delay
          setTimeout(() => {
            navigate('/login', { replace: true })
          }, 3000)
        }
      } catch (err) {
        console.error('Auth callback exception:', err)
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'Unknown error occurred')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-crypto flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-crypto-green/5 via-transparent to-crypto-blue/5" />
      
      <Card className="relative w-full max-w-md bg-glass-bg backdrop-blur-glass border-glass-border animate-scale-in">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-crypto-green/20 rounded-xl">
              {status === 'loading' && <Loader2 className="w-8 h-8 text-crypto-green animate-spin" />}
              {status === 'success' && <CheckCircle className="w-8 h-8 text-crypto-green" />}
              {status === 'error' && <AlertTriangle className="w-8 h-8 text-crypto-red" />}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {status === 'loading' && 'Authenticating...'}
            {status === 'success' && 'Welcome!'}
            {status === 'error' && 'Authentication Failed'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {status === 'loading' && 'Please wait while we complete your authentication'}
            {status === 'success' && 'You have been successfully authenticated'}
            {status === 'error' && 'There was an issue with your authentication'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {status === 'loading' && (
            <div className="text-center">
              <p className="text-muted-foreground">Processing your login...</p>
            </div>
          )}

          {status === 'success' && (
            <Alert className="border-crypto-green/50 bg-crypto-green/10">
              <CheckCircle className="w-4 h-4 text-crypto-green" />
              <AlertDescription className="text-crypto-green">
                <p className="font-medium">{message}</p>
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <Alert className="border-crypto-red/50 bg-crypto-red/10">
                <AlertTriangle className="w-4 h-4 text-crypto-red" />
                <AlertDescription className="text-crypto-red">
                  <p className="font-medium">Authentication Error</p>
                  <p className="text-sm">{message}</p>
                </AlertDescription>
              </Alert>
              
              <div className="text-center">
                <button
                  onClick={() => navigate('/login')}
                  className="text-crypto-green hover:text-crypto-green/80 font-medium transition-colors"
                >
                  Return to Login
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
