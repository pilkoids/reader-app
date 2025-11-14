import api from './api';
import { User, ApiResponse } from '../types';

export const authService = {
  /**
   * Get list of available mock users
   */
  getMockUsers: async (): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>>('/auth/mock-users');
    return response.data.data || [];
  },

  /**
   * Login as a mock user
   */
  mockLogin: async (userId: string): Promise<User> => {
    const response = await api.post<ApiResponse<User>>('/auth/mock-login', { userId });
    const user = response.data.data;

    if (user) {
      // Store user ID in localStorage
      localStorage.setItem('mockUserId', user.id);
      localStorage.setItem('currentUser', JSON.stringify(user));
    }

    return user!;
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('mockUserId');
    localStorage.removeItem('currentUser');
  },

  /**
   * Get current logged-in user
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');
      return response.data.data || null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Get current user from localStorage (no API call)
   */
  getCurrentUserLocal: (): User | null => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Check if user is logged in
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('mockUserId');
  }
};
