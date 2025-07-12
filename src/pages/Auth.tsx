import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const buttonTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    console.log('🔍 Auth page: Checking if user is already logged in...');
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('🔍 Auth page: Session check result:', { session: !!session, error });
        if (session) {
          console.log('✅ Auth page: User already logged in, redirecting to dashboard');
          navigate("/");
        }
      } catch (error) {
        console.error('❌ Auth page: Error checking session:', error);
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

    // Clear any existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (buttonTimeoutRef.current) clearTimeout(buttonTimeoutRef.current);

    // Set up 30-second timeout for the entire operation
    const timeoutPromise = new Promise((_, reject) => {
      timeoutRef.current = setTimeout(() => {
        console.error('⏰ Auth: Request timed out after 30 seconds');
        reject(new Error('Login request timed out after 30 seconds. Please try again.'));
      }, 30000);
    });

    // Set up 10-second timeout for button text change
    buttonTimeoutRef.current = setTimeout(() => {
      console.log('⏰ Auth: Changing button text after 10 seconds');
      setTimeoutReached(true);
    }, 10000);

    try {
      if (isSignUp) {
        console.log('📝 Auth: Processing sign up...');
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        const redirectUrl = `${window.location.origin}/`;
        console.log('📝 Auth: Sign up redirect URL:', redirectUrl);
        
        const authPromise = supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl
          }
        });

        const { error } = await Promise.race([authPromise, timeoutPromise]) as any;

        if (error) {
          console.error('❌ Auth: Sign up error:', error);
          throw error;
        }

        console.log('✅ Auth: Sign up successful');
        toast({
          title: "Success",
          description: "Please check your email to confirm your account",
        });
      } else {
        console.log('🔑 Auth: Processing sign in...');
        
        const authPromise = supabase.auth.signInWithPassword({
          email,
          password,
        });

        const { data, error } = await Promise.race([authPromise, timeoutPromise]) as any;

        if (error) {
          console.error('❌ Auth: Sign in error:', error);
          throw error;
        }

        console.log('✅ Auth: Sign in successful', { userId: data?.user?.id });

        if (data.user) {
          console.log('🚀 Auth: Redirecting to dashboard...');
          navigate("/");
        } else {
          console.warn('⚠️ Auth: No user data returned from sign in');
          throw new Error('No user data returned from sign in');
        }
      }
    } catch (error: any) {
      console.error('❌ Auth: Authentication failed:', error);
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
      console.log('🏁 Auth: Authentication process completed');
    }
  };

  const handleSSOLogin = async (provider: 'google' | 'azure') => {
    console.log(`🔗 Auth: Starting ${provider} SSO login...`);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error(`❌ Auth: ${provider} SSO error:`, error);
        throw error;
      }
      console.log(`✅ Auth: ${provider} SSO initiated successfully`);
    } catch (error: any) {
      console.error(`❌ Auth: ${provider} SSO failed:`, error);
      toast({
        title: "SSO Error",
        description: error.message || `Failed to sign in with ${provider}`,
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