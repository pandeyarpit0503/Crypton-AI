import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Bug, CheckCircle, AlertTriangle } from 'lucide-react'
import { auth } from '@/lib/supabase'

export const SignupDebugger = () => {
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('TestPassword123')
  const [fullName, setFullName] = useState('Test User')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testSignup = async () => {
    setIsLoading(true)
    setResult(null)
    setLogs([])

    addLog('Starting signup test...')

    try {
      addLog(`Testing with email: ${email}`)
      addLog(`Password length: ${password.length}`)
      addLog(`Full name: ${fullName}`)

      // First test network connectivity
      addLog('Testing network connectivity...')
      const networkTest = await auth.testNetworkConnectivity()
      addLog(`Network test result: ${JSON.stringify(networkTest, null, 2)}`)

      if (!networkTest.success) {
        addLog('Network connectivity failed - this is likely the issue!')
        setResult({
          data: null,
          error: { message: `Network connectivity failed: ${networkTest.error}` },
          success: false
        })
        return
      }

      addLog('Network connectivity OK, proceeding with signup...')

      const { data, error } = await auth.signUp(email, password, { full_name: fullName })

      addLog('Signup completed')
      addLog(`Data received: ${JSON.stringify(data, null, 2)}`)
      addLog(`Error received: ${JSON.stringify(error, null, 2)}`)

      setResult({ data, error, success: !error })

    } catch (err) {
      addLog(`Exception caught: ${err}`)
      setResult({ data: null, error: err, success: false })
    } finally {
      setIsLoading(false)
    }
  }

  const clearLogs = () => {
    setLogs([])
    setResult(null)
  }

  return (
    <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bug className="w-5 h-5 text-crypto-orange" />
          <span>Signup Debugger</span>
        </CardTitle>
        <CardDescription>
          Test the signup functionality directly and see detailed logs
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Test Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="test-email">Email</Label>
            <Input
              id="test-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-card border-border"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="test-password">Password</Label>
            <Input
              id="test-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-card border-border"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="test-name">Full Name</Label>
            <Input
              id="test-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-card border-border"
            />
          </div>
        </div>

        {/* Test Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={testSignup}
            disabled={isLoading}
            className="bg-crypto-green hover:bg-crypto-green/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Signup'
            )}
          </Button>
          
          <Button variant="outline" onClick={clearLogs}>
            Clear Logs
          </Button>
        </div>

        {/* Result */}
        {result && (
          <Alert className={`border-${result.success ? 'crypto-green' : 'crypto-red'}/50 bg-${result.success ? 'crypto-green' : 'crypto-red'}/10`}>
            {result.success ? (
              <CheckCircle className="w-4 h-4 text-crypto-green" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-crypto-red" />
            )}
            <AlertDescription className={`text-${result.success ? 'crypto-green' : 'crypto-red'}`}>
              <div className="space-y-2">
                <p className="font-medium">
                  {result.success ? 'Signup Successful!' : 'Signup Failed'}
                </p>
                {result.error && (
                  <p className="text-sm">
                    Error: {result.error.message || JSON.stringify(result.error)}
                  </p>
                )}
                {result.data?.user && (
                  <p className="text-sm">
                    User created with ID: {result.data.user.id}
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Debug Logs:</h4>
              <Badge variant="outline">{logs.length} entries</Badge>
            </div>
            <div className="bg-muted/20 p-3 rounded-lg max-h-64 overflow-y-auto">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {logs.join('\n')}
              </pre>
            </div>
          </div>
        )}

        {/* Instructions */}
        <Alert className="border-crypto-blue/50 bg-crypto-blue/10">
          <AlertDescription className="text-crypto-blue">
            <div className="space-y-1">
              <p className="font-medium">How to use this debugger:</p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>Fill in test credentials above</li>
                <li>Click "Test Signup" to attempt user creation</li>
                <li>Check the logs for detailed information</li>
                <li>Look for any error messages or API responses</li>
                <li>Open browser console for additional debugging info</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
