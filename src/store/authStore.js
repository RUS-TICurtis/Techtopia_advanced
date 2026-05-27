import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../lib/api';
import { ROLES } from '../constants/permissions';

export const DEMO_USERS = [
  {
    id: 'u1',
    email: 'admin@techtopia.crm',
    password: 'password123',
    name: 'Curtis Tungsten',
    role: ROLES.SUPER_ADMIN,
    roleLabel: 'Super Admin',
    avatar: 'CT',
    department: 'Executive',
    tenantId: 'tenant_techtopia',
  },
  {
    id: 'u2',
    email: 'sales@techtopia.crm',
    password: 'password123',
    name: 'Sarah Jenkins',
    role: ROLES.SALES,
    roleLabel: 'Sales Executive',
    avatar: 'SJ',
    department: 'Sales',
    tenantId: 'tenant_techtopia',
  },
  {
    id: 'u3',
    email: 'support@techtopia.crm',
    password: 'password123',
    name: 'Sam Porter',
    role: ROLES.SUPPORT,
    roleLabel: 'Support Agent',
    avatar: 'SP',
    department: 'Support',
    tenantId: 'tenant_techtopia',
  },
  {
    id: 'u4',
    email: 'finance@techtopia.crm',
    password: 'password123',
    name: 'Faye Morgan',
    role: ROLES.FINANCE,
    roleLabel: 'Finance Manager',
    avatar: 'FM',
    department: 'Finance',
    tenantId: 'tenant_techtopia',
  },
  {
    id: 'u5',
    email: 'pm@techtopia.crm',
    password: 'password123',
    name: 'Patrick Mills',
    role: ROLES.PROJECT_MANAGER,
    roleLabel: 'Project Manager',
    avatar: 'PM',
    department: 'Delivery',
    tenantId: 'tenant_techtopia',
  },
  {
    id: 'u6',
    email: 'client@acme.com',
    password: 'password123',
    name: 'Alex Client',
    role: ROLES.CLIENT,
    roleLabel: 'Client',
    avatar: 'AC',
    department: 'External',
    tenantId: 'tenant_techtopia',
    clientCompany: 'ACME Corp',
  },
];

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
            error: err.response?.data?.message || 'Invalid credentials. Select a demo role below.',
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
        } catch (err) {
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

      // Switch role (demo only — for testing permission views)
      switchDemoRole: (role) => set(state => ({
        user: state.user ? { ...state.user, role } : null
      })),

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
