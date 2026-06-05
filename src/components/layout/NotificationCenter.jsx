import React, { useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useNotificationStore } from '../../store/notificationStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Bell, AlertCircle, Sparkles, TrendingUp } from 'lucide-react';
import './NotificationCenter.css';

export default function NotificationCenter() {
  const { notificationCenterOpen, setNotificationCenterOpen } = useUIStore();
  const { notifications, unreadCount, markAllRead, markAsRead, dismissNotification, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    if (notificationCenterOpen) {
      fetchNotifications();
    }
  }, [notificationCenterOpen, fetchNotifications]);


  const getIcon = (type) => {
    switch (type) {
      case 'deal': return <TrendingUp size={16} className="text-[#a6e22e]" />;
      case 'system': return <AlertCircle size={16} className="text-[#ff0055]" />;
      case 'ai': return <Sparkles size={16} className="text-[#00e5ff]" />;
      default: return <Bell size={16} className="text-gray-400" />;
    }
  };

  return (
    <AnimatePresence>
      {notificationCenterOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setNotificationCenterOpen(false)}
            className="fixed inset-0 bg-black/45 backdrop-blur-[2px] z-[990]"
          />

          {/* Slider Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-[#0f1629] border-l border-gray-800 shadow-2xl z-[995] flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-800/80 bg-[#0a0f1e] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-[#00e5ff]" />
                <h3 className="text-white font-bold font-display text-base">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30 text-xs px-2 py-0.5 rounded-full font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead} 
                    className="text-xs text-[#00e5ff] hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <button 
                  onClick={() => setNotificationCenterOpen(false)}
                  className="text-gray-400 hover:text-white p-1 hover:bg-gray-800/60 rounded-lg transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-20 text-gray-500 flex flex-col items-center">
                  <Bell size={40} className="text-gray-700 mb-3" />
                  <p className="text-sm font-medium">All caught up!</p>
                  <p className="text-xs text-gray-600 mt-1">No recent notifications to show.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`notification-item bg-[#12141a]/60 border border-gray-800/60 p-4 rounded-xl flex gap-3 relative transition-all duration-200 ${n.unread ? 'unread-active' : ''}`}
                  >
                    <div className="p-2 bg-gray-900/60 rounded-lg h-max border border-gray-800/50">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <h4 className="text-white text-sm font-semibold truncate">{n.title}</h4>
                      <p className="text-gray-400 text-xs mt-1 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-gray-600 mt-2 block font-mono">{n.time}</span>
                    </div>

                    {/* Actions */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      {n.unread && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="text-gray-500 hover:text-[#21FA90] transition-colors"
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => dismissNotification(n.id)}
                        className="text-gray-500 hover:text-[#FF47DA] transition-colors"
                        title="Dismiss"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
