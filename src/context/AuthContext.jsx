import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { storage } from '../services/axiosClient';
import authService from '../services/authService';

const AuthContext = createContext(null);

/**
 * Validates whether a JWT token has expired based on its 'exp' claim.
 * @param {string} token 
 * @returns {boolean}
 */
export function isTokenExpired(token) {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return false;
    // decoded.exp is in seconds, Date.now() is in milliseconds
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    console.warn('Failed to decode token for expiration check:', error);
    return true;
  }
}

/**
 * Decodes the JWT payload safely
 * @param {string} token
 * @returns {object|null}
 */
export function decodeToken(token) {
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => storage.getToken());
  const [user, setUser] = useState(() => storage.getUser());
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState(null);

  /**
   * Log out user, purge local storage, and reset state
   */
  const logout = useCallback((reasonMessage = null) => {
    storage.clearAuth();
    setToken(null);
    setUser(null);
    if (reasonMessage) {
      setSessionExpiredMessage(reasonMessage);
    }
  }, []);

  /**
   * Log in user with credentials
   */
  const login = async (email, password) => {
    try {
      setSessionExpiredMessage(null);
      const data = await authService.login({ email, password });
      
      // Persist to storage
      storage.setToken(data.token);
      storage.setUser(data.user);

      // Update state
      setToken(data.token);
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Unable to log in. Please check your credentials.';
      return { success: false, error: message };
    }
  };

  /**
   * Register new user
   */
  const register = async (userData) => {
    try {
      setSessionExpiredMessage(null);
      const data = await authService.register(userData);

      // Persist to storage
      storage.setToken(data.token);
      storage.setUser(data.user);

      // Update state
      setToken(data.token);
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Registration failed. Please check the details entered.';
      return { success: false, error: message };
    }
  };

  /**
   * Manually inject a test token (useful for testing 401 expiration simulation)
   */
  const setTestToken = (newToken) => {
    storage.setToken(newToken);
    setToken(newToken);
  };

  /**
   * Step 6: Test automatic session persistence & token verification on boot
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = storage.getToken();

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      // Check if token expired on client side
      if (isTokenExpired(storedToken)) {
        console.warn('[AUTH] Stored token has expired. Clearing session.');
        logout('Your previous session has expired. Please log in again.');
        setIsLoading(false);
        return;
      }

      try {
        // Hydrate and verify token with backend /api/auth/me
        const data = await authService.getCurrentUser();
        setUser(data.user);
        storage.setUser(data.user);
      } catch (error) {
        console.error('[AUTH] Failed to verify existing session:', error);
        logout('Session could not be verified. Please log in.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [logout]);

  /**
   * Listen for Axios response interceptor 401 event
   */
  useEffect(() => {
    const handleSessionExpired = (event) => {
      const msg = event.detail?.message || 'Your session has expired. Please log in again.';
      logout(msg);
    };

    window.addEventListener('auth:session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session_expired', handleSessionExpired);
    };
  }, [logout]);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    sessionExpiredMessage,
    setSessionExpiredMessage,
    login,
    register,
    logout,
    setTestToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to consume the AuthContext
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
