import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../lib/api';
import { ROLES } from '../constants/permissions';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ─── State ─────────────────────────────────────────
      user: null,
      isAuthenticated: false,
      isLoading: false,
      mfaRequired: false,
      mfaVerified: false,
      authStatus: 'INITIALIZING', // INITIALIZING | AUTHENTICATED | UNAUTHENTICATED | MFA_REQUIRED | SESSION_EXPIRED
      lastActivity: null,

      // ─── Actions ───────────────────────────────────────
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await authApi.login({ email, password });
          
          if (res.mfaRequired) {
            localStorage.setItem('crm_temp_mfa_token', res.tempToken);
            set({
              user: res.user,
              isAuthenticated: false,
              isLoading: false,
              mfaRequired: true,
              mfaVerified: false,
              authStatus: 'MFA_REQUIRED',
            });
            return { success: true, mfaRequired: true };
          }

          localStorage.setItem('crm_access_token', res.accessToken);
          localStorage.setItem('crm_refresh_token', res.refreshToken);
          localStorage.removeItem('crm_temp_mfa_token');

          set({
            user: res.user,
            isAuthenticated: true,
            isLoading: false,
            mfaRequired: false,
            mfaVerified: true,
            authStatus: 'AUTHENTICATED',
            lastActivity: Date.now(),
          });
          return { success: true, user: res.user, mfaRequired: false };
        } catch (err) {
          set({
            isLoading: false,
            isAuthenticated: false,
            user: null,
            mfaRequired: false,
            mfaVerified: false,
            authStatus: 'UNAUTHENTICATED',
          });
          return {
            success: false,
            error: err.response?.data?.message || 'Invalid credentials. Please try again.',
          };
        }
      },

      verifyMfa: async (code) => {
        set({ isLoading: true });
        try {
          const tempToken = localStorage.getItem('crm_temp_mfa_token');
          if (!tempToken) {
            throw new Error('Temporary session token not found');
          }

          const res = await authApi.verifyMfa(code, tempToken);
          
          localStorage.setItem('crm_access_token', res.accessToken);
          localStorage.setItem('crm_refresh_token', res.refreshToken);
          localStorage.removeItem('crm_temp_mfa_token');

          set({
            user: res.user,
            isAuthenticated: true,
            isLoading: false,
            mfaRequired: false,
            mfaVerified: true,
            authStatus: 'AUTHENTICATED',
            lastActivity: Date.now(),
          });
          return { success: true, user: res.user };
        } catch (err) {
          set({ isLoading: false });
          return {
            success: false,
            error: err.response?.data?.message || err.message || 'MFA Verification failed.',
          };
        }
      },

      hydrateAuth: async () => {
        const accessToken = localStorage.getItem('crm_access_token');
        const tempToken = localStorage.getItem('crm_temp_mfa_token');

        if (tempToken && !accessToken) {
          set({
            authStatus: 'MFA_REQUIRED',
            mfaRequired: true,
            mfaVerified: false,
            isAuthenticated: false,
            user: null,
          });
          return;
        }

        if (!accessToken) {
          set({
            authStatus: 'UNAUTHENTICATED',
            isAuthenticated: false,
            user: null,
            mfaRequired: false,
            mfaVerified: false,
          });
          return;
        }

        try {
          const profile = await authApi.me();
          set({
            user: profile,
            isAuthenticated: true,
            mfaRequired: false,
            mfaVerified: profile.mfaVerified,
            authStatus: profile.mfaVerified ? 'AUTHENTICATED' : 'MFA_REQUIRED',
            lastActivity: Date.now(),
          });
        } catch {
          // Token might be expired, try refreshing
          const refreshToken = localStorage.getItem('crm_refresh_token');
          if (refreshToken) {
            try {
              const refreshRes = await authApi.refresh(refreshToken);
              localStorage.setItem('crm_access_token', refreshRes.accessToken);
              localStorage.setItem('crm_refresh_token', refreshRes.refreshToken);

              set({
                user: refreshRes.user,
                isAuthenticated: true,
                mfaRequired: false,
                mfaVerified: refreshRes.mfaVerified,
                authStatus: refreshRes.mfaVerified ? 'AUTHENTICATED' : 'MFA_REQUIRED',
                lastActivity: Date.now(),
              });
              return;
            } catch {
              // Refresh failed
            }
          }

          // Clean up on failure
          localStorage.removeItem('crm_access_token');
          localStorage.removeItem('crm_refresh_token');
          localStorage.removeItem('crm_temp_mfa_token');
          set({
            user: null,
            isAuthenticated: false,
            mfaRequired: false,
            mfaVerified: false,
            authStatus: 'UNAUTHENTICATED',
          });
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Ignore logout error
        }
        localStorage.removeItem('crm_access_token');
        localStorage.removeItem('crm_refresh_token');
        localStorage.removeItem('crm_temp_mfa_token');
        set({
          user: null,
          isAuthenticated: false,
          mfaRequired: false,
          mfaVerified: false,
          authStatus: 'UNAUTHENTICATED',
          lastActivity: null,
        });
      },

      updateActivity: () => set({ lastActivity: Date.now() }),

      updateProfile: async (data) => {
        set({ isLoading: true });
        try {
          const updatedUser = await authApi.updateProfile(data);
          set(state => ({
            user: state.user ? { ...state.user, ...updatedUser } : updatedUser,
            isLoading: false,
          }));
          return { success: true, user: updatedUser };
        } catch (err) {
          set({ isLoading: false });
          return {
            success: false,
            error: err.response?.data?.message || 'Failed to update profile.',
          };
        }
      },

      updateUserAvatar: async (avatarUrl) => {
        try {
          await authApi.updateProfile({ avatarUrl });
          set(state => ({
            user: state.user ? { ...state.user, avatarUrl } : null
          }));
        } catch (err) {
          console.error('Failed to update avatar on backend', err);
        }
      },

      // ─── Computed helpers ──────────────────────────────
      getUser: () => get().user,
      getRole: () => get().user?.role || ROLES.GUEST,
      getTenantId: () => get().user?.tenantId || null,
      isClientUser: () => get().user?.role === ROLES.CLIENT,
    }),
    {
      name: 'crm_auth_persistent',
      partialize: (state) => ({
        // We only persist minimal fields, actual credentials loaded via /me
        lastActivity: state.lastActivity,
      }),
    }
  )
);
