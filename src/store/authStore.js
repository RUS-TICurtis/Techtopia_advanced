import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ROLES } from '../lib/permissions';

// Expanded user roster with proper roles
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
    department: null,
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
      sessions: [],
      lastActivity: null,

      // ─── Actions ───────────────────────────────────────
      login: (email, password) => {
        set({ isLoading: true });
        // Simulate API call delay
        return new Promise((resolve) => {
          setTimeout(() => {
            const found = DEMO_USERS.find(
              u => u.email === email && u.password === password
            );
            if (found) {
              const { password: _, ...safeUser } = found;
              set({
                user: safeUser,
                isAuthenticated: true,
                isLoading: false,
                lastActivity: Date.now(),
              });
              resolve({ success: true, user: safeUser });
            } else {
              set({ isLoading: false });
              resolve({ success: false, error: 'Invalid credentials' });
            }
          }, 600);
        });
      },

      logout: () => set({
        user: null,
        isAuthenticated: false,
        mfaRequired: false,
        mfaVerified: false,
        sessions: [],
        lastActivity: null,
      }),

      updateProfile: (updates) => set(state => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),

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
      name: 'crm_auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastActivity: state.lastActivity,
      }),
    }
  )
);
