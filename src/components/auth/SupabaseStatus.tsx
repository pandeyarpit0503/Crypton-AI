import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertTriangle, ExternalLink, Copy, Eye, EyeOff, Wifi, WifiOff } from 'lucide-react'
import { isSupabaseConfigured, auth } from '@/lib/supabase'

export const SupabaseStatus = () => {
  const [isConfigured, setIsConfigured] = useState(false)
  const [showCredentials, setShowCredentials] = useState(false)
  const [copied, setCopied] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed' | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured())
  }, [])

  const testConnection = async () => {
    setConnectionStatus('testing')
    setConnectionError(null)

    try {
      const result = await auth.testConnection()
      if (result.success) {
        setConnectionStatus('connected')
      } else {
        setConnectionStatus('failed')
        setConnectionError(result.error?.message || 'Connection failed')
      }
    } catch (err) {
      setConnectionStatus('failed')
      setConnectionError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const envTemplate = `# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here`

  return (
    <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {isConfigured ? (
            <CheckCircle className="w-5 h-5 text-crypto-green" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-crypto-orange" />
          )}
          <span>Supabase Configuration Status</span>
        </CardTitle>
        <CardDescription>
          Check if your Supabase authentication is properly configured
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Configuration Status:</span>
          <Badge 
            variant={isConfigured ? "default" : "secondary"}
            className={isConfigured ? "bg-crypto-green/20 text-crypto-green" : "bg-crypto-orange/20 text-crypto-orange"}
          >
            {isConfigured ? 'Configured' : 'Not Configured'}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Supabase URL:</span>
          <span className="text-foreground font-mono text-sm">
            {supabaseUrl ? (supabaseUrl.includes('placeholder') ? 'Not Set' : 'Set') : 'Not Set'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Anon Key:</span>
          <span className="text-foreground font-mono text-sm">
            {supabaseKey ? (supabaseKey.includes('placeholder') ? 'Not Set' : 'Set') : 'Not Set'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Connection:</span>
          <div className="flex items-center space-x-2">
            {connectionStatus === 'testing' && (
              <Badge variant="secondary" className="bg-crypto-blue/20 text-crypto-blue">
                <Wifi className="w-3 h-3 mr-1 animate-pulse" />
                Testing...
              </Badge>
            )}
            {connectionStatus === 'connected' && (
              <Badge variant="default" className="bg-crypto-green/20 text-crypto-green">
                <Wifi className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            )}
            {connectionStatus === 'failed' && (
              <Badge variant="secondary" className="bg-crypto-red/20 text-crypto-red">
                <WifiOff className="w-3 h-3 mr-1" />
                Failed
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={testConnection}
              disabled={!isConfigured || connectionStatus === 'testing'}
            >
              Test Connection
            </Button>
          </div>
        </div>

        {connectionError && (
          <Alert className="border-crypto-red/50 bg-crypto-red/10">
            <AlertTriangle className="w-4 h-4 text-crypto-red" />
            <AlertDescription className="text-crypto-red">
              <p className="font-medium">Connection Error:</p>
              <p className="text-sm">{connectionError}</p>
            </AlertDescription>
          </Alert>
        )}

        {!isConfigured && (
          <Alert className="border-crypto-orange/50 bg-crypto-orange/10">
            <AlertTriangle className="w-4 h-4 text-crypto-orange" />
            <AlertDescription className="text-crypto-orange">
              <div className="space-y-2">
                <p className="font-medium">Supabase is not configured!</p>
                <p className="text-sm">
                  To enable authentication, you need to set up your Supabase project credentials.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {isConfigured && (
          <Alert className="border-crypto-green/50 bg-crypto-green/10">
            <CheckCircle className="w-4 h-4 text-crypto-green" />
            <AlertDescription className="text-crypto-green">
              <p className="font-medium">Supabase is properly configured!</p>
              <p className="text-sm">Authentication should work correctly.</p>
            </AlertDescription>
          </Alert>
        )}

        {/* Current Configuration */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Configuration:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCredentials(!showCredentials)}
            >
              {showCredentials ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showCredentials ? 'Hide' : 'Show'}
            </Button>
          </div>
          
          {showCredentials && (
            <div className="bg-muted/20 p-3 rounded-lg space-y-2">
              <div>
                <span className="text-xs text-muted-foreground">VITE_SUPABASE_URL:</span>
                <p className="font-mono text-xs break-all">{supabaseUrl || 'Not set'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">VITE_SUPABASE_ANON_KEY:</span>
                <p className="font-mono text-xs break-all">
                  {supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'Not set'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Setup Instructions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Setup Instructions:</h4>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>1. Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-crypto-green hover:underline">supabase.com</a></p>
            <p>2. Go to Settings → API in your project dashboard</p>
            <p>3. Copy your Project URL and anon/public key</p>
            <p>4. Add them to your .env.local file:</p>
          </div>

          <div className="relative">
            <pre className="bg-muted/20 p-3 rounded-lg text-xs overflow-x-auto">
              <code>{envTemplate}</code>
            </pre>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(envTemplate)}
            >
              <Copy className="w-3 h-3" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            5. Restart your development server after adding the environment variables
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Create Supabase Project
            </a>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a href="https://supabase.com/docs/guides/auth" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Auth Documentation
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
