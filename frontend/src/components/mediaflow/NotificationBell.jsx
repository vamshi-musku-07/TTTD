import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api, ApiError } from '../../lib/api';

const TYPE_ICONS = {
  event_created: 'event',
  complaint_submitted: 'report_problem',
};

export default function NotificationBell() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!accessToken) return;
    try {
      const data = await api.getNotifications(accessToken);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // silent fail for polling
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    setLoading(true);
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleToggle = () => {
    setOpen((prev) => !prev);
    if (!open) fetchNotifications();
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await api.markNotificationRead(notification.id, accessToken);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // still navigate on failure
    }

    setOpen(false);
    if (notification.link) navigate(notification.link);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead(accessToken);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      if (err instanceof ApiError) {
        // ignore
      }
    }
  };

  return (
    <div className="mf-notifications" ref={panelRef}>
      <button
        type="button"
        className="mf-icon-btn mf-notifications__trigger relative"
        onClick={handleToggle}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="mf-notifications__badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="mf-notifications__panel">
          <div className="mf-notifications__header">
            <h3 className="mf-text-card-title text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button type="button" className="mf-notifications__mark-all" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="mf-notifications__list">
            {loading && notifications.length === 0 ? (
              <p className="mf-notifications__empty">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="mf-notifications__empty">No notifications yet</p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={`mf-notifications__item ${notification.read ? '' : 'mf-notifications__item--unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <span
                    className={`mf-notifications__icon mf-notifications__icon--${notification.type}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {TYPE_ICONS[notification.type] || 'notifications'}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block text-sm font-semibold text-on-surface">
                      {notification.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-on-surface-variant line-clamp-2">
                      {notification.message}
                    </span>
                    <span className="mt-1 block text-[10px] uppercase tracking-wide text-on-surface-variant">
                      {notification.time}
                    </span>
                  </span>
                  {!notification.read && (
                    <span className="mf-notifications__dot" aria-hidden="true" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
