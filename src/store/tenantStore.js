import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useTenantStore = create(
  persist(
    (set, get) => ({
      currentTenant: {
        id: 'tenant-1',
        name: 'Techtopia Corp',
        domain: 'techtopia.crm.io',
        logo: '⚡',
        plan: 'Enterprise',
        settings: {
          primaryColor: '#38BDF8', // cyan
          allowSelfSignOn: true,
          requireMfa: true,
          aiFeaturesEnabled: true,
          retentionDays: 90,
        },
      },
      availableTenants: [
        { id: 'tenant-1', name: 'Techtopia Corp', domain: 'techtopia.crm.io', plan: 'Enterprise' },
        { id: 'tenant-2', name: 'Innovate Ltd', domain: 'innovate.crm.io', plan: 'Professional' },
        { id: 'tenant-3', name: 'CyberSec Global', domain: 'cybersec.crm.io', plan: 'Enterprise' },
      ],
      isLoading: false,
      error: null,

      setTenant: (tenant) => set({ currentTenant: tenant }),
      
      switchTenant: async (tenantId) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API fetch delay
          await new Promise((resolve) => setTimeout(resolve, 500));
          const tenant = get().availableTenants.find(t => t.id === tenantId);
          if (tenant) {
            set({
              currentTenant: {
                ...tenant,
                logo: tenantId === 'tenant-2' ? '💡' : tenantId === 'tenant-3' ? '🛡️' : '⚡',
                settings: {
                  primaryColor: tenantId === 'tenant-2' ? '#10B981' : tenantId === 'tenant-3' ? '#EF4444' : '#38BDF8',
                  allowSelfSignOn: true,
                  requireMfa: tenantId !== 'tenant-2',
                  aiFeaturesEnabled: true,
                  retentionDays: tenantId === 'tenant-2' ? 30 : 90,
                }
              },
              isLoading: false
            });
            return true;
          } else {
            throw new Error('Tenant not found');
          }
        } catch (err) {
          set({ error: err.message, isLoading: false });
          return false;
        }
      },

      updateTenantSettings: (settings) => {
        set((state) => ({
          currentTenant: {
            ...state.currentTenant,
            settings: {
              ...state.currentTenant.settings,
              ...settings,
            },
          },
        }));
      },
    }),
    {
      name: 'techtopia-tenant-storage',
    }
  )
);
