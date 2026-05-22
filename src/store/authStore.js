import { create } from 'zustand';

// Dummy data for auto-fill testing
export const DUMMY_USERS = [
  { id: 1, email: 'admin@techtopia.crm', password: 'password123', name: 'Curtis Admin', role: 'System Administrator' },
  { id: 2, email: 'sales@techtopia.crm', password: 'password123', name: 'Sarah Sales', role: 'Sales Executive' },
  { id: 3, email: 'support@techtopia.crm', password: 'password123', name: 'Sam Support', role: 'Support Agent' },
];

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  login: (email, password) => {
    const user = DUMMY_USERS.find(u => u.email === email && u.password === password);
    if (user) {
      set({ user, isAuthenticated: true });
      return true;
    }
    return false;
  },
  logout: () => set({ user: null, isAuthenticated: false }),
}));
