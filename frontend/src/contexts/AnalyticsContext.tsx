import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface UserAction {
  id: string;
  type: 'page_view' | 'product_view' | 'add_to_cart' | 'remove_from_cart' | 'search' | 'filter' | 'purchase' | 'wishlist_add';
  timestamp: Date;
  data: Record<string, any>;
  sessionId: string;
}

export interface UserSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  pageViews: number;
  actions: UserAction[];
  userAgent: string;
  referrer?: string;
}

export interface AnalyticsData {
  sessions: UserSession[];
  totalPageViews: number;
  averageSessionDuration: number;
  popularProducts: string[];
  searchTerms: string[];
  conversionRate: number;
}

type AnalyticsContextType = {
  currentSession: UserSession | null;
  analytics: AnalyticsData;
  trackAction: (type: UserAction['type'], data?: Record<string, any>) => void;
  trackPageView: (page: string, title?: string) => void;
  trackProductView: (productId: string, productName: string) => void;
  trackSearch: (query: string, results: number) => void;
  trackPurchase: (orderId: string, value: number, items: any[]) => void;
  getPopularProducts: (limit?: number) => string[];
  getSearchInsights: () => { term: string; count: number }[];
  exportAnalytics: () => string;
  clearAnalytics: () => void;
};

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider = ({ children }: { children: ReactNode }) => {
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    sessions: [],
    totalPageViews: 0,
    averageSessionDuration: 0,
    popularProducts: [],
    searchTerms: [],
    conversionRate: 0
  });
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
   
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newSession: UserSession = {
      id: sessionId,
      startTime: new Date(),
      pageViews: 0,
      actions: [],
      userAgent: navigator.userAgent,
      referrer: document.referrer || undefined
    };
    
    setCurrentSession(newSession);
   

   
    const savedAnalytics = localStorage.getItem('user-analytics');
    if (savedAnalytics) {
      try {
        const parsed = JSON.parse(savedAnalytics);
        setAnalytics({
          ...parsed,
          sessions: parsed.sessions.map((session: any) => ({
            ...session,
            startTime: new Date(session.startTime),
            endTime: session.endTime ? new Date(session.endTime) : undefined,
            actions: session.actions.map((action: any) => ({
              ...action,
              timestamp: new Date(action.timestamp)
            }))
          }))
        });
      } catch (error) {
        console.error('Error loading analytics:', error);
      }
    }

   
    const endSession = () => {
      setCurrentSession(prevSession => {
        if (!prevSession || prevSession.endTime) return prevSession;
        const endedSession: UserSession = { ...prevSession, endTime: new Date() };
        setAnalytics(prev => ({ ...prev, sessions: [...prev.sessions, endedSession] }));
       
        return endedSession;
      });
    };

   
    const handleBeforeUnload = () => endSession();
    const handlePageHide = () => endSession();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') endSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
     
      endSession();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
   
    localStorage.setItem('user-analytics', JSON.stringify(analytics));
  }, [analytics]);

  const trackAction = (type: UserAction['type'], data: Record<string, any> = {}) => {
    if (!currentSession) return;

    const action: UserAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date(),
      data,
      sessionId: currentSession.id
    };

    setCurrentSession(prev => prev ? {
      ...prev,
      actions: [...prev.actions, action]
    } : null);
   
    // Send to backend for real-time admin tracking
    try {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: type,
          payload: data,
          userId: user?._id || null
        })
      }).catch(() => {}); // Silently fail if backend is unavailable
    } catch (error) {
      // Ignore tracking errors
    }
  };

  const trackPageView = (page: string, title?: string) => {
    trackAction('page_view', { page, title });
    
    setCurrentSession(prev => prev ? {
      ...prev,
      pageViews: prev.pageViews + 1
    } : null);
   

    setAnalytics(prev => ({
      ...prev,
      totalPageViews: prev.totalPageViews + 1
    }));
  };

  const trackProductView = (productId: string, productName: string) => {
    trackAction('product_view', { productId, productName });
    
    setAnalytics(prev => {
      const popularProducts = [...prev.popularProducts];
      const index = popularProducts.indexOf(productId);
      
      if (index > -1) {
       
        popularProducts.splice(index, 1);
      }
      popularProducts.unshift(productId);
      
      return {
        ...prev,
        popularProducts: popularProducts.slice(0, 20)
      };
    });
  };

  const trackSearch = (query: string, results: number) => {
    trackAction('search', { query, results });
    
    setAnalytics(prev => ({
      ...prev,
      searchTerms: [...prev.searchTerms, query].slice(-100)
    }));
  };

  const trackPurchase = (orderId: string, value: number, items: any[]) => {
    trackAction('purchase', { orderId, value, items });
    
   
    setAnalytics(prev => {
      const totalSessions = prev.sessions.length;
      const purchaseSessions = prev.sessions.filter(session => 
        session.actions.some(action => action.type === 'purchase')
      ).length;
      
      return {
        ...prev,
        conversionRate: totalSessions > 0 ? (purchaseSessions / totalSessions) * 100 : 0
      };
    });
  };

  const getPopularProducts = (limit: number = 10): string[] => {
    return analytics.popularProducts.slice(0, limit);
  };

  const getSearchInsights = (): { term: string; count: number }[] => {
    const termCounts = analytics.searchTerms.reduce((acc, term) => {
      acc[term] = (acc[term] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(termCounts)
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  };

  const exportAnalytics = (): string => {
    return JSON.stringify(analytics, null, 2);
  };

  const clearAnalytics = () => {
    setAnalytics({
      sessions: [],
      totalPageViews: 0,
      averageSessionDuration: 0,
      popularProducts: [],
      searchTerms: [],
      conversionRate: 0
    });
    localStorage.removeItem('user-analytics');
  };

  return (
    <AnalyticsContext.Provider value={{
      currentSession,
      analytics,
      trackAction,
      trackPageView,
      trackProductView,
      trackSearch,
      trackPurchase,
      getPopularProducts,
      getSearchInsights,
      exportAnalytics,
      clearAnalytics
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
