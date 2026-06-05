import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../lib/api';
import { ROLES } from '../constants/permissions';

function mapBackendRoleToFrontend(backendRole) {
  if (!backendRole) return 'guest';
  const roleLower = backendRole.toLowerCase();
  if (roleLower.includes('super_admin') || roleLower.includes('super admin') || roleLower === 'administrator') return 'super_admin';
  if (roleLower.includes('platform_owner') || roleLower.includes('platform owner')) return 'platform_owner';
  if (roleLower.includes('tenant_admin') || roleLower.includes('tenant admin')) return 'tenant_admin';
  if (roleLower === 'client') return 'client';
  if (roleLower === 'support') return 'support';
  if (roleLower === 'sales' || roleLower.includes('sales')) return 'sales';
  if (roleLower === 'developer') return 'developer';
  if (roleLower === 'ai_operator' || roleLower.includes('ai operator') || roleLower.includes('ai_operator')) return 'ai_operator';
  if (roleLower === 'hr') return 'hr';
  if (roleLower === 'finance') return 'finance';
  if (roleLower === 'project_manager' || roleLower.includes('project manager') || roleLower.includes('project_manager')) return 'project_manager';
  if (roleLower === 'operations') return 'operations';
  return backendRole;
}

const mapUser = (u) => {
  if (!u) return null;
  return {
    ...u,
    name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || u.email,
    role: u.role || (u.roles && u.roles[0] ? mapBackendRoleToFrontend(u.roles[0]) : 'guest'),
    roleLabel: u.roleLabel || (u.roles && u.roles[0] ? u.roles[0] : 'Guest'),
    avatar: u.avatar || (u.firstName ? u.firstName.charAt(0) + (u.lastName ? u.lastName.charAt(0) : '') : 'CT'),
    phone: u.phoneNumber || u.phone,
    avatarUrl: u.profileImageUrl || u.avatarUrl,
    location: u.location || '',
  };
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ─── State ─────────────────────────────────────────
      user: null,
      isAuthenticated: false,
      isLoading: false,
      authStatus: 'INITIALIZING', // INITIALIZING | AUTHENTICATED | UNAUTHENTICATED | SESSION_EXPIRED
      lastActivity: null,

      // ─── Actions ───────────────────────────────────────
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await authApi.login({ email, password });
          
          localStorage.setItem('crm_access_token', res.accessToken);
          localStorage.setItem('crm_refresh_token', res.refreshToken);

          const mappedUser = mapUser(res.user);

          set({
            user: mappedUser,
            isAuthenticated: true,
            isLoading: false,
            authStatus: 'AUTHENTICATED',
            lastActivity: Date.now(),
          });
          return { success: true, user: mappedUser };
        } catch (err) {
          set({
            isLoading: false,
            isAuthenticated: false,
            user: null,
            authStatus: 'UNAUTHENTICATED',
          });
          return {
            success: false,
            error: err.response?.data?.message || 'Invalid credentials. Please try again.',
          };
        }
      },

      hydrateAuth: async () => {
        const accessToken = localStorage.getItem('crm_access_token');

        if (!accessToken) {
          set({
            authStatus: 'UNAUTHENTICATED',
            isAuthenticated: false,
            user: null,
          });
          return;
        }

        try {
          const profile = await authApi.me();
          const mappedUser = mapUser(profile);
          set({
            user: mappedUser,
            isAuthenticated: true,
            authStatus: 'AUTHENTICATED',
            lastActivity: Date.now(),
          });
        } catch {
          // Token might be expired, try refreshing
          const refreshToken = localStorage.getItem('crm_refresh_token');
          if (refreshToken) {
            try {
              const refreshRes = await authApi.refresh(accessToken, refreshToken);
              localStorage.setItem('crm_access_token', refreshRes.accessToken);
              localStorage.setItem('crm_refresh_token', refreshRes.refreshToken);

              const mappedUser = mapUser(refreshRes.user);

              set({
                user: mappedUser,
                isAuthenticated: true,
                authStatus: 'AUTHENTICATED',
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
          set({
            user: null,
            isAuthenticated: false,
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
        set({
          user: null,
          isAuthenticated: false,
          authStatus: 'UNAUTHENTICATED',
          lastActivity: null,
        });
      },

      updateActivity: () => set({ lastActivity: Date.now() }),

      updateProfile: async (data) => {
        set({ isLoading: true });
        try {
          const updatedUser = await authApi.updateProfile(data);
          const mappedUser = mapUser(updatedUser);
          set(state => ({
            user: state.user ? { ...state.user, ...mappedUser } : mappedUser,
            isLoading: false,
          }));
          return { success: true, user: mappedUser };
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
