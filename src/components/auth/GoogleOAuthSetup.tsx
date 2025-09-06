import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Settings, CheckCircle, AlertTriangle, Copy } from 'lucide-react'

export const GoogleOAuthSetup = () => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const redirectUrl = `${window.location.origin}/auth/callback`

  return (
    <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Google OAuth Setup</span>
        </CardTitle>
        <CardDescription>
          Configure Google authentication for your application
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Alert className="border-crypto-blue/50 bg-crypto-blue/10">
          <AlertTriangle className="w-4 h-4 text-crypto-blue" />
          <AlertDescription className="text-crypto-blue">
            <div className="space-y-2">
              <p className="font-medium">Google OAuth Setup Required</p>
              <p className="text-sm">
                To enable Google authentication, you need to configure OAuth in both Google Cloud Console and Supabase.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Step 1: Google Cloud Console */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-foreground">Step 1: Google Cloud Console Setup</h4>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <Badge className="bg-crypto-blue text-white min-w-[24px] h-6 flex items-center justify-center">1</Badge>
              <div>
                <p className="font-medium">Create a Google Cloud Project</p>
                <p className="text-muted-foreground">Go to Google Cloud Console and create a new project or select an existing one.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Badge className="bg-crypto-blue text-white min-w-[24px] h-6 flex items-center justify-center">2</Badge>
              <div>
                <p className="font-medium">Enable Google+ API</p>
                <p className="text-muted-foreground">Navigate to APIs & Services → Library and enable the Google+ API.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Badge className="bg-crypto-blue text-white min-w-[24px] h-6 flex items-center justify-center">3</Badge>
              <div>
                <p className="font-medium">Create OAuth 2.0 Credentials</p>
                <p className="text-muted-foreground">Go to APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Badge className="bg-crypto-blue text-white min-w-[24px] h-6 flex items-center justify-center">4</Badge>
              <div>
                <p className="font-medium">Configure OAuth Consent Screen</p>
                <p className="text-muted-foreground">Set up the OAuth consent screen with your app information.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Badge className="bg-crypto-blue text-white min-w-[24px] h-6 flex items-center justify-center">5</Badge>
              <div>
                <p className="font-medium">Add Authorized Redirect URIs</p>
                <div className="space-y-2">
                  <p className="text-muted-foreground">Add these redirect URIs to your OAuth client:</p>
                  <div className="bg-muted/20 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <code className="text-xs font-mono">{redirectUrl}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(redirectUrl)}
                      >
                        <Copy className="w-3 h-3" />
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                  </div>
                  <div className="bg-muted/20 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <code className="text-xs font-mono">https://mznoxwugmbsfrprbfbda.supabase.co/auth/v1/callback</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard('https://mznoxwugmbsfrprbfbda.supabase.co/auth/v1/callback')}
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Supabase Configuration */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-foreground">Step 2: Supabase Configuration</h4>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <Badge className="bg-crypto-green text-white min-w-[24px] h-6 flex items-center justify-center">1</Badge>
              <div>
                <p className="font-medium">Go to Supabase Dashboard</p>
                <p className="text-muted-foreground">Navigate to Authentication → Providers in your Supabase project.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Badge className="bg-crypto-green text-white min-w-[24px] h-6 flex items-center justify-center">2</Badge>
              <div>
                <p className="font-medium">Enable Google Provider</p>
                <p className="text-muted-foreground">Turn on the Google provider toggle.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Badge className="bg-crypto-green text-white min-w-[24px] h-6 flex items-center justify-center">3</Badge>
              <div>
                <p className="font-medium">Add Google OAuth Credentials</p>
                <p className="text-muted-foreground">Enter your Google OAuth Client ID and Client Secret from step 1.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Badge className="bg-crypto-green text-white min-w-[24px] h-6 flex items-center justify-center">4</Badge>
              <div>
                <p className="font-medium">Save Configuration</p>
                <p className="text-muted-foreground">Click Save to apply the Google OAuth settings.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            asChild
            className="flex items-center justify-center"
          >
            <a 
              href="https://console.cloud.google.com/" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Google Cloud Console
            </a>
          </Button>
          
          <Button
            variant="outline"
            asChild
            className="flex items-center justify-center"
          >
            <a 
              href="https://supabase.com/dashboard/project/mznoxwugmbsfrprbfbda/auth/providers" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Settings className="w-4 h-4 mr-2" />
              Supabase Auth Providers
            </a>
          </Button>
        </div>

        {/* Status Check */}
        <Alert className="border-crypto-orange/50 bg-crypto-orange/10">
          <AlertTriangle className="w-4 h-4 text-crypto-orange" />
          <AlertDescription className="text-crypto-orange">
            <div className="space-y-2">
              <p className="font-medium">Test Google Authentication</p>
              <p className="text-sm">
                After completing the setup, test the Google login button on the login/signup pages. 
                If it doesn't work, check the browser console for error messages.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Success State */}
        <Alert className="border-crypto-green/50 bg-crypto-green/10">
          <CheckCircle className="w-4 h-4 text-crypto-green" />
          <AlertDescription className="text-crypto-green">
            <div className="space-y-1">
              <p className="font-medium">When setup is complete:</p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>Users can sign in/up with their Google account</li>
                <li>No password required for Google users</li>
                <li>Automatic profile information from Google</li>
                <li>Seamless authentication experience</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
