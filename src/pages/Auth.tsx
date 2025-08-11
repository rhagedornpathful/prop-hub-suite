import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { clearEmergencyMode } from '@/lib/authUtils';
import { ForgotPasswordDialog } from '@/components/auth/ForgotPasswordDialog';
import { FormFieldError } from '@/components/FormFieldError';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [rememberMe, setRememberMe] = useState(false);
  
  const [searchParams] = useSearchParams();

  // Check if user is already logged in
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        console.log('🔍 Auth page: Checking if user is already logged in...');
        
        // Clear emergency mode on auth page visit
        clearEmergencyMode();
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('🔍 Auth page: Session check result:', {
          session: !!session,
          error: error
        });
        
        if (session && !error) {
          console.log('✅ Auth page: User already logged in, redirecting to dashboard');
          
          // Force page refresh to ensure clean state
          window.location.href = '/';
          return;
        }
        
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkExistingSession();
  }, [searchParams]);

  // Validation helper
  const validateField = (field: string, value: string) => {
    const errors: Record<string, string> = {};
    
    switch (field) {
      case 'email':
        if (!value.trim()) {
          errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          errors.email = 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (!value) {
          errors.password = 'Password is required';
        }
        break;
    }
    
    setFieldErrors(prev => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  // Clear field error when user types
  const handleFieldChange = (field: string, value: string) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    switch (field) {
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});
    
    // Validate form
    const emailValid = validateField('email', email);
    const passwordValid = validateField('password', password);
    
    if (!emailValid || !passwordValid) {
      setLoading(false);
      return;
    }
    
    try {
      console.log('🔐 Auth: Starting sign in process...');
      
      // Clear any existing auth state first
      clearEmergencyMode();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      clearTimeout(timeoutId);
      
      if (error) {
        console.error('❌ Sign in error:', error);
        throw error;
      }
      
      if (data.user) {
        console.log('✅ Auth: Sign in successful');
        
        // Store remember me preference
        if (rememberMe) {
          localStorage.setItem('auth_remember_me', 'true');
        } else {
          localStorage.removeItem('auth_remember_me');
        }
        
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
        
        // Wait a moment for auth state to propagate, then redirect
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
      
    } catch (error: any) {
      console.error('💥 Sign in failed:', error);
      
      let errorMessage = 'An unexpected error occurred';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Login timed out. Please check your connection and try again.';
      } else if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and click the confirmation link before signing in.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Checking authentication...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg shadow-lg">
        {/* Logo Section */}
        <div className="pt-8 pb-4 px-8">
          <div className="flex justify-center">
            <img 
              src="/lovable-uploads/d57228a9-3aea-44c1-9331-d5c7640e4b3e.png" 
              alt="Latitude Premier Properties" 
              className="h-32 w-auto object-contain"
            />
          </div>
        </div>
        
        {/* Header Section */}
        <CardHeader className="text-center pt-0 pb-6">
          <CardTitle className="text-3xl font-bold text-foreground mb-2">Welcome</CardTitle>
          <p className="text-muted-foreground text-base">
            Please sign in to your account
          </p>
        </CardHeader>
        {/* Form Section */}
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSignIn} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className="pl-10 h-12 text-base border-2 focus:border-primary"
                  required
                />
              </div>
              <FormFieldError error={fieldErrors.email} />
            </div>
            
            {/* Password Field */}
            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  className="pl-10 pr-12 h-12 text-base border-2 focus:border-primary"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-10 w-10 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <FormFieldError error={fieldErrors.password} />
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-2 border-muted-foreground text-primary focus:ring-primary focus:ring-2"
                />
                <Label htmlFor="remember-me" className="text-sm font-medium">
                  Remember me
                </Label>
              </div>
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-sm text-primary hover:text-primary/80 font-medium"
                onClick={() => setForgotPasswordOpen(true)}
              >
                Forgot password?
              </Button>
            </div>
            
            {/* Error Display */}
            {error && (
              <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Sign In Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold mt-8"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In
                </>
              )}
            </Button>
          </form>
          
          {/* Footer Message */}
          <div className="text-center pt-8 mt-8 border-t border-border">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Need access? Contact your administrator to create an account.
            </p>
          </div>
        </CardContent>
      </Card>

      <ForgotPasswordDialog
        open={forgotPasswordOpen}
        onOpenChange={setForgotPasswordOpen}
      />
    </div>
  );
};

export default Auth;