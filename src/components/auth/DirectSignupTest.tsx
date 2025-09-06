import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Zap, CheckCircle, AlertTriangle } from 'lucide-react'

export const DirectSignupTest = () => {
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('TestPassword123')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const directSignup = async () => {
    setIsLoading(true)
    setResult(null)

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/^["']|["']$/g, '')
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.replace(/^["']|["']$/g, '')

    try {
      console.log('=== DIRECT SIGNUP TEST ===')
      console.log('URL:', supabaseUrl)
      console.log('Key length:', supabaseKey?.length)

      const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          email,
          password,
          data: {
            full_name: 'Test User'
          }
        })
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      const responseText = await response.text()
      console.log('Response text:', responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch {
        data = { raw: responseText }
      }

      if (response.ok) {
        setResult({
          success: true,
          message: 'Direct signup successful!',
          data,
          status: response.status
        })
      } else {
        setResult({
          success: false,
          message: `Direct signup failed: ${response.status} ${response.statusText}`,
          data,
          status: response.status
        })
      }

    } catch (error) {
      console.error('Direct signup error:', error)
      setResult({
        success: false,
        message: 'Network error during direct signup',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-crypto-yellow" />
          <span>Direct API Signup Test</span>
        </CardTitle>
        <CardDescription>
          Bypass the Supabase client and test signup directly via REST API
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="direct-email">Email</Label>
            <Input
              id="direct-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-card border-border"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="direct-password">Password</Label>
            <Input
              id="direct-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-card border-border"
            />
          </div>
        </div>

        <Button
          onClick={directSignup}
          disabled={isLoading}
          className="w-full bg-crypto-yellow hover:bg-crypto-yellow/90 text-black"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing Direct Signup...
            </>
          ) : (
            'Test Direct API Signup'
          )}
        </Button>

        {result && (
          <Alert className={`border-${result.success ? 'crypto-green' : 'crypto-red'}/50 bg-${result.success ? 'crypto-green' : 'crypto-red'}/10`}>
            {result.success ? (
              <CheckCircle className="w-4 h-4 text-crypto-green" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-crypto-red" />
            )}
            <AlertDescription className={`text-${result.success ? 'crypto-green' : 'crypto-red'}`}>
              <div className="space-y-2">
                <p className="font-medium">{result.message}</p>
                {result.status && (
                  <p className="text-sm">HTTP Status: {result.status}</p>
                )}
                {result.data && (
                  <details className="text-sm">
                    <summary className="cursor-pointer">Show response data</summary>
                    <pre className="mt-2 p-2 bg-muted/30 rounded text-xs overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
                {result.error && (
                  <p className="text-sm">Error: {result.error}</p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Alert className="border-crypto-blue/50 bg-crypto-blue/10">
          <AlertDescription className="text-crypto-blue">
            <div className="space-y-1">
              <p className="font-medium">What this test does:</p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>Makes a direct HTTP request to Supabase auth API</li>
                <li>Bypasses the Supabase JavaScript client</li>
                <li>Shows raw HTTP response and status codes</li>
                <li>Helps identify if the issue is with the client or the API</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
