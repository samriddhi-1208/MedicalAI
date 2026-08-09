import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, FileText, Pill, AlertTriangle, Sparkles, ChevronRight } from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { Link } from 'react-router-dom';

export const NotificationDropdown = () => {
  const { notifications, markNotificationsRead } = useHealthData();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'report':
        return <FileText className="w-4 h-4 text-cyan-400" />;
      case 'medicine':
        return <Pill className="w-4 h-4 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-cyan-400 rounded-full ring-4 ring-slate-950 animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-panel bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-100 font-heading">Notifications</h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markNotificationsRead}
                className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                No notifications right now.
              </div>
            ) : (
              notifications.map((item) => (
                <Link
                  key={item.id}
                  to={item.link}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-start gap-3 p-3.5 hover:bg-slate-800/50 transition-colors ${
                    item.unread ? 'bg-cyan-500/5' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/60 shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-200 truncate">{item.title}</p>
                      <span className="text-[10px] text-slate-500">{item.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 self-center" />
                </Link>
              ))
            )}
          </div>

          <div className="p-2.5 bg-slate-950/60 border-t border-slate-800 text-center">
            <Link
              to="/app/dashboard"
              onClick={() => setIsOpen(false)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              View all activities
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
