'use client';

import { Bell, Search, HelpCircle, User, Check, AlertCircle, MessageSquare, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface NotificationItem {
  id: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export default function Header() {
  const [displayName, setDisplayName] = useState('Thầy/Cô');
  const [school, setSchool] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    let channel: any;

    async function initUserAndNotifications() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('displayName, school')
        .eq('id', user.id)
        .single();
      if (profile?.displayName) setDisplayName(profile.displayName);
      if (profile?.school) setSchool(profile.school);

      // 2. Fetch initial notifications
      const { data: notifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false })
        .limit(10);

      if (notifs) {
        setNotifications(
          notifs.map((n: any) => ({
            id: n.id,
            title: n.title,
            content: n.content,
            isRead: n.isRead || n.is_read || false,
            createdAt: n.createdAt || n.created_at,
          }))
        );
        setUnreadCount(notifs.filter((n: any) => !(n.isRead || n.is_read)).length);
      }

      // 3. Setup Supabase Realtime Subscription safely
      try {
        const channelName = `header-announcements-${user.id}-${Date.now()}`;
        channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'announcements' },
            (payload) => {
              const newAnnouncement = payload.new;
              if (newAnnouncement) {
                toast.custom(
                  (t) => (
                    <div
                      className={`${
                        t.visible ? 'animate-enter' : 'animate-leave'
                      } max-w-md w-full bg-surface-container-lowest shadow-2xl rounded-2xl pointer-events-auto flex p-4 ring-1 ring-black ring-opacity-5 border-l-4 border-secondary`}
                    >
                      <div className="flex-1 w-0">
                        <div className="flex items-start">
                          <div className="shrink-0 pt-0.5">
                            <MessageSquare className="h-6 w-6 text-secondary" />
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-xs font-heading font-bold text-on-surface">
                              Thông báo mới!
                            </p>
                            <p className="text-xs font-sans text-on-surface-variant font-medium mt-1">
                              {newAnnouncement.title}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
                  { duration: 4000 }
                );

                // Add to notifications list
                const newNotifItem: NotificationItem = {
                  id: newAnnouncement.id || String(Date.now()),
                  title: newAnnouncement.title,
                  content: newAnnouncement.content?.slice(0, 80) || '',
                  isRead: false,
                  createdAt: newAnnouncement.created_at || new Date().toISOString(),
                };
                setNotifications((prev) => [newNotifItem, ...prev]);
                setUnreadCount((c) => c + 1);
              }
            }
          )
          .subscribe();
      } catch (subErr) {
        console.warn('Realtime subscription skipped:', subErr);
      }
    }

    initUserAndNotifications();

    // Click outside listener for notifications dropdown
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('notifications')
        .update({ isRead: true })
        .eq('userId', user.id);
    }
    toast.success('Đã đánh dấu tất cả là đã đọc');
  };

  return (
    <header className="w-full h-20 bg-surface/90 backdrop-blur-md flex justify-between items-center px-8 z-20 sticky top-0 border-b border-outline-variant/30">
      {/* Search Bar */}
      <div className="relative w-full max-w-md hidden md:block">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input
          type="text"
          placeholder="Tìm lớp học, học sinh..."
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border-2 border-outline-variant/40 bg-surface-container-lowest focus:border-primary focus:ring-0 outline-none transition-colors font-sans text-sm text-on-surface placeholder:text-on-surface-variant shadow-xs"
        />
      </div>

      {/* Actions & Profile */}
      <div className="flex items-center gap-4 ml-auto relative" ref={dropdownRef}>
        {/* Bell Button */}
        <button
          type="button"
          onClick={() => setShowNotifications(!showNotifications)}
          aria-label="Thông báo"
          className="relative p-2.5 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Bell className="w-5 h-5 hover:text-primary transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-destructive text-on-destructive text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-surface animate-scale-in">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notifications Popover */}
        {showNotifications && (
          <div className="absolute right-0 top-14 w-80 sm:w-96 bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/30 p-4 z-50 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm text-on-surface">Thông báo</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-primary-container text-on-primary-container text-[11px] font-bold rounded-full">
                    {unreadCount} mới
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  Đọc tất cả
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-on-surface-variant text-xs font-sans">
                  Không có thông báo mới nào
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-2xl transition-colors ${
                      notif.isRead
                        ? 'bg-surface-container-low/40 text-on-surface-variant'
                        : 'bg-primary-container/20 text-on-surface font-semibold border-l-2 border-primary'
                    }`}
                  >
                    <p className="text-xs font-heading font-bold">{notif.title}</p>
                    <p className="text-[11px] font-sans text-on-surface-variant line-clamp-2 mt-0.5">
                      {notif.content}
                    </p>
                    <span className="text-[10px] text-on-surface-variant/70 mt-1 block">
                      {new Date(notif.createdAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          aria-label="Trợ giúp"
          className="p-2.5 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors hover:scale-105 active:scale-95 hidden sm:block"
        >
          <HelpCircle className="w-5 h-5 hover:text-primary transition-colors" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30 cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-heading font-bold text-base shadow-xs border-2 border-primary/20">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block text-left">
            <p className="font-heading font-bold text-sm text-on-surface leading-tight">
              {displayName}
            </p>
            <p className="font-sans text-[11px] text-on-surface-variant font-medium">
              {school ? `Trường ${school}` : 'Giáo viên chủ nhiệm'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
