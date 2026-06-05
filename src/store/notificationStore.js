import { create } from 'zustand';
import { notificationsApi } from '../lib/api';

let nextId = 1;

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  // ─── Actions ─────────────────────────────────────────────
  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const data = await notificationsApi.list();
      const list = Array.isArray(data) ? data : (data?.notifications || []);
      set({
        notifications: list,
        unreadCount: list.filter(n => !n.read && !n.unread === false).length, // Backend might return .read or .unread
        isLoading: false
      });
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      set({ isLoading: false });
    }
  },

  addNotification: (notification) => {
    const n = {
      id: `n_${Date.now()}_${nextId++}`,
      time: new Date().toISOString(),
      read: false,
      priority: 'info',
      ...notification,
    };
    set(state => ({
      notifications: [n, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markRead: async (id) => {
    try {
      await notificationsApi.markRead(id);
      set(state => {
        const notifications = state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        );
        return {
          notifications,
          unreadCount: notifications.filter(n => !n.read).length,
        };
      });
    } catch (err) {
      console.error(`Failed to mark notification ${id} as read:`, err);
    }
  },

  markAsRead: async (id) => {
    const { markRead } = get();
    await markRead(id);
  },

  markAllRead: async () => {
    try {
      await notificationsApi.markAllRead();
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  },

  dismiss: (id) => {
    // There is no DELETE endpoint in the standard notification client, so we dismiss it locally.
    set(state => {
      const n = state.notifications.find(x => x.id === id);
      const isUnread = n ? !n.read : false;
      return {
        notifications: state.notifications.filter(x => x.id !== id),
        unreadCount: isUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    });
  },

  dismissNotification: (id) => {
    const { dismiss } = get();
    dismiss(id);
  },

  clearAll: () => set({ notifications: [], unreadCount: 0 }),

  // ─── Grouping helper ─────────────────────────────────────
  getGrouped: () => {
    const { notifications } = get();
    const now = Date.now();
    const groups = { today: [], yesterday: [], earlier: [] };
    notifications.forEach(n => {
      const age = now - new Date(n.time).getTime();
      const hours = age / (1000 * 60 * 60);
      if (hours < 24) groups.today.push(n);
      else if (hours < 48) groups.yesterday.push(n);
      else groups.earlier.push(n);
    });
    return groups;
  },
}));

