import { create } from 'zustand';
import { authAPI } from '../api';

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  init: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return set({ loading: false });
    try {
      const { data } = await authAPI.me();
      set({ user: data.user, loading: false });
    } catch {
      localStorage.clear();
      set({ loading: false });
    }
  },

  login: async (credentials) => {
    const { data } = await authAPI.login(credentials);
    localStorage.setItem('accessToken', data.accessToken);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    set({ user: data.user });
  },

  register: async (credentials) => {
    const { data } = await authAPI.register(credentials);
    localStorage.setItem('accessToken', data.accessToken);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    set({ user: data.user });
  },

  logout: async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.clear();
    set({ user: null });
  },
}));
