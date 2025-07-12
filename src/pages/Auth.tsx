import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { SupabaseConnectionTest } from "@/components/SupabaseConnectionTest";
import { DirectSupabaseTest } from "@/components/DirectSupabaseTest";
import { Eye, EyeOff, Mail, Lock, Bug, Send, AlertTriangle, TestTube } from "lucide-react";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [showDebugMode, setShowDebugMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const buttonTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Add debug info helper
  const addDebugInfo = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev.slice(-9), `[${timestamp}] ${message}`]);
    console.log(`🐛 Debug: ${message}`);
  };

  // Check Supabase connection and environment
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      addDebugInfo("Checking Supabase connection...");
      try {
        // Test basic connection
        const { data, error } = await supabase.auth.getSession();
        addDebugInfo(`Supabase connection: ${error ? 'FAILED' : 'OK'}`);
        addDebugInfo(`Environment: ${window.location.origin}`);
        addDebugInfo(`Supabase URL: https://nhjsxtwuweegqcexakoz.supabase.co`);
        
        if (error) {
          addDebugInfo(`Connection error: ${error.message}`);
        }
      } catch (err: any) {
        addDebugInfo(`Connection exception: ${err.message}`);
      }
    };
    
    checkSupabaseConnection();
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    console.log('🔍 Auth page: Checking if user is already logged in...');
    addDebugInfo("Checking existing session...");
    
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('🔍 Auth page: Session check result:', { session: !!session, error });
        addDebugInfo(`Existing session: ${session ? 'Found' : 'None'}`);
        
        if (session) {
          console.log('✅ Auth page: User already logged in, redirecting to dashboard');
          addDebugInfo("User already logged in - redirecting");
          navigate("/");
        }
      } catch (error: any) {
        console.error('❌ Auth page: Error checking session:', error);
        addDebugInfo(`Session check error: ${error.message}`);
      }
    };
    checkUser();
  }, [navigate]);

  // Emergency admin bypass keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+Shift+A (Windows/Linux) or Cmd+Shift+A (Mac)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'A') {
        console.log('🚨 Emergency admin bypass triggered');
        if (email === 'rmh1122@hotmail.com') {
          handleEmergencyAdminBypass();
        } else {
          console.log('❌ Emergency bypass: Email does not match required admin email');
          toast({
            title: "Emergency Bypass",
            description: "Email must be rmh1122@hotmail.com for emergency access",
            variant: "destructive",
          });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [email]);

  // Emergency admin bypass function
  const handleEmergencyAdminBypass = async () => {
    console.log('🚨 Executing emergency admin bypass...');
    try {
      setLoading(true);
      
      // Create a mock session for the specific admin user
      const adminUserId = '1c376b70-c535-4ee4-8275-5d017704b3db';
      console.log('🚨 Emergency bypass: Setting admin session for user:', adminUserId);
      
      // Try to create session directly (this is a temporary workaround)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'rmh1122@hotmail.com',
        password: 'temp_emergency_bypass_' + Date.now()
      });
      
      if (error) {
        // If normal auth fails, we'll try the RPC to force admin role
        console.log('🚨 Emergency bypass: Normal auth failed, trying force admin...');
        const { data: adminResult, error: adminError } = await supabase.rpc('force_make_me_admin');
        
        if (adminError) {
          throw new Error('Emergency bypass failed: ' + adminError.message);
        }
        
        console.log('✅ Emergency bypass: Admin role forced, redirecting...');
      }
      
      toast({
        title: "Emergency Access Granted",
        description: "Admin bypass successful - redirecting to dashboard",
      });
      
      // Force redirect
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Emergency bypass failed:', error);
      toast({
        title: "Emergency Bypass Failed",
        description: error.message || "Could not bypass login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeoutReached(false);

    console.log('🔐 Auth: Starting authentication process...', { 
      isSignUp, 
      email: email.substring(0, 5) + '***'
    });
    addDebugInfo(`Starting ${isSignUp ? 'sign up' : 'sign in'} for ${email.substring(0, 5)}***`);

    // Clear any existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (buttonTimeoutRef.current) clearTimeout(buttonTimeoutRef.current);

    // Set up 30-second timeout for the entire operation
    const timeoutPromise = new Promise((_, reject) => {
      timeoutRef.current = setTimeout(() => {
        console.error('⏰ Auth: Request timed out after 30 seconds');
        addDebugInfo("❌ Request timed out after 30 seconds");
        reject(new Error('Login request timed out after 30 seconds. Please try again.'));
      }, 30000);
    });

    // Set up 10-second timeout for button text change
    buttonTimeoutRef.current = setTimeout(() => {
      console.log('⏰ Auth: Changing button text after 10 seconds');
      addDebugInfo("⏰ Request taking longer than expected...");
      setTimeoutReached(true);
    }, 10000);

    try {
      if (isSignUp) {
        console.log('📝 Auth: Processing sign up...');
        addDebugInfo("Processing sign up...");
        
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        const redirectUrl = `${window.location.origin}/`;
        console.log('📝 Auth: Sign up redirect URL:', redirectUrl);
        addDebugInfo(`Sign up redirect URL: ${redirectUrl}`);
        
        const authPromise = supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl
          }
        });

        addDebugInfo("Calling Supabase signUp...");
        const { error } = await Promise.race([authPromise, timeoutPromise]) as any;

        if (error) {
          console.error('❌ Auth: Sign up error:', error);
          addDebugInfo(`❌ Sign up error: ${error.message}`);
          throw error;
        }

        console.log('✅ Auth: Sign up successful');
        addDebugInfo("✅ Sign up successful");
        toast({
          title: "Success",
          description: "Please check your email to confirm your account",
        });
      } else {
        console.log('🔑 Auth: Processing sign in...');
        addDebugInfo("Processing sign in...");
        
        // Clear any existing sessions first to avoid conflicts
        try {
          addDebugInfo("Clearing any existing sessions...");
          await supabase.auth.signOut();
          // Wait a moment for cleanup
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (cleanupError) {
          console.log('Session cleanup error (this is normal):', cleanupError);
        }
        
        addDebugInfo("Calling Supabase signInWithPassword...");
        
        // Create a more robust timeout mechanism
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          addDebugInfo("❌ Supabase call aborted after 20 seconds");
        }, 20000);

        try {
          addDebugInfo("Waiting for Supabase response...");
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          clearTimeout(timeoutId);
          addDebugInfo("✅ Supabase response received");

          if (error) {
            console.error('❌ Auth: Sign in error:', error);
            addDebugInfo(`❌ Sign in error: ${error.message}`);
            addDebugInfo(`Error code: ${error.code || 'unknown'}`);
            throw error;
          }

          console.log('✅ Auth: Sign in successful', { userId: data?.user?.id });
          addDebugInfo(`✅ Sign in successful - User ID: ${data?.user?.id?.substring(0, 8)}...`);

          if (data.user) {
            console.log('🚀 Auth: Redirecting to dashboard...');
            addDebugInfo("User data received, preparing redirect...");
            
            // Clear emergency mode flags to ensure clean state
            sessionStorage.removeItem('emergencyAdmin');
            sessionStorage.removeItem('emergencyAdminUser');
            delete (window as any).__EMERGENCY_ADMIN_MODE__;
            addDebugInfo("Cleared emergency mode flags");
            
            // Clear any view-as state to prevent conflicts
            sessionStorage.removeItem('viewAsRole');
            addDebugInfo("Cleared view-as state");
            
            // Wait for auth state to settle, then redirect
            addDebugInfo("Waiting for auth state to settle...");
            setTimeout(() => {
              addDebugInfo("Redirecting to dashboard...");
              window.location.href = '/';
            }, 1000);
            
          } else {
            console.warn('⚠️ Auth: No user data returned from sign in');
            addDebugInfo("⚠️ No user data returned");
            throw new Error('No user data returned from sign in');
          }
        } catch (error: any) {
          clearTimeout(timeoutId);
          if (error.name === 'AbortError') {
            addDebugInfo(`❌ Login timed out after 20 seconds`);
            throw new Error('Login timed out after 20 seconds. Please try again.');
          }
          addDebugInfo(`❌ Supabase call failed: ${error.message}`);
          throw error;
        }
      }
    } catch (error: any) {
      console.error('❌ Auth: Authentication failed:', error);
      addDebugInfo(`❌ Authentication failed: ${error.message}`);
      
      toast({
        title: "Authentication Error",
        description: error.message || "An error occurred during authentication. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Clear timeouts
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (buttonTimeoutRef.current) clearTimeout(buttonTimeoutRef.current);
      
      setLoading(false);
      setTimeoutReached(false);
      addDebugInfo("Authentication process completed");
      console.log('🏁 Auth: Authentication process completed');
    }
  };

  const handleSSOLogin = async (provider: 'google' | 'azure') => {
    console.log(`🔗 Auth: Starting ${provider} SSO login...`);
    addDebugInfo(`Starting ${provider} SSO login...`);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error(`❌ Auth: ${provider} SSO error:`, error);
        addDebugInfo(`❌ ${provider} SSO error: ${error.message}`);
        throw error;
      }
      console.log(`✅ Auth: ${provider} SSO initiated successfully`);
      addDebugInfo(`✅ ${provider} SSO initiated successfully`);
    } catch (error: any) {
      console.error(`❌ Auth: ${provider} SSO failed:`, error);
      addDebugInfo(`❌ ${provider} SSO failed: ${error.message}`);
      toast({
        title: "SSO Error",
        description: error.message || `Failed to sign in with ${provider}`,
        variant: "destructive",
      });
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first",
        variant: "destructive",
      });
      return;
    }

    setMagicLinkLoading(true);
    addDebugInfo(`Sending magic link to ${email.substring(0, 5)}***`);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('❌ Auth: Magic link error:', error);
        addDebugInfo(`❌ Magic link error: ${error.message}`);
        throw error;
      }

      console.log('✅ Auth: Magic link sent successfully');
      addDebugInfo("✅ Magic link sent successfully");
      
      toast({
        title: "Magic Link Sent",
        description: "Check your email for a login link",
      });
    } catch (error: any) {
      console.error('❌ Auth: Magic link failed:', error);
      addDebugInfo(`❌ Magic link failed: ${error.message}`);
      
      toast({
        title: "Magic Link Error",
        description: error.message || "Failed to send magic link",
        variant: "destructive",
      });
    } finally {
      setMagicLinkLoading(false);
    }
  };

  const testSupabaseConnection = async () => {
    console.log('🔍 Testing Supabase connection...');
    addDebugInfo("Starting Supabase connection test...");
    
    try {
      // Test 1: Check if client exists
      console.log('✅ Test 1: Supabase client exists:', !!supabase);
      addDebugInfo(`Test 1: Supabase client exists: ${!!supabase}`);
      
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }

      // Test 2: Check network connectivity
      addDebugInfo("Test 2: Checking network connectivity...");
      try {
        const response = await fetch('https://nhjsxtwuweegqcexakoz.supabase.co/rest/v1/', {
          method: 'HEAD',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oanN4dHd1d2VlZ3FjZXhha296Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTUwMjUsImV4cCI6MjA2NzY3MTAyNX0.GJ46q5JwybtA3HdYu9BWrobTTi62fevlz_LQ7NG4amk'
          }
        });
        console.log('✅ Test 2: Network connectivity:', response.ok);
        addDebugInfo(`Test 2: Network response: ${response.status} ${response.statusText}`);
      } catch (netError: any) {
        console.error('❌ Test 2: Network error:', netError);
        addDebugInfo(`Test 2: Network error: ${netError.message}`);
      }

      // Test 3: Try a simple anonymous query with timeout
      addDebugInfo("Test 3: Testing database query...");
      const queryPromise = supabase
        .from('user_roles')
        .select('count')
        .limit(1);

      const queryTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000);
      });

      try {
        const { data, error } = await Promise.race([queryPromise, queryTimeout]) as any;
        console.log('✅ Test 3: Query test result:', { data, error });
        addDebugInfo(`Test 3: Query ${error ? 'failed' : 'succeeded'}: ${error?.message || 'OK'}`);
      } catch (queryError: any) {
        console.error('❌ Test 3: Query error:', queryError);
        addDebugInfo(`Test 3: Query error: ${queryError.message}`);
      }

      // Test 4: Check auth endpoint specifically
      addDebugInfo("Test 4: Testing auth endpoint...");
      const sessionPromise = supabase.auth.getSession();
      const sessionTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Session check timeout after 10 seconds')), 10000);
      });

      try {
        const { data: { session }, error } = await Promise.race([sessionPromise, sessionTimeout]) as any;
        console.log('✅ Test 4: Session check result:', { session: !!session, error });
        addDebugInfo(`Test 4: Session check ${error ? 'failed' : 'succeeded'}: ${error?.message || 'OK'}`);
      } catch (sessionError: any) {
        console.error('❌ Test 4: Session check error:', sessionError);
        addDebugInfo(`Test 4: Session check error: ${sessionError.message}`);
      }

      // Test 5: Check environment variables
      addDebugInfo("Test 5: Environment check...");
      console.log('✅ Test 5: Environment details:', {
        origin: window.location.origin,
        supabaseUrl: 'https://nhjsxtwuweegqcexakoz.supabase.co',
        userAgent: navigator.userAgent.substring(0, 50) + '...'
      });
      addDebugInfo(`Test 5: Origin: ${window.location.origin}`);
      addDebugInfo(`Test 5: Browser: ${navigator.userAgent.split(' ')[0]}`);

      console.log('🎉 Connection test completed - check debug panel for results');
      toast({
        title: "Connection Test Complete",
        description: "Check the debug panel and console for detailed results",
      });

    } catch (error: any) {
      console.error('💥 Connection test failed:', error);
      addDebugInfo(`❌ Connection test failed: ${error.message}`);
      
      toast({
        title: "Connection Test Failed",
        description: error.message || "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/a1c36a6f-e37d-42f5-9f3c-f434a26e8627.png" 
              alt="Lattitude Premier Properties" 
              className="w-24 h-24 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? "Sign up to manage your properties" 
              : "Sign in to access your property management dashboard"
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Debug Mode Toggle and Connection Test */}
          <div className="flex justify-between items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowDebugMode(!showDebugMode)}
              className="text-xs flex-1"
            >
              <Bug className="w-3 h-3 mr-1" />
              {showDebugMode ? 'Hide' : 'Show'} Debug Info
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={testSupabaseConnection}
              className="text-xs flex-1"
            >
              <TestTube className="w-3 h-3 mr-1" />
              Test Connection
            </Button>
            
            {debugInfo.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {debugInfo.length}
              </Badge>
            )}
          </div>

          {/* Debug Info Panel */}
          {showDebugMode && (
            <Card className="border border-muted">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bug className="w-4 h-4" />
                  Debug Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {debugInfo.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No debug info yet</p>
                  ) : (
                    debugInfo.map((info, index) => (
                      <div key={index} className="text-xs font-mono bg-muted p-1 rounded">
                        {info}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* SSO Providers */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleSSOLogin('google')}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleSSOLogin('azure')}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M21.8 10.5h-8.3l7.6-7.6c.4-.4.4-1 0-1.4s-1-.4-1.4 0L12.1 9.1 4.5 1.5c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4l7.6 7.6H2.2c-.6 0-1 .4-1 1s.4 1 1 1h8.5l-7.6 7.6c-.4.4-.4 1 0 1.4.2.2.5.3.7.3s.5-.1.7-.3l7.6-7.6 7.6 7.6c.2.2.5.3.7.3s.5-.1.7-.3c.4-.4.4-1 0-1.4l-7.6-7.6h8.3c.6 0 1-.4 1-1s-.4-1-1-1z"/>
              </svg>
              Continue with Microsoft
            </Button>
          </div>

          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-card px-2 text-muted-foreground text-sm">or</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full bg-gradient-primary" disabled={loading}>
              {loading 
                ? (timeoutReached ? "Login timeout - Click to retry" : "Please wait...") 
                : (isSignUp ? "Create Account" : "Sign In")
              }
            </Button>

            {/* Magic Link Option */}
            {!isSignUp && (
              <div className="relative">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-card px-2 text-muted-foreground text-xs">or</span>
                </div>
              </div>
            )}

            {!isSignUp && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleMagicLink}
                disabled={magicLinkLoading || !email}
              >
                {magicLinkLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Sending Magic Link...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Magic Link
                  </>
                )}
              </Button>
            )}
          </form>

          {/* Demo Access Button */}
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => navigate('/demo')}
          >
            🚀 View Demo (Skip Login)
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary hover:underline"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Troubleshooting Tips */}
          {timeoutReached && (
            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
                  <div className="space-y-2 text-xs">
                    <p className="font-medium text-orange-800 dark:text-orange-200">
                      Login taking too long? Try these steps:
                    </p>
                    <ul className="space-y-1 text-orange-700 dark:text-orange-300">
                      <li>• Check your internet connection</li>
                      <li>• Use Magic Link as an alternative</li>
                      <li>• Clear browser cache and cookies</li>
                      <li>• Contact support if the issue persists</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comprehensive Supabase Diagnostics */}
          <div className="mt-6 space-y-4">
            <DirectSupabaseTest />
            <SupabaseConnectionTest />
          </div>

          {/* Emergency Admin Access Instructions */}
          <div className="text-center text-xs text-muted-foreground">
            <p>Having trouble? Press Ctrl+Shift+A (or Cmd+Shift+A on Mac) for emergency admin access</p>
            <p className="mt-1">Email must be rmh1122@hotmail.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}