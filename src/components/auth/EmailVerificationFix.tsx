import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Mail, Settings, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react'

export const EmailVerificationFix = () => {
  const [authSettings, setAuthSettings] = useState<any>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkAuthSettings = async () => {
    setIsChecking(true)
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/^["']|["']$/g, '')
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.replace(/^["']|["']$/g, '')

      const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      })

      if (response.ok) {
        const settings = await response.json()
        setAuthSettings(settings)
      } else {
        setAuthSettings({ error: `Failed to fetch settings: ${response.status}` })
      }
    } catch (error) {
      setAuthSettings({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setIsChecking(false)
    }
  }

  const getEmailConfirmationStatus = () => {
    if (!authSettings || authSettings.error) return null
    
    // Check if email confirmation is disabled
    const emailConfirmationDisabled = authSettings.disable_signup === false && 
                                     !authSettings.external?.email?.enabled
    
    return {
      disabled: emailConfirmationDisabled,
      signupEnabled: !authSettings.disable_signup,
      emailEnabled: authSettings.external?.email?.enabled
    }
  }

  const status = getEmailConfirmationStatus()

  return (
    <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="w-5 h-5 text-crypto-orange" />
          <span>Email Verification Settings</span>
        </CardTitle>
        <CardDescription>
          Check and fix email verification settings that prevent immediate login
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert className="border-crypto-red/50 bg-crypto-red/10">
          <AlertTriangle className="w-4 h-4 text-crypto-red" />
          <AlertDescription className="text-crypto-red">
            <div className="space-y-2">
              <p className="font-medium">Issue Identified: Email Verification Enabled</p>
              <p className="text-sm">
                Your signup creates users but no session because email verification is required. 
                Users must verify their email before they can log in.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        <Button
          onClick={checkAuthSettings}
          disabled={isChecking}
          className="w-full bg-crypto-orange hover:bg-crypto-orange/90"
        >
          {isChecking ? 'Checking Settings...' : 'Check Current Auth Settings'}
        </Button>

        {authSettings && (
          <div className="space-y-3">
            {authSettings.error ? (
              <Alert className="border-crypto-red/50 bg-crypto-red/10">
                <AlertTriangle className="w-4 h-4 text-crypto-red" />
                <AlertDescription className="text-crypto-red">
                  Error: {authSettings.error}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Current Settings:</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Signup Enabled:</span>
                    <Badge variant={!authSettings.disable_signup ? "default" : "secondary"}
                           className={!authSettings.disable_signup ? "bg-crypto-green/20 text-crypto-green" : ""}>
                      {!authSettings.disable_signup ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Email Confirmation:</span>
                    <Badge variant={status?.disabled ? "default" : "secondary"}
                           className={status?.disabled ? "bg-crypto-green/20 text-crypto-green" : "bg-crypto-red/20 text-crypto-red"}>
                      {status?.disabled ? 'Disabled' : 'Enabled'}
                    </Badge>
                  </div>
                </div>

                {status?.disabled ? (
                  <Alert className="border-crypto-green/50 bg-crypto-green/10">
                    <CheckCircle className="w-4 h-4 text-crypto-green" />
                    <AlertDescription className="text-crypto-green">
                      <p className="font-medium">Good! Email verification is disabled.</p>
                      <p className="text-sm">Users should be able to log in immediately after signup.</p>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-crypto-orange/50 bg-crypto-orange/10">
                    <AlertTriangle className="w-4 h-4 text-crypto-orange" />
                    <AlertDescription className="text-crypto-orange">
                      <p className="font-medium">Email verification is still enabled.</p>
                      <p className="text-sm">Follow the manual steps below to disable it.</p>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <h4 className="text-sm font-medium">How to Fix This:</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-start space-x-2">
              <span className="bg-crypto-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
              <p>Go to your Supabase Dashboard</p>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="bg-crypto-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
              <p>Navigate to <strong>Authentication → Settings</strong></p>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="bg-crypto-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
              <p>Find <strong>"Confirm email"</strong> setting</p>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="bg-crypto-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
              <p><strong>Turn OFF</strong> "Enable email confirmations"</p>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="bg-crypto-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">5</span>
              <p><strong>Save</strong> the changes</p>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            asChild
            className="flex-1"
          >
            <a 
              href="https://supabase.com/dashboard/project/_/auth/settings" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Supabase Dashboard
            </a>
          </Button>
          
          <Button
            variant="outline"
            asChild
            className="flex-1"
          >
            <a 
              href="https://supabase.com/docs/guides/auth/auth-email" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center"
            >
              <Settings className="w-4 h-4 mr-2" />
              Auth Documentation
            </a>
          </Button>
        </div>

        <Alert className="border-crypto-blue/50 bg-crypto-blue/10">
          <AlertDescription className="text-crypto-blue">
            <div className="space-y-1">
              <p className="font-medium">After disabling email verification:</p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>New signups will create both user AND session</li>
                <li>Users will be automatically logged in after signup</li>
                <li>No email verification required</li>
                <li>Existing unverified users can now log in</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
