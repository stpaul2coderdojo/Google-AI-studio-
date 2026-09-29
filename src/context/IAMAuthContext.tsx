import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { IAMUser, IAMPermission, IAMLoginResponse, ZeroTrustMetrics } from '../types';

interface IAMAuthContextType {
  user: IAMUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  zeroTrustMetrics: ZeroTrustMetrics | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  hasPermission: (permission: IAMPermission) => boolean;
  clearError: () => void;
  apiFetch: (url: string, options?: RequestInit) => Promise<Response>;
  refreshZeroTrustMetrics: () => Promise<void>;
  runXPrizePipelineTest: () => Promise<any>;
}

const IAMAuthContext = createContext<IAMAuthContextType | undefined>(undefined);

const TOKEN_KEY = 'wilderness_dojo_iam_token';
const USER_KEY = 'wilderness_dojo_iam_user';

export const IAMAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IAMUser | null>(() => {
    try {
      const savedUser = localStorage.getItem(USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY) || null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [zeroTrustMetrics, setZeroTrustMetrics] = useState<ZeroTrustMetrics | null>(null);

  // Authenticated Zero-Trust API Fetch helper
  const apiFetch = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    const currentToken = token || localStorage.getItem(TOKEN_KEY);
    const headers = new Headers(options.headers || {});
    
    if (currentToken && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${currentToken}`);
    }
    headers.set('X-ZeroTrust-Client', 'WildernessDojo-Antigravity-v2');

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      console.warn('Zero-Trust Challenge returned 401 Unauthorized.');
    }

    return response;
  }, [token]);

  // Fetch Zero-Trust Metrics
  const refreshZeroTrustMetrics = useCallback(async () => {
    try {
      const res = await fetch('/api/zero-trust/metrics');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.metrics) {
          setZeroTrustMetrics(data.metrics);
        }
      }
    } catch (err) {
      console.warn('Zero-Trust metrics notice:', err);
    }
  }, []);

  // Run live XPRIZE pipeline test
  const runXPrizePipelineTest = useCallback(async () => {
    try {
      const res = await apiFetch('/api/xprize/run-pipeline-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      await refreshZeroTrustMetrics();
      return data;
    } catch (err: any) {
      return { success: false, error: err?.message || 'Pipeline test failed' };
    }
  }, [apiFetch, refreshZeroTrustMetrics]);

  // Validate session on mount
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/verify', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            setToken(storedToken);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          } else {
            handleLogoutLocally();
          }
        } else {
          handleLogoutLocally();
        }
      } catch (err) {
        console.warn('Session verification notice:', err);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
    refreshZeroTrustMetrics();
  }, [refreshZeroTrustMetrics]);

  const handleLogoutLocally = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data: IAMLoginResponse = await res.json();

      if (res.ok && data.success && data.token && data.user) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        setIsLoading(false);
        await refreshZeroTrustMetrics();
        return true;
      } else {
        const errorMsg = data.error || 'Authentication failed. Please verify credentials.';
        setError(errorMsg);
        setIsLoading(false);
        return false;
      }
    } catch (err: any) {
      const msg = err?.message || 'Server connection error during IAM authentication.';
      setError(msg);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.warn('Logout notification:', err);
    } finally {
      handleLogoutLocally();
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) return { success: false, error: 'User is not authenticated.' };

    try {
      const res = await apiFetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.username,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, message: data.message || 'Password changed successfully.' };
      } else {
        return { success: false, error: data.error || 'Failed to update password.' };
      }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error updating password.' };
    }
  };

  const hasPermission = useCallback(
    (permission: IAMPermission): boolean => {
      if (!user) return false;
      if (user.role === 'SUPER_ADMIN') return true;
      return user.permissions.includes(permission);
    },
    [user]
  );

  const clearError = () => setError(null);

  return (
    <IAMAuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        error,
        zeroTrustMetrics,
        login,
        logout,
        changePassword,
        hasPermission,
        clearError,
        apiFetch,
        refreshZeroTrustMetrics,
        runXPrizePipelineTest,
      }}
    >
      {children}
    </IAMAuthContext.Provider>
  );
};

export const useIAMAuth = () => {
  const context = useContext(IAMAuthContext);
  if (!context) {
    throw new Error('useIAMAuth must be used within an IAMAuthProvider');
  }
  return context;
};
