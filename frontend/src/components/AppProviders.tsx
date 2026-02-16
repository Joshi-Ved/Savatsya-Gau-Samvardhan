import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { AnalyticsProvider } from '@/contexts/AnalyticsContext';
import InstallPrompt from '@/components/InstallPrompt';
import ErrorBoundary from '@/components/ErrorBoundary';

const queryClient = new QueryClient();

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Wraps the application with all context providers and global UI components.
 * Keeps App.tsx focused on routing logic only.
 */
const AppProviders = ({ children }: AppProvidersProps) => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AnalyticsProvider>
              <CartProvider>
                <WishlistProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <InstallPrompt />
                    {children}
                  </TooltipProvider>
                </WishlistProvider>
              </CartProvider>
            </AnalyticsProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default AppProviders;
