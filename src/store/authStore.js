import { create } from 'zustand';
import { login as loginApi, getMe } from '../api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('zlm_access_token'),
  isAuthenticated: !!localStorage.getItem('zlm_access_token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await loginApi(email, password);
      localStorage.setItem('zlm_access_token', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('zlm_refresh_token', data.refreshToken);
      }
      set({ user: data.user, token: data.accessToken, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (err) {
      const error = err.response?.data?.message || err.response?.data?.error || 'Login failed';
      set({ error, loading: false });
      return { success: false, error };
    }
  },

  logout: () => {
    localStorage.removeItem('zlm_access_token');
    localStorage.removeItem('zlm_refresh_token');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  fetchMe: async () => {
    try {
      const { data } = await getMe();
      set({ user: data.user || data, isAuthenticated: true });
    } catch {
      // token invalid
      localStorage.removeItem('zlm_access_token');
      set({ user: null, isAuthenticated: false, token: null });
    }
  },

  setUser: (user) => set({ user }),
  clearError: () => set({ error: null }),
}));
