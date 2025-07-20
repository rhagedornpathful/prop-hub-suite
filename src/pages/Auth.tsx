import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Mail, Lock, UserPlus, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { clearEmergencyMode, getAuthRedirectUrl } from '@/lib/authUtils';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { ForgotPasswordDialog } from '@/components/auth/ForgotPasswordDialog';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { FormFieldError } from '@/components/FormFieldError';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [rememberMe, setRememberMe] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if user is already logged in and handle password reset
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        console.log('🔍 Auth page: Checking if user is already logged in...');
        
        // Clear emergency mode on auth page visit
        clearEmergencyMode();
        
        // Check for password reset flow
        const isReset = searchParams.get('reset');
        if (isReset === 'true') {
          setActiveTab('reset-password');
          toast({
            title: "Password Reset",
            description: "Please enter your new password below.",
          });
        }
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('🔍 Auth page: Session check result:', {
          session: !!session,
          error: error
        });
        
        if (session && !error && !isReset) {
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
        } else if (activeTab === 'signup' && value.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        }
        break;
      case 'confirmPassword':
        if (activeTab === 'signup' && value !== password) {
          errors.confirmPassword = 'Passwords do not match';
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
      case 'confirmPassword':
        setConfirmPassword(value);
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});
    
    // Validate form
    const emailValid = validateField('email', email);
    const passwordValid = validateField('password', password);
    const confirmPasswordValid = validateField('confirmPassword', confirmPassword);
    
    if (!emailValid || !passwordValid || !confirmPasswordValid) {
      setLoading(false);
      return;
    }
    
    // Check password strength
    if (passwordStrength < 60) {
      setError('Please choose a stronger password');
      setLoading(false);
      return;
    }
    
    try {
      console.log('🔐 Auth: Starting sign up process...');
      
      // Clear any existing state
      clearEmergencyMode();
      
      const redirectUrl = getAuthRedirectUrl();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) {
        console.error('❌ Sign up error:', error);
        throw error;
      }
      
      if (data.user) {
        if (data.user.email_confirmed_at) {
          // User is immediately confirmed
          toast({
            title: "Account Created!",
            description: "Welcome! You can now sign in.",
          });
          setActiveTab('signin');
          // Clear form
          setPassword('');
          setConfirmPassword('');
        } else {
          // User needs to confirm email
          toast({
            title: "Check Your Email",
            description: "We've sent you a confirmation link. Please check your email and click the link to activate your account.",
          });
        }
      }
      
    } catch (error: any) {
      console.error('💥 Sign up failed:', error);
      
      let errorMessage = error.message || 'Failed to create account';
      
      if (error.message?.includes('User already registered')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.message?.includes('Password should be')) {
        errorMessage = 'Password does not meet requirements. Please choose a stronger password.';
      }
      
      setError(errorMessage);
      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Emergency admin bypass (hidden feature)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'A') {
        if (email === 'rmh1122@hotmail.com') {
          console.log('🚨 Emergency admin bypass triggered');
          window.location.href = '/admin-emergency';
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [email]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
          <p className="text-muted-foreground">
            Sign in to your account or create a new one
          </p>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                  <FormFieldError error={fieldErrors.email} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => handleFieldChange('password', e.target.value)}
                      className="pl-9 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remember-me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="remember-me" className="text-sm">
                      Remember me
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-sm"
                    onClick={() => setForgotPasswordOpen(true)}
                  >
                    Forgot password?
                  </Button>
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                  <FormFieldError error={fieldErrors.email} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => handleFieldChange('password', e.target.value)}
                      className="pl-9 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
                  
                  {password && (
                    <PasswordStrengthIndicator 
                      password={password} 
                      onStrengthChange={setPasswordStrength}
                    />
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                      className="pl-9 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <FormFieldError error={fieldErrors.confirmPassword} />
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || (activeTab === 'signup' && passwordStrength < 60)}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
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