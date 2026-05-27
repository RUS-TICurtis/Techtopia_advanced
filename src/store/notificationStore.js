import { create } from 'zustand';

let nextId = 1;

const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'deal',
    priority: 'high',
    title: 'Deal Closed',
    message: 'CyberPulse Security — Full Security Operations Contract signed.',
    time: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read: false,
    link: 'pipeline',
    actor: 'System',
  },
  {
    id: 'n2',
    type: 'invoice',
    priority: 'critical',
    title: 'Invoice Overdue',
    message: 'INV-2026-004 for Roma Tech ($15,000) is now 25 days overdue.',
    time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
    link: 'billing',
    actor: 'Billing Engine',
  },
  {
    id: 'n3',
    type: 'task',
    priority: 'medium',
    title: 'Task Due Today',
    message: 'Send Cloud Migration Proposal to Alice Vance by end of day.',
    time: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    read: false,
    link: 'tasks',
    actor: 'Task Engine',
  },
  {
    id: 'n4',
    type: 'ai',
    priority: 'info',
    title: 'AI Insight Ready',
    message: 'Lead scoring update: 3 leads elevated to high-priority.',
    time: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    read: true,
    link: 'leads',
    actor: 'AI Engine',
  },
  {
    id: 'n5',
    type: 'mention',
    priority: 'medium',
    title: 'You were mentioned',
    message: 'Sarah Jenkins mentioned you in a note on BioGen Lab.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    read: true,
    link: 'contacts',
    actor: 'Sarah Jenkins',
  },
  {
    id: 'n6',
    type: 'contract',
    priority: 'high',
    title: 'Contract Awaiting Signature',
    message: 'BioGen Lab API License agreement sent — awaiting client signature.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: true,
    link: 'contracts',
    actor: 'DocuSign',
  },
];

export const useNotificationStore = create((set, get) => ({
  notifications: MOCK_NOTIFICATIONS,
  unreadCount: MOCK_NOTIFICATIONS.filter(n => !n.read).length,

  // ─── Actions ─────────────────────────────────────────────
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

  markRead: (id) => set(state => ({
    notifications: state.notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - (state.notifications.find(n => n.id === id)?.read ? 0 : 1)),
  })),

  markAllRead: () => set(state => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0,
  })),

  dismiss: (id) => set(state => {
    const n = state.notifications.find(x => x.id === id);
    return {
      notifications: state.notifications.filter(x => x.id !== id),
      unreadCount: n && !n.read ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
    };
  }),

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
