import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_ENDPOINTS } from '@/config/api';

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
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>, password: string) => Promise<void>;
  logout: () => void;
  updatePreferences: (prefs: UserPreferences) => void;
  updateUser: (updates: Partial<Pick<User, 'name' | 'email' | 'phone' | 'profilePicture'>>) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, updates: Omit<Address, 'id'>) => void;
  deleteAddress: (id: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  // Initialize loading state based on token presence to prevent race conditions
  const [isLoading, setIsLoading] = useState(() => !!localStorage.getItem('token'));

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoading(true);
      fetch(API_ENDPOINTS.USER.ME, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.email) {
            setUser({
              id: data.userId || '',
              name: data.name || data.email.split('@')[0] || 'User',
              email: data.email,
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
            localStorage.removeItem('token');
          }
          setIsLoading(false);
        })
        .catch(() => {
          setUser(null);
          localStorage.removeItem('token');
          setIsLoading(false);
        });
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const res = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    localStorage.setItem('token', data.token);

    try {
      const meRes = await fetch(API_ENDPOINTS.USER.ME, {
        headers: { Authorization: `Bearer ${data.token}` }
      });
      const me = await meRes.json();
      if (meRes.ok && me && me.email) {
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
      } else {
        setUser({
          id: data.userId || '',
          name: data.name || email.split('@')[0] || 'User',
          email,
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
      }
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
    const token = localStorage.getItem('token');

    // Call backend logout endpoint if token exists
    if (token) {
      try {
        await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Logout API call failed:', error);
        // Continue with local logout even if API fails
      }
    }

    // Always clear local state and token
    setUser(null);
    localStorage.removeItem('token');
  };

  const updatePreferences = (prefs: UserPreferences) => {
    setUser(prev => prev ? { ...prev, preferences: prefs } : prev);
    const token = localStorage.getItem('token');
    if (token) {
      fetch(API_ENDPOINTS.USER.PREFERENCES, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ preferences: prefs })
      }).catch(() => { });
    }
  };

  const updateUser = async (updates: Partial<Pick<User, 'name' | 'email' | 'phone' | 'profilePicture'>>) => {
    console.log('updateUser called with:', updates);
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    console.log('Making API call to /api/user/profile with token:', token ? 'present' : 'missing');

    try {
      const response = await fetch(API_ENDPOINTS.USER.PROFILE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to update user profile:', errorData);
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const result = await response.json();
      console.log('Profile updated successfully:', result);

      console.log('Updating local user state with:', updates);
      setUser(prev => {
        const newUser = prev ? { ...prev, ...updates } : prev;
        console.log('New user state:', newUser);
        return newUser;
      });

    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
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
    const token = localStorage.getItem('token');
    if (token) {
      fetch(API_ENDPOINTS.USER.ADDRESSES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: `addr_${Date.now()}`, ...address })
      }).catch(() => { });
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
    const token = localStorage.getItem('token');
    if (token) {
      fetch(API_ENDPOINTS.USER.ADDRESS(id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates)
      }).catch(() => { });
    }
  };

  const deleteAddress = (id: string) => {
    setUser(prev => prev ? { ...prev, address: (prev.address || []).filter(a => a.id !== id) } : prev);
    const token = localStorage.getItem('token');
    if (token) {
      fetch(API_ENDPOINTS.USER.ADDRESS(id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => { });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      updatePreferences,
      updateUser,
      addAddress,
      updateAddress,
      deleteAddress
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
