import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_ENDPOINTS } from '@/config/api';
import { setAccessToken as setToken, clearAccessToken as clearToken } from '@/lib/authToken';

export interface TwoFactorAuth {
  enabled: boolean;
  method?: 'email' | 'sms' | 'app';
  enabledAt?: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  profilePicture?: string;
  address?: Address[];
  preferences: UserPreferences;
  twoFactorAuth?: TwoFactorAuth;
  passwordChangedAt?: Date;
  isActive?: boolean;
  isAdmin?: boolean;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'hi' | 'mr';
  currency: 'INR';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  serverError?: boolean;
  accessToken?: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (userData: Partial<User>, password: string) => Promise<void>;
  logout: () => void;
  updatePreferences: (prefs: UserPreferences) => void;
  updateUser: (updates: Partial<Pick<User, 'name' | 'email' | 'phone' | 'profilePicture'>>) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, updates: Omit<Address, 'id'>) => void;
  deleteAddress: (id: string) => void;
  checkAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  // Initialize loading state; we'll attempt silent refresh on mount
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [serverError, setServerError] = useState<boolean>(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      // Attempt silent refresh using HttpOnly cookie
      const res = await fetch(API_ENDPOINTS.AUTH.REFRESH, { method: 'POST', credentials: 'include' });

      if (!res.ok) {
        setUser(null);
        setAccessToken(null);
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      if (data && data.accessToken) {
        setAccessToken(data.accessToken);
        setToken(data.accessToken);
        // Optionally set user from payload
        setUser({
          id: data.userId || '',
          name: data.name || data.email?.split('@')[0] || 'User',
          email: data.email || '',
          phone: data.phone || '',
          profilePicture: data.profilePicture || '',
          preferences: data.preferences || {
            theme: 'light',
            language: 'en',
            currency: 'INR',
            notifications: { email: true, sms: true, push: true }
          },
          address: data.address || [],
          isAdmin: data.isAdmin || false,
        });
      } else {
        setUser(null);
        setAccessToken(null);
      }
    } catch (error) {
      console.error('Network error during auth check:', error);
      setServerError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setServerError(false);
    try {
      const res = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      // Server sets HttpOnly refresh cookie and returns accessToken
      if (data.accessToken) { setAccessToken(data.accessToken); setToken(data.accessToken); }

      // Fetch user profile immediately using access token
      try {
        const meRes = await fetch(API_ENDPOINTS.USER.ME, {
          headers: { Authorization: `Bearer ${data.accessToken}` }
        });

        if (meRes.ok) {
          const me = await meRes.json();
          setUser({
            id: me.userId || data.userId || '',
            name: me.name || me.email?.split('@')[0] || 'User',
            email: me.email || email,
            phone: me.phone || '',
            profilePicture: me.profilePicture || '',
            preferences: me.preferences || {
              theme: 'light',
              language: 'en',
              currency: 'INR',
              notifications: { email: true, sms: true, push: true }
            },
            address: me.address || [],
            isAdmin: me.isAdmin || false,
          });
        }
      } catch (err) {
        console.warn('Failed to fetch full profile after login:', err);
      }
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (credential: string) => {
    setIsLoading(true);
    setServerError(false);
    try {
      const res = await fetch(API_ENDPOINTS.AUTH.GOOGLE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ credential })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google authentication failed');

      if (data.accessToken) {
        setAccessToken(data.accessToken);
        setToken(data.accessToken);
      }

      // Fetch user profile immediately using access token
      try {
        const meRes = await fetch(API_ENDPOINTS.USER.ME, {
          headers: { Authorization: `Bearer ${data.accessToken}` }
        });

        if (meRes.ok) {
          const me = await meRes.json();
          setUser({
            id: me.userId || data.userId || '',
            name: me.name || data.name || data.email?.split('@')[0] || 'User',
            email: me.email || data.email,
            avatar: me.avatar || data.avatar || '',
            phone: me.phone || '',
            profilePicture: me.profilePicture || data.avatar || '',
            preferences: me.preferences || {
              theme: 'light',
              language: 'en',
              currency: 'INR',
              notifications: { email: true, sms: true, push: true }
            },
            address: me.address || [],
            isAdmin: me.isAdmin || data.isAdmin || false,
          });
        } else {
          setUser({
            id: data.userId || '',
            name: data.name || data.email?.split('@')[0] || 'User',
            email: data.email || '',
            avatar: data.avatar || '',
            profilePicture: data.avatar || '',
            preferences: {
              theme: 'light',
              language: 'en',
              currency: 'INR',
              notifications: { email: true, sms: true, push: true }
            },
            address: [],
            isAdmin: data.isAdmin || false,
          });
        }
      } catch (err) {
        console.warn('Failed to fetch full profile after Google login:', err);
        setUser({
          id: data.userId || '',
          name: data.name || data.email?.split('@')[0] || 'User',
          email: data.email || '',
          avatar: data.avatar || '',
          profilePicture: data.avatar || '',
          preferences: {
            theme: 'light',
            language: 'en',
            currency: 'INR',
            notifications: { email: true, sms: true, push: true }
          },
          address: [],
          isAdmin: data.isAdmin || false,
        });
      }
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User>, password: string) => {
    setIsLoading(true);
    const res = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userData.email, password })
    });
    const data = await res.json();
    setIsLoading(false);
    if (!res.ok) throw new Error(data.error || 'Registration failed');
  };

  const logout = async () => {
    try {
      // Server will clear refresh cookie and revoke token
      await fetch(API_ENDPOINTS.AUTH.LOGOUT, { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }

    // Always clear local state and access token
    setUser(null);
    setAccessToken(null);
    clearToken();
  };

  const updatePreferences = (prefs: UserPreferences) => {
    setUser(prev => prev ? { ...prev, preferences: prefs } : prev);
    if (accessToken) {
      fetch(API_ENDPOINTS.USER.PREFERENCES, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ preferences: prefs })
      }).catch((err) => {
        console.warn('Failed to sync preferences:', err.message);
      });
    }
  };

  const updateUser = async (updates: Partial<Pick<User, 'name' | 'email' | 'phone' | 'profilePicture'>>) => {
    if (!accessToken) throw new Error('No authentication token found');

    const response = await fetch(API_ENDPOINTS.USER.PROFILE, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update profile');
    }

    await response.json();
    setUser(prev => prev ? { ...prev, ...updates } : prev);
  };

  const addAddress = (address: Omit<Address, 'id'>) => {
    setUser(prev => {
      if (!prev) return prev;
      const newAddress: Address = { id: `addr_${Date.now()}`, ...address };
      const addresses = [...(prev.address || [])];
      if (newAddress.isDefault) {
        addresses.forEach(a => (a.isDefault = false));
      }
      addresses.push(newAddress);
      return { ...prev, address: addresses };
    });
    if (accessToken) {
      fetch(API_ENDPOINTS.USER.ADDRESSES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ id: `addr_${Date.now()}`, ...address })
      }).catch((err) => {
        console.warn('Failed to sync new address:', err.message);
      });
    }
  };

  const updateAddress = (id: string, updates: Omit<Address, 'id'>) => {
    setUser(prev => {
      if (!prev) return prev;
      const addresses = (prev.address || []).map(a => {
        if (a.id !== id) return a;
        return { ...a, ...updates };
      });
      if (updates.isDefault) {
        addresses.forEach(a => { if (a.id !== id) a.isDefault = false; });
      }
      return { ...prev, address: addresses };
    });
    if (accessToken) {
      fetch(API_ENDPOINTS.USER.ADDRESS(id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(updates)
      }).catch((err) => {
        console.warn('Failed to sync address update:', err.message);
      });
    }
  };

  const deleteAddress = (id: string) => {
    setUser(prev => prev ? { ...prev, address: (prev.address || []).filter(a => a.id !== id) } : prev);
    if (accessToken) {
      fetch(API_ENDPOINTS.USER.ADDRESS(id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      }).catch((err) => {
        console.warn('Failed to sync address deletion:', err.message);
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      serverError,
      accessToken,
      login,
      loginWithGoogle,
      register,
      logout,
      updatePreferences,
      updateUser,
      addAddress,
      updateAddress,
      deleteAddress,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
