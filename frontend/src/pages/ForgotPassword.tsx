import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '@/config/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setIsEmailSent(true);
      toast.success('Password reset instructions sent! Check your email.');

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="section-container min-h-[80vh] flex items-center justify-center bg-sawatsya-cream dark:bg-dark-background">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-serif font-medium text-sawatsya-wood dark:text-dark-foreground mb-2">
                Check Your Email
              </h1>
              <p className="text-gray-600 dark:text-dark-muted-foreground">
                We've sent password reset instructions to <strong>{email}</strong>
              </p>
            </div>

            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <p>
                If an account with that email exists, you should receive the reset link within a few minutes.
              </p>
              <p>
                Don't see the email? Check your spam folder or try again with a different email address.
              </p>
              <p className="text-amber-600 dark:text-amber-400">
                <strong>Note:</strong> The reset link will expire in 1 hour for security.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <Button
                onClick={() => setIsEmailSent(false)}
                variant="outline"
                className="w-full"
              >
                Send Another Reset Link
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-sawatsya-earth hover:text-sawatsya-terracotta font-medium"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-container min-h-[80vh] flex items-center justify-center bg-sawatsya-cream dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-serif font-medium text-sawatsya-wood dark:text-gray-100 mb-2">
              Forgot Your Password?
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Enter your email address"
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-sawatsya-earth bg-white dark:bg-dark-input text-gray-900 dark:text-dark-foreground"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                We'll send reset instructions to this email
              </p>
            </div>

            <Button type="submit" className="btn-primary w-full" disabled={isLoading}>
              {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Remember your password?{' '}
              <Link
                to="/login"
                className="text-sawatsya-earth hover:text-sawatsya-terracotta dark:text-dark-accent dark:hover:text-dark-accent-hover font-medium"
              >
                Back to Login
              </Link>
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Need help? Contact our{' '}
              <Link
                to="/contact"
                className="text-sawatsya-earth hover:text-sawatsya-terracotta"
              >
                support team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;