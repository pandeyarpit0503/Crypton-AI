import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertTriangle, CheckCircle, XCircle, Database } from 'lucide-react'

interface DiagnosticResult {
  test: string
  status: 'success' | 'error' | 'warning' | 'pending'
  message: string
  details?: any
}

export const ComprehensiveDiagnostic = () => {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<DiagnosticResult[]>([])

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result])
  }

  const runDiagnostics = async () => {
    setIsRunning(true)
    setResults([])

    // Test 1: Environment Variables
    addResult({ test: 'Environment Variables', status: 'pending', message: 'Checking...' })
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/^["']|["']$/g, '')
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.replace(/^["']|["']$/g, '')
    
    if (!supabaseUrl || !supabaseKey) {
      addResult({
        test: 'Environment Variables',
        status: 'error',
        message: 'Missing environment variables',
        details: { url: !!supabaseUrl, key: !!supabaseKey }
      })
    } else {
      addResult({
        test: 'Environment Variables',
        status: 'success',
        message: 'Environment variables found',
        details: { 
          url: supabaseUrl.substring(0, 30) + '...', 
          keyLength: supabaseKey.length 
        }
      })
    }

    // Test 2: URL Format Validation
    addResult({ test: 'URL Format', status: 'pending', message: 'Validating...' })
    
    if (supabaseUrl && supabaseUrl.includes('supabase.co') && supabaseUrl.startsWith('https://')) {
      addResult({
        test: 'URL Format',
        status: 'success',
        message: 'URL format is correct',
        details: { url: supabaseUrl }
      })
    } else {
      addResult({
        test: 'URL Format',
        status: 'error',
        message: 'Invalid URL format',
        details: { url: supabaseUrl, expected: 'https://[project-id].supabase.co' }
      })
    }

    // Test 3: Basic Network Connectivity
    addResult({ test: 'Network Connectivity', status: 'pending', message: 'Testing...' })
    
    try {
      const response = await fetch(supabaseUrl + '/rest/v1/', {
        method: 'HEAD',
        mode: 'cors'
      })
      
      addResult({
        test: 'Network Connectivity',
        status: 'success',
        message: `Connected successfully (${response.status})`,
        details: { status: response.status, statusText: response.statusText }
      })
    } catch (error) {
      addResult({
        test: 'Network Connectivity',
        status: 'error',
        message: 'Network connection failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
    }

    // Test 4: CORS Check
    addResult({ test: 'CORS Check', status: 'pending', message: 'Testing...' })
    
    try {
      const response = await fetch(supabaseUrl + '/rest/v1/', {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok || response.status === 401 || response.status === 403) {
        addResult({
          test: 'CORS Check',
          status: 'success',
          message: 'CORS is working correctly',
          details: { status: response.status }
        })
      } else {
        addResult({
          test: 'CORS Check',
          status: 'warning',
          message: `Unexpected response: ${response.status}`,
          details: { status: response.status, statusText: response.statusText }
        })
      }
    } catch (error) {
      addResult({
        test: 'CORS Check',
        status: 'error',
        message: 'CORS error detected',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
    }

    // Test 5: Auth Endpoint Check
    addResult({ test: 'Auth Endpoint', status: 'pending', message: 'Testing...' })
    
    try {
      const response = await fetch(supabaseUrl + '/auth/v1/settings', {
        method: 'GET',
        headers: {
          'apikey': supabaseKey
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        addResult({
          test: 'Auth Endpoint',
          status: 'success',
          message: 'Auth endpoint is accessible',
          details: { 
            external_email_enabled: data.external?.email,
            external_phone_enabled: data.external?.phone,
            disable_signup: data.disable_signup
          }
        })
      } else {
        addResult({
          test: 'Auth Endpoint',
          status: 'error',
          message: `Auth endpoint error: ${response.status}`,
          details: { status: response.status, statusText: response.statusText }
        })
      }
    } catch (error) {
      addResult({
        test: 'Auth Endpoint',
        status: 'error',
        message: 'Auth endpoint unreachable',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
    }

    // Test 6: Supabase Client Test
    addResult({ test: 'Supabase Client', status: 'pending', message: 'Testing...' })
    
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const testClient = createClient(supabaseUrl, supabaseKey)
      
      const { data, error } = await testClient.auth.getSession()
      
      if (error) {
        addResult({
          test: 'Supabase Client',
          status: 'warning',
          message: 'Client created but auth error',
          details: { error: error.message }
        })
      } else {
        addResult({
          test: 'Supabase Client',
          status: 'success',
          message: 'Supabase client working correctly',
          details: { session: !!data.session }
        })
      }
    } catch (error) {
      addResult({
        test: 'Supabase Client',
        status: 'error',
        message: 'Supabase client error',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-crypto-green" />
      case 'error': return <XCircle className="w-4 h-4 text-crypto-red" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-crypto-orange" />
      case 'pending': return <Loader2 className="w-4 h-4 animate-spin text-crypto-blue" />
    }
  }

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return 'text-crypto-green'
      case 'error': return 'text-crypto-red'
      case 'warning': return 'text-crypto-orange'
      case 'pending': return 'text-crypto-blue'
    }
  }

  return (
    <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-crypto-purple" />
          <span>Comprehensive Supabase Diagnostic</span>
        </CardTitle>
        <CardDescription>
          Run a complete diagnostic to identify authentication issues
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="w-full bg-crypto-purple hover:bg-crypto-purple/90"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            'Run Complete Diagnostic'
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Diagnostic Results:</h4>
            
            {results.map((result, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{result.test}</p>
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(result.status)} border-current`}
                    >
                      {result.status}
                    </Badge>
                  </div>
                  <p className={`text-sm ${getStatusColor(result.status)}`}>
                    {result.message}
                  </p>
                  {result.details && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer">
                        Show details
                      </summary>
                      <pre className="text-xs bg-muted/30 p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && !isRunning && (
          <Alert className="border-crypto-blue/50 bg-crypto-blue/10">
            <AlertTriangle className="w-4 h-4 text-crypto-blue" />
            <AlertDescription className="text-crypto-blue">
              <div className="space-y-2">
                <p className="font-medium">Diagnostic Complete</p>
                <p className="text-sm">
                  Review the results above. Any errors or warnings indicate potential issues 
                  that need to be resolved for authentication to work properly.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
