import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RefreshCw, User, Shield, Clock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { auth } from '@/lib/supabase'

export const LoginStatusChecker = () => {
  const { user, session, loading } = useAuth()
  const [manualCheck, setManualCheck] = useState<any>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkAuthStatus = async () => {
    setIsChecking(true)
    try {
      const { session: currentSession, error } = await auth.getSession()
      const { user: currentUser, error: userError } = await auth.getCurrentUser()
      
      setManualCheck({
        session: currentSession,
        user: currentUser,
        sessionError: error,
        userError: userError,
        timestamp: new Date().toLocaleTimeString()
      })
    } catch (err) {
      setManualCheck({
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString()
      })
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    // Auto-check on mount
    checkAuthStatus()
  }, [])

  return (
    <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-crypto-blue" />
          <span>Login Status Checker</span>
        </CardTitle>
        <CardDescription>
          Real-time authentication status monitoring
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Context State */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Auth Context State:</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Loading:</span>
                <Badge variant={loading ? "secondary" : "outline"}>
                  {loading ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">User:</span>
                <Badge variant={user ? "default" : "secondary"} 
                       className={user ? "bg-crypto-green/20 text-crypto-green" : ""}>
                  {user ? 'Logged In' : 'Not Logged In'}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Session:</span>
                <Badge variant={session ? "default" : "secondary"}
                       className={session ? "bg-crypto-green/20 text-crypto-green" : ""}>
                  {session ? 'Active' : 'None'}
                </Badge>
              </div>
            </div>
          </div>

          {user && (
            <div className="bg-muted/20 p-3 rounded-lg">
              <p className="text-sm font-medium text-foreground">User Details:</p>
              <div className="text-xs text-muted-foreground mt-1 space-y-1">
                <p>ID: {user.id}</p>
                <p>Email: {user.email}</p>
                <p>Verified: {user.email_confirmed_at ? 'Yes' : 'No'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Manual Check */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Manual Status Check:</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={checkAuthStatus}
              disabled={isChecking}
            >
              {isChecking ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh
            </Button>
          </div>

          {manualCheck && (
            <div className="bg-muted/20 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Last checked: {manualCheck.timestamp}
                </span>
              </div>
              
              {manualCheck.error ? (
                <Alert className="border-crypto-red/50 bg-crypto-red/10">
                  <AlertDescription className="text-crypto-red text-sm">
                    Error: {manualCheck.error}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Direct Session:</span>
                    <Badge variant={manualCheck.session ? "default" : "secondary"}
                           className={manualCheck.session ? "bg-crypto-green/20 text-crypto-green" : ""}>
                      {manualCheck.session ? 'Found' : 'None'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Direct User:</span>
                    <Badge variant={manualCheck.user ? "default" : "secondary"}
                           className={manualCheck.user ? "bg-crypto-green/20 text-crypto-green" : ""}>
                      {manualCheck.user ? 'Found' : 'None'}
                    </Badge>
                  </div>

                  {manualCheck.session && (
                    <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                      <p className="font-medium">Session Info:</p>
                      <p>User ID: {manualCheck.session.user?.id}</p>
                      <p>Email: {manualCheck.session.user?.email}</p>
                      <p>Expires: {new Date(manualCheck.session.expires_at * 1000).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Summary */}
        <Alert className={`border-${user ? 'crypto-green' : 'crypto-orange'}/50 bg-${user ? 'crypto-green' : 'crypto-orange'}/10`}>
          <User className={`w-4 h-4 text-${user ? 'crypto-green' : 'crypto-orange'}`} />
          <AlertDescription className={`text-${user ? 'crypto-green' : 'crypto-orange'}`}>
            <div className="space-y-1">
              <p className="font-medium">
                {user ? 'Authentication Status: LOGGED IN' : 'Authentication Status: NOT LOGGED IN'}
              </p>
              <p className="text-sm">
                {user 
                  ? 'You should have access to protected routes.' 
                  : 'You will be redirected to login for protected routes.'
                }
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Debugging Info */}
        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground">
            Show debugging information
          </summary>
          <div className="mt-2 p-2 bg-muted/30 rounded">
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify({
                contextUser: !!user,
                contextSession: !!session,
                contextLoading: loading,
                manualCheck: manualCheck ? {
                  hasSession: !!manualCheck.session,
                  hasUser: !!manualCheck.user,
                  sessionError: manualCheck.sessionError,
                  userError: manualCheck.userError
                } : null
              }, null, 2)}
            </pre>
          </div>
        </details>
      </CardContent>
    </Card>
  )
}
