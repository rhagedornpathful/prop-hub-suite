import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export function SupabaseConnectionTest() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (test: string, status: 'success' | 'error' | 'warning', message: string, details?: any) => {
    setTestResults(prev => [...prev, { test, status, message, details, timestamp: new Date().toISOString() }]);
  };

  const runConnectionTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Test 1: Client Initialization
      addResult('Client Init', 'success', 'Supabase client exists', { client: !!supabase });

      // Test 2: Basic URL/Key Check
      const url = 'https://nhjsxtwuweegqcexakoz.supabase.co';
      const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oanN4dHd1d2VlZ3FjZXhha296Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTUwMjUsImV4cCI6MjA2NzY3MTAyNX0.GJ46q5JwybtA3HdYu9BWrobTTi62fevlz_LQ7NG4amk';
      addResult('Config', 'success', 'URL and key configured', { url, keyLength: key.length });

      // Test 3: Network Connectivity Test
      try {
        const response = await fetch(url + '/rest/v1/', {
          method: 'GET',
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
          }
        });
        addResult('Network', response.ok ? 'success' : 'error', 
          `HTTP ${response.status}: ${response.statusText}`, 
          { status: response.status, headers: Object.fromEntries(response.headers.entries()) });
      } catch (error: any) {
        addResult('Network', 'error', 'Network request failed', { error: error.message });
      }

      // Test 4: Simple Query Test (without authentication)
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('count')
          .limit(1);
        
        if (error) {
          addResult('Query Test', 'warning', 'Query failed (expected if not authenticated)', { error: error.message });
        } else {
          addResult('Query Test', 'success', 'Basic query successful', { data });
        }
      } catch (error: any) {
        addResult('Query Test', 'error', 'Query exception', { error: error.message });
      }

      // Test 5: Auth Status Check
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          addResult('Auth Check', 'warning', 'Auth error', { error: error.message });
        } else {
          addResult('Auth Check', session ? 'success' : 'warning', 
            session ? 'User session exists' : 'No active session', 
            { hasSession: !!session, userId: session?.user?.id });
        }
      } catch (error: any) {
        addResult('Auth Check', 'error', 'Auth exception', { error: error.message });
      }

      // Test 6: Auth Settings Check
      try {
        const response = await fetch(url + '/auth/v1/settings', {
          headers: {
            'apikey': key
          }
        });
        const settings = await response.json();
        addResult('Auth Settings', response.ok ? 'success' : 'warning', 
          `Auth service response: ${response.status}`, 
          { settings });
      } catch (error: any) {
        addResult('Auth Settings', 'error', 'Auth settings check failed', { error: error.message });
      }

      // Test 7: Simple Auth Test (try to sign in with test credentials)
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'test@example.com',
          password: 'invalid'
        });
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            addResult('Auth Test', 'success', 'Auth endpoint responding (invalid credentials expected)', { error: error.message });
          } else {
            addResult('Auth Test', 'warning', 'Auth error', { error: error.message });
          }
        } else {
          addResult('Auth Test', 'warning', 'Unexpected auth success', { data });
        }
      } catch (error: any) {
        addResult('Auth Test', 'error', 'Auth test exception', { error: error.message });
      }

    } catch (error: any) {
      addResult('General', 'error', 'Test suite exception', { error: error.message });
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Supabase Connection Diagnostics
          <Button 
            onClick={runConnectionTests} 
            disabled={isRunning}
            variant="outline"
            size="sm"
          >
            {isRunning ? 'Running Tests...' : 'Run Tests'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {testResults.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <Alert key={index} className="text-sm">
                <div className="flex items-start gap-2">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{result.test}</Badge>
                      <span className="font-medium">{result.message}</span>
                    </div>
                    {result.details && (
                      <details className="mt-1">
                        <summary className="cursor-pointer text-xs text-muted-foreground">
                          View Details
                        </summary>
                        <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}
        
        {testResults.length === 0 && !isRunning && (
          <Alert>
            <AlertDescription>
              Click "Run Tests" to diagnose Supabase connection issues
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}