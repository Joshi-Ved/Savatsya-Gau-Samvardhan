
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();

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

        const state = (navigate as any).location?.state as { from?: Location } | undefined;
        const fromPath = state?.from?.pathname || '/';
        navigate(fromPath, { replace: true });
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
        navigate('/', { replace: true });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');

      navigate('/login', { replace: true });
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="section-container min-h-[80vh] flex items-center justify-center bg-sawatsya-cream dark:bg-dark-background">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-serif font-medium text-center text-sawatsya-wood dark:text-dark-foreground mb-6">
            {isLogin ? 'Login to Your Account' : 'Create an Account'}
          </h1>

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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-sawatsya-earth bg-white dark:bg-dark-input text-gray-900 dark:text-dark-foreground"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sawatsya-earth bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sawatsya-earth bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {isLogin && (
              <div className="text-right">
                <button type="button" onClick={handleForgotPassword} className="text-sm text-sawatsya-earth hover:text-sawatsya-terracotta dark:text-dark-accent dark:hover:text-dark-accent-hover">
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" className="btn-primary w-full" disabled={isLoading}>
              {isLoading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-dark-muted-foreground">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sawatsya-earth hover:text-sawatsya-terracotta dark:text-dark-accent dark:hover:text-dark-accent-hover font-medium"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
