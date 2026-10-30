import axios from 'axios';

// Storage keys for authentication data
export const TOKEN_KEY = 'jwt_auth_token';
export const USER_KEY = 'jwt_auth_user';

/**
 * Storage helpers for managing JWT and user session
 */
export const storage = {
  getToken: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (e) {
      console.warn('Unable to access localStorage for token:', e);
      return null;
    }
  },
  setToken: (token) => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      }
    } catch (e) {
      console.error('Failed to store token in localStorage:', e);
    }
  },
  removeToken: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error('Failed to remove token from localStorage:', e);
    }
  },
  getUser: () => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('Failed to parse user from localStorage:', e);
      return null;
    }
  },
  setUser: (user) => {
    try {
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    } catch (e) {
      console.error('Failed to store user in localStorage:', e);
    }
  },
  removeUser: () => {
    try {
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Failed to remove user from localStorage:', e);
    }
  },
  clearAuth: () => {
    storage.removeToken();
    storage.removeUser();
  }
};

/**
 * Configured Axios Instance
 * Dynamic baseURL configured from environment variables
 */
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

/**
 * Request Interceptor:
 * Dynamically injects Authorization: Bearer <token> into outgoing HTTP requests
 */
axiosClient.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      // Step 1: Ensure Authorization header with Bearer token scheme
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor:
 * Intercepts incoming responses and centrally handles 401 Unauthorized
 * (token expiration, invalid signatures, revoked credentials).
 */
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      // Step 6: Handle token expiration / unauthorized access cleanly
      storage.clearAuth();

      // Dispatch global window event so React AuthContext can update state seamlessly
      const errorMsg = error.response?.data?.message || 'Your session has expired. Please log in again.';
      window.dispatchEvent(
        new CustomEvent('auth:session_expired', {
          detail: {
            message: errorMsg,
            code: error.response?.data?.code || 'SESSION_EXPIRED'
          }
        })
      );
    }

    return Promise.reject(error);
  }
);

export default axiosClient;

