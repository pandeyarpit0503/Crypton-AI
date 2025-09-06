import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle, User, Mail, Calendar, Shield } from 'lucide-react'
import { SupabaseStatus } from '@/components/auth/SupabaseStatus'
import { SignupDebugger } from '@/components/auth/SignupDebugger'
import { ComprehensiveDiagnostic } from '@/components/auth/ComprehensiveDiagnostic'
import { DirectSignupTest } from '@/components/auth/DirectSignupTest'
import { LoginStatusChecker } from '@/components/auth/LoginStatusChecker'
import { EmailVerificationFix } from '@/components/auth/EmailVerificationFix'
import { GoogleOAuthSetup } from '@/components/auth/GoogleOAuthSetup'

export default function AuthDemo() {
  const { user, session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crypto-green mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading authentication state...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-10 space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Authentication Demo
          </h1>
          <p className="text-muted-foreground text-lg">
            This page demonstrates the Supabase authentication integration
          </p>
        </div>

        {/* Email Verification Fix */}
        <EmailVerificationFix />

        {/* Comprehensive Diagnostic */}
        <ComprehensiveDiagnostic />

        {/* Supabase Configuration Status */}
        <SupabaseStatus />

        {/* Signup Debugger */}
        <SignupDebugger />

        {/* Direct API Test */}
        <DirectSignupTest />

        {/* Login Status Checker */}
        <LoginStatusChecker />

        {/* Google OAuth Setup */}
        <GoogleOAuthSetup />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Authentication Status */}
          <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-crypto-green" />
                <span>Authentication Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge 
                  variant={user ? "default" : "secondary"}
                  className={user ? "bg-crypto-green/20 text-crypto-green" : ""}
                >
                  {user ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Authenticated
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Not Authenticated
                    </>
                  )}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Session:</span>
                <Badge variant={session ? "default" : "secondary"}>
                  {session ? 'Active' : 'None'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">User ID:</span>
                <span className="text-foreground font-mono text-sm">
                  {user?.id ? `${user.id.substring(0, 8)}...` : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* User Information */}
          <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-crypto-blue" />
                <span>User Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Email:</span>
                    </div>
                    <p className="text-foreground font-medium">{user.email}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Full Name:</span>
                    </div>
                    <p className="text-foreground font-medium">
                      {user.user_metadata?.full_name || 'Not provided'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Created:</span>
                    </div>
                    <p className="text-foreground font-medium">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Email Verified:</span>
                    </div>
                    <Badge 
                      variant={user.email_confirmed_at ? "default" : "secondary"}
                      className={user.email_confirmed_at ? "bg-crypto-green/20 text-crypto-green" : ""}
                    >
                      {user.email_confirmed_at ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No user information available</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please sign in to view user details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Session Information */}
          <Card className="bg-glass-bg backdrop-blur-glass border-glass-border lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-crypto-purple" />
                <span>Session Information</span>
              </CardTitle>
              <CardDescription>
                Technical details about the current authentication session
              </CardDescription>
            </CardHeader>
            <CardContent>
              {session ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-muted-foreground text-sm">Access Token:</span>
                    <p className="text-foreground font-mono text-xs bg-muted/20 p-2 rounded">
                      {session.access_token.substring(0, 50)}...
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-muted-foreground text-sm">Token Type:</span>
                    <p className="text-foreground font-medium">{session.token_type}</p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-muted-foreground text-sm">Expires At:</span>
                    <p className="text-foreground font-medium">
                      {session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-muted-foreground text-sm">Refresh Token:</span>
                    <p className="text-foreground font-mono text-xs bg-muted/20 p-2 rounded">
                      {session.refresh_token ? `${session.refresh_token.substring(0, 30)}...` : 'N/A'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No active session</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please sign in to view session details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Test the authentication system with these actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {!user ? (
                <>
                  <Button asChild className="bg-crypto-green hover:bg-crypto-green/90">
                    <a href="/signup">Create Account</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/login">Sign In</a>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild>
                    <a href="/profile">View Profile</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/market">Go to Market</a>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
