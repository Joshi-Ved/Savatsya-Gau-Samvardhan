import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';

interface LoginProps {
  initialIsLogin?: boolean;
}

const Login: React.FC<LoginProps> = ({ initialIsLogin = true }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const modeParam = searchParams.get('mode');
  
  const [isLogin, setIsLogin] = useState<boolean>(() => {
    if (modeParam === 'signup' || modeParam === 'register') return false;
    if (location.pathname === '/signup' || location.pathname === '/register') return false;
    return initialIsLogin;
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  
  const { login, loginWithGoogle, isLoading } = useAuth();
  const navigate = useNavigate();

  // Keep mode in sync if URL changes
  useEffect(() => {
    if (modeParam === 'signup' || modeParam === 'register' || location.pathname === '/signup' || location.pathname === '/register') {
      setIsLogin(false);
    } else if (modeParam === 'login' || location.pathname === '/login') {
      setIsLogin(true);
    }
  }, [location.pathname, modeParam]);

  const redirectAfterAuth = () => {
    const fromPath = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
    navigate(fromPath, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password.trim();

      // Validate name for registration
      if (!isLogin && !name.trim()) {
        toast.error('Name is required for registration');
        return;
      }

      if (isLogin) {
        await login(normalizedEmail, normalizedPassword);
        toast.success('Successfully logged in!');
        redirectAfterAuth();
      } else {
        const res = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail, password: normalizedPassword, name: name.trim() })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        await login(normalizedEmail, normalizedPassword);
        toast.success('Account created! You are now logged in.');
        redirectAfterAuth();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred during authentication');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error('No Google credentials received. Please try again.');
      return;
    }

    setIsGoogleSubmitting(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
      toast.success(isLogin ? 'Successfully logged in with Google!' : 'Welcome to Savatsya! Signed in with Google.');
      redirectAfterAuth();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Google authentication failed');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google Sign-In was cancelled or failed to connect.');
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const isFormBusy = isLoading || isGoogleSubmitting;
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <div className="section-container min-h-[85vh] flex items-center justify-center py-12 px-4 bg-sawatsya-cream dark:bg-dark-background transition-colors duration-200">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-md border border-sawatsya-sand/60 dark:border-dark-input-border p-8 transition-all">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-sawatsya-wood dark:text-dark-foreground">
              {isLogin ? 'Welcome Back' : 'Create Your Account'}
            </h1>
            <p className="text-sm text-sawatsya-earth/80 dark:text-dark-muted-foreground mt-1 font-sans">
              {isLogin ? 'Login to manage your orders & preferences' : 'Join the Savatsya Gau Samvardhan community'}
            </p>
          </div>

          {/* Google Sign In Section */}
          <div className="w-full flex flex-col items-center">
            {googleClientId ? (
              <div className="w-full flex justify-center google-auth-button-container">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  text={isLogin ? 'continue_with' : 'signup_with'}
                  shape="rectangular"
                  width="380"
                />
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => toast.info('Please configure VITE_GOOGLE_CLIENT_ID in your environment to enable Google Sign-In.')}
                className="w-full flex items-center justify-center gap-3 py-5 border-gray-300 dark:border-dark-input-border hover:bg-gray-50 dark:hover:bg-dark-input text-gray-700 dark:text-dark-foreground font-medium rounded-md shadow-sm transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </Button>
            )}
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-dark-input-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-dark-card px-3 text-gray-500 dark:text-dark-muted-foreground font-medium tracking-wider">
                or
              </span>
            </div>
          </div>

          {/* Standard Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-dark-foreground mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Anand Sharma"
                  disabled={isFormBusy}
                  className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-dark-input-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sawatsya-earth bg-white dark:bg-dark-input text-gray-900 dark:text-dark-foreground disabled:opacity-50"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-dark-foreground mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                disabled={isFormBusy}
                className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sawatsya-earth bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-dark-foreground mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                disabled={isFormBusy}
                className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sawatsya-earth bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
              />
            </div>

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm font-medium text-sawatsya-earth hover:text-sawatsya-terracotta dark:text-dark-accent dark:hover:text-dark-accent-hover transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="btn-primary w-full py-2.5 rounded-lg font-medium shadow-sm transition-all"
              disabled={isFormBusy}
            >
              {isFormBusy ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-dark-muted-foreground">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                disabled={isFormBusy}
                className="text-sawatsya-earth hover:text-sawatsya-terracotta dark:text-dark-accent dark:hover:text-dark-accent-hover font-semibold transition-colors ml-1"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

