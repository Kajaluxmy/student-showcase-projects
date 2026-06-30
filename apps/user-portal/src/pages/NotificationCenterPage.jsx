import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';

export function NotificationCenterPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();

  return (
    <div className="max-w-2xl mx-auto space-y-6 mt-4">
      {/* Header Banner - Premium glassmorphic look */}
      <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 hover:translate-y-[-2px] transition-all duration-300 rounded-2xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group">
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-blue-500/5 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-blue-400 mt-1.5">
              Notifications
            </h1>
            <p className="text-zinc-500 text-xs max-w-md">
              Review recruiter views, candidate likes, and pipeline updates.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-center">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="detail-outline-btn inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold leading-none active:scale-[0.97]"
              >
                <CheckCheck className="h-3.5 w-3.5 shrink-0" />
                <span>Mark all read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="detail-gradient-btn-red inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold leading-none active:scale-[0.97]"
              >
                <Trash2 className="h-3.5 w-3.5 shrink-0" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-16 text-center text-zinc-500">
            <Bell className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
            <h3 className="font-bold text-zinc-350 text-sm">All caught up!</h3>
            <p className="text-xs text-zinc-550 mt-2 leading-relaxed">
              When recruiters follow your work, notifications will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-850/80">
            {notifications.map((item) => (
              <div 
                key={item.id} 
                className={`p-5 flex items-start gap-4 transition-all relative ${
                  item.is_read ? 'opacity-55' : 'bg-zinc-850/15 hover:bg-zinc-850/20'
                }`}
              >
                {/* Active Unread Indicator Dot */}
                {!item.is_read && (
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                )}

                {/* Sender Avatar */}
                {item.sender_avatar ? (
                  <img 
                    src={item.sender_avatar} 
                    alt="" 
                    className="rounded-full object-cover shrink-0 border border-zinc-800 bg-zinc-950" 
                    style={{ width: '40px', height: '40px', minWidth: '40px' }}
                  />
                ) : (
                  <div 
                    className="flex items-center justify-center rounded-full bg-zinc-950 text-zinc-300 text-sm font-bold shrink-0 border border-zinc-800"
                    style={{ width: '40px', height: '40px', minWidth: '40px' }}
                  >
                    {item.sender_name ? item.sender_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}

                {/* Message Body */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-xs font-bold text-zinc-200 leading-relaxed">
                      {item.message}
                    </p>
                    
                    {/* Mark single as read button */}
                    {!item.is_read && (
                      <button
                        onClick={() => markAsRead(item.id)}
                        className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-500 hover:text-blue-450 border border-zinc-850 hover:border-zinc-750 transition-colors shrink-0 active:scale-[0.95]"
                        title="Mark as read"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-semibold block">
                    {new Date(item.created_at).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
