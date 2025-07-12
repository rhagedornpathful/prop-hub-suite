import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";

export function DirectSupabaseTest() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (test: string, status: 'success' | 'error' | 'warning', message: string, details?: any) => {
    setTestResults(prev => [...prev, { 
      test, 
      status, 
      message, 
      details, 
      timestamp: new Date().toISOString() 
    }]);
  };

  const runDirectTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const SUPABASE_URL = "https://nhjsxtwuweegqcexakoz.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oanN4dHd1d2VlZ3FjZXhha296Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTUwMjUsImV4cCI6MjA2NzY3MTAyNX0.GJ46q5JwybtA3HdYu9BWrobTTi62fevlz_LQ7NG4amk";

    try {
      // Test 1: Basic connectivity to Supabase domain
      addResult("DNS/Domain", "warning", "Testing domain resolution...");
      try {
        const domainTest = await fetch(SUPABASE_URL, { 
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache'
        });
        addResult("DNS/Domain", "success", "Domain is reachable", { 
          url: SUPABASE_URL,
          type: domainTest.type 
        });
      } catch (domainError: any) {
        addResult("DNS/Domain", "error", `Domain unreachable: ${domainError.message}`, domainError);
      }

      // Test 2: Auth endpoint direct test
      addResult("Auth Endpoint", "warning", "Testing auth endpoint...");
      try {
        const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_KEY,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        const authData = await authResponse.json();
        if (authResponse.ok) {
          addResult("Auth Endpoint", "success", `Auth service responding (${authResponse.status})`, {
            status: authResponse.status,
            data: authData
          });
        } else {
          addResult("Auth Endpoint", "error", `Auth service error (${authResponse.status})`, {
            status: authResponse.status,
            data: authData
          });
        }
      } catch (authError: any) {
        addResult("Auth Endpoint", "error", `Auth endpoint failed: ${authError.message}`, authError);
      }

      // Test 3: REST API endpoint test
      addResult("REST API", "warning", "Testing REST API endpoint...");
      try {
        const restResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        if (restResponse.ok) {
          addResult("REST API", "success", `REST API responding (${restResponse.status})`, {
            status: restResponse.status,
            headers: Object.fromEntries(restResponse.headers.entries())
          });
        } else {
          const errorText = await restResponse.text();
          addResult("REST API", "error", `REST API error (${restResponse.status})`, {
            status: restResponse.status,
            error: errorText
          });
        }
      } catch (restError: any) {
        addResult("REST API", "error", `REST API failed: ${restError.message}`, restError);
      }

      // Test 4: Direct auth login attempt
      addResult("Direct Login", "warning", "Testing direct login API call...");
      try {
        const loginResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'test@invalid.com',
            password: 'invalid'
          }),
          signal: AbortSignal.timeout(15000) // 15 second timeout
        });
        
        const loginData = await loginResponse.json();
        if (loginResponse.status === 400 && loginData.error_description?.includes('Invalid login credentials')) {
          addResult("Direct Login", "success", "Auth login endpoint is working (invalid credentials expected)", {
            status: loginResponse.status,
            data: loginData
          });
        } else {
          addResult("Direct Login", "warning", `Unexpected login response (${loginResponse.status})`, {
            status: loginResponse.status,
            data: loginData
          });
        }
      } catch (loginError: any) {
        addResult("Direct Login", "error", `Direct login failed: ${loginError.message}`, loginError);
      }

      // Test 5: CORS and Headers test
      addResult("CORS/Headers", "warning", "Testing CORS and headers...");
      try {
        const corsResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?select=count`, {
          method: 'HEAD',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(10000)
        });
        
        addResult("CORS/Headers", corsResponse.ok ? "success" : "warning", 
          corsResponse.ok ? "CORS working" : "CORS issues detected", {
          status: corsResponse.status,
          headers: Object.fromEntries(corsResponse.headers.entries())
        });
      } catch (corsError: any) {
        addResult("CORS/Headers", "error", `CORS test failed: ${corsError.message}`, corsError);
      }

      // Test 6: Browser environment check
      addResult("Environment", "success", "Browser environment check", {
        userAgent: navigator.userAgent,
        origin: window.location.origin,
        protocol: window.location.protocol,
        localStorage: typeof localStorage !== 'undefined',
        fetch: typeof fetch !== 'undefined',
        AbortController: typeof AbortController !== 'undefined'
      });

      addResult("Summary", "success", "All tests completed - check results above");

    } catch (error: any) {
      addResult("General", "error", `Test suite failed: ${error.message}`, error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Direct Supabase Network Test
          <Button 
            onClick={runDirectTests} 
            disabled={isRunning}
            variant="outline"
            size="sm"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Testing...
              </>
            ) : (
              'Run Network Tests'
            )}
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
                      <Badge variant="outline" className="text-xs">{result.test}</Badge>
                      <span className="font-medium text-sm">{result.message}</span>
                    </div>
                    {result.details && (
                      <details className="mt-1">
                        <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                          View Details
                        </summary>
                        <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap">
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
              Click "Run Network Tests" to perform direct Supabase connectivity tests
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}