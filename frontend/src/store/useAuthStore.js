import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// API base URL
const API_BASE = '/api/v1';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Active role for role-switching UI (passenger | driver | admin)
      activeRole: 'passenger',

      // ─── Actions ─────────────────────────────────────────────────────────────

      setRole: (role) => set({ activeRole: role }),

      clearError: () => set({ error: null }),

      /**
       * Login: POST /api/v1/auth/login
       * Stores JWT token in state (persisted to localStorage via zustand/persist)
       */
      login: async ({ email, phone, password, role }) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, phone, password, role }),
          });
          const data = await res.json();

          if (!res.ok || !data.success) {
            set({ isLoading: false, error: data.message || 'Login failed' });
            return { success: false, message: data.message || 'Login failed' };
          }

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            activeRole: data.user.role || role || 'passenger',
            isLoading: false,
            error: null,
          });
          return { success: true, user: data.user };
        } catch (err) {
          const message = 'Network error. Make sure backend is running.';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      /**
       * Register: POST /api/v1/auth/register
       */
      register: async ({ name, email, phone, password, role }) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, password, role }),
          });
          const data = await res.json();

          if (!res.ok || !data.success) {
            set({ isLoading: false, error: data.message || 'Registration failed' });
            return { success: false, message: data.message || 'Registration failed' };
          }

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            activeRole: data.user.role || role || 'passenger',
            isLoading: false,
            error: null,
          });
          return { success: true, user: data.user };
        } catch (err) {
          const message = 'Network error. Make sure backend is running.';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      /**
       * Logout: clears all auth state
       */
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          activeRole: 'passenger',
          error: null,
        });
      },

      /**
       * Update wallet balance locally after transaction
       */
      updateWalletBalance: (amount) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, walletBalance: (state.user.walletBalance || 0) + amount }
            : null,
        })),

      /**
       * Get auth headers for API calls
       */
      getAuthHeaders: () => {
        const token = get().token;
        return token
          ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
          : { 'Content-Type': 'application/json' };
      },
    }),
    {
      name: 'sharecab-auth', // localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        activeRole: state.activeRole,
      }),
    }
  )
);
