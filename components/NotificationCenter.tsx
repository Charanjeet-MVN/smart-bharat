"use client";

import React, { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Check, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Megaphone,
  Inbox
} from "lucide-react";

export type NotificationType = 
  | "COMPLAINT_SUBMITTED" 
  | "COMPLAINT_ASSIGNED" 
  | "COMPLAINT_STATUS_UPDATED" 
  | "COMPLAINT_RESOLVED" 
  | "SYSTEM_ANNOUNCEMENT";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "COMPLAINT_RESOLVED",
    title: "Complaint Resolved",
    description: "Your complaint 'Pothole on Main Road' has been resolved by the Public Works Department.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    isRead: false,
  },
  {
    id: "2",
    type: "COMPLAINT_STATUS_UPDATED",
    title: "Status Updated",
    description: "Your complaint 'Broken Streetlight' is now IN PROGRESS.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isRead: false,
  },
  {
    id: "3",
    type: "SYSTEM_ANNOUNCEMENT",
    title: "New AI Features",
    description: "Check out the new AI duplicate detection feature when submitting complaints!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isRead: true,
  },
];

const getNotificationConfig = (type: NotificationType) => {
  switch (type) {
    case "COMPLAINT_SUBMITTED":
      return { icon: FileText, color: "text-blue-500", bgColor: "bg-blue-100" };
    case "COMPLAINT_ASSIGNED":
      return { icon: Clock, color: "text-amber-500", bgColor: "bg-amber-100" };
    case "COMPLAINT_STATUS_UPDATED":
      return { icon: AlertCircle, color: "text-indigo-500", bgColor: "bg-indigo-100" };
    case "COMPLAINT_RESOLVED":
      return { icon: CheckCircle2, color: "text-green-500", bgColor: "bg-green-100" };
    case "SYSTEM_ANNOUNCEMENT":
      return { icon: Megaphone, color: "text-purple-500", bgColor: "bg-purple-100" };
    default:
      return { icon: Bell, color: "text-slate-500", bgColor: "bg-slate-100" };
  }
};

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 origin-top-right"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <Inbox className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">All caught up!</p>
                  <p className="text-sm text-slate-400 mt-1">
                    You have no new notifications right now.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-slate-50">
                  <AnimatePresence initial={false}>
                    {notifications.map((notification) => {
                      const config = getNotificationConfig(notification.type);
                      const Icon = config.icon;
                      let timeAgo = "Just now";
                      try {
                        timeAgo = formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true });
                      } catch(e) {
                        // ignore
                      }

                      return (
                        <motion.div
                          key={notification.id}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`p-4 flex gap-3 hover:bg-slate-50 transition-colors group relative ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                        >
                          {!notification.isRead && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                          )}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${config.bgColor}`}>
                            <Icon className={`w-5 h-5 ${config.color}`} />
                          </div>
                          <div className="flex-1 min-w-0 pr-6">
                            <p className={`text-sm mb-0.5 truncate pr-2 ${notification.isRead ? 'text-slate-700 font-medium' : 'text-slate-900 font-bold'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {notification.description}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                              {timeAgo}
                            </p>
                          </div>
                          
                          {/* Actions */}
                          <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                            {!notification.isRead && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete notification"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
            
            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
                <button className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
