import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackSimple() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Simple auth callback handler')
        console.log('URL:', window.location.href)
        
        // Wait a moment for Supabase to process the callback
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        console.log('Session after callback:', session)
        console.log('Error:', error)
        
        if (session) {
          console.log('User authenticated:', session.user.email)
          navigate('/', { replace: true })
        } else {
          console.log('No session found, redirecting to login')
          navigate('/login', { replace: true })
        }
      } catch (err) {
        console.error('Callback error:', err)
        navigate('/login', { replace: true })
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-crypto flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crypto-green mx-auto mb-4"></div>
        <p className="text-muted-foreground">Processing authentication...</p>
      </div>
    </div>
  )
}
