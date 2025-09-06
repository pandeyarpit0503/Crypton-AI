import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  Mail, 
  Calendar, 
  LogOut, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Settings
} from 'lucide-react'

export const UserProfile = () => {
  const { user, signOut } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  if (!user) {
    return (
      <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No user information available</p>
        </CardContent>
      </Card>
    )
  }

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16 bg-crypto-green/20 border-2 border-crypto-green/30">
              <AvatarFallback className="text-crypto-green font-bold text-lg">
                {getInitials(user.email || '')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl text-foreground">
                {user.user_metadata?.full_name || 'User'}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {user.email}
              </CardDescription>
              <div className="flex items-center space-x-2 mt-2">
                <Badge 
                  variant={user.email_confirmed_at ? "default" : "secondary"}
                  className={user.email_confirmed_at ? "bg-crypto-green/20 text-crypto-green" : ""}
                >
                  {user.email_confirmed_at ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Unverified
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Account Information */}
      <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5 text-crypto-green" />
            <span>Account Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
              </div>
              <p className="text-foreground font-medium">{user.email}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Member since:</span>
              </div>
              <p className="text-foreground font-medium">
                {formatDate(user.created_at)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">User ID:</span>
              </div>
              <p className="text-foreground font-medium font-mono text-xs">
                {user.id}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last sign in:</span>
              </div>
              <p className="text-foreground font-medium">
                {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Never'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Verification Alert */}
      {!user.email_confirmed_at && (
        <Alert className="border-crypto-orange/50 bg-crypto-orange/10">
          <AlertCircle className="w-4 h-4 text-crypto-orange" />
          <AlertDescription className="text-crypto-orange">
            Please check your email and click the verification link to verify your account.
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleSignOut}
            disabled={isSigningOut}
            variant="destructive"
            className="w-full bg-crypto-red hover:bg-crypto-red/90"
          >
            {isSigningOut ? (
              <>
                <LogOut className="w-4 h-4 mr-2 animate-spin" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
