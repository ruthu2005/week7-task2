import axiosClient from './axiosClient';

/**
 * Authentication and User API Service
 */
export const authService = {
  /**
   * Register a new user
   * @param {Object} userData - { name, email, password }
   * @returns {Promise<{ token: string, user: Object, message: string }>}
   */
  register: async (userData) => {
    const response = await axiosClient.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Log in user with credentials
   * @param {Object} credentials - { email, password }
   * @returns {Promise<{ token: string, user: Object, message: string }>}
   */
  login: async (credentials) => {
    const response = await axiosClient.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Fetch current authenticated user's profile
   * @returns {Promise<{ user: Object }>}
   */
  getCurrentUser: async () => {
    const response = await axiosClient.get('/auth/me');
    return response.data;
  },

  /**
   * Fetch protected dashboard metrics
   * @returns {Promise<Object>}
   */
  getDashboardMetrics: async () => {
    const response = await axiosClient.get('/dashboard/metrics');
    return response.data;
  },

  /**
   * Fetch protected user activities
   * @returns {Promise<Object>}
   */
  getDashboardActivities: async () => {
    const response = await axiosClient.get('/dashboard/activities');
    return response.data;
  },

  /**
   * Simulate expired token for testing 401 handling
   * @returns {Promise<{ token: string }>}
   */
  simulateExpiredToken: async () => {
    const response = await axiosClient.post('/auth/simulate-expired-token');
    return response.data;
  }
};

export default authService;
