import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../api/notify';
import './NotificationBell.css';

const LABELS = {
  new_follower: (d) => `${d.followerUsername || 'someone'} started following you`,
  review_comment: () => 'someone commented on your review',
  review_like: () => 'someone liked your review',
  message_like: () => 'someone liked your message',
  club_joined: (d) => `someone joined ${d.clubName || 'your club'}`,
  discussion_created: (d) => `new discussion: ${d.title || ''}`,
  goal_reminder: () => 'reading goal reminder',
  friend_finished_book: (d) => `${d.friendUsername || 'a friend'} finished ${d.bookTitle || 'a book'}`,
};

const describeNotification = (n) => {
  const fn = LABELS[n.type];
  return fn ? fn(n.data || {}) : 'new notification';
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  const loadUnread = () => {
    getUnreadCount()
      .then((data) => setUnread(data.count || 0))
      .catch((err) => console.error('Failed to load unread count', err));
  };

  useEffect(() => {
    loadUnread();
    const interval = setInterval(loadUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const openDropdown = async () => {
    const next = !open;
    setOpen(next);
    if (next && !loaded) {
      try {
        const data = await getNotifications();
        setNotifications(data.notifications || []);
        setLoaded(true);
      } catch (err) {
        console.error('Failed to load notifications', err);
      }
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  const handleNotificationClick = async (n) => {
    if (!n.read) {
      await markAsRead(n._id);
      setNotifications((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
      setUnread((prev) => Math.max(0, prev - 1));
    }
    setOpen(false);
  };

  return (
    <div className="notif-bell-wrap" ref={ref}>
      <button className="notif-bell" onClick={openDropdown} aria-label="Notifications">
        🔔
        {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-head">
            <h3>Notifications</h3>
            {unread > 0 && (
              <button className="notif-mark-all" onClick={handleMarkAllRead}>mark all read</button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <p className="shelf-empty">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  className={`notif-item${n.read ? '' : ' notif-item-unread'}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  {!n.read && <span className="notif-dot" />}
                  <div className="notif-item-body">
                    <p>{describeNotification(n)}</p>
                    <span className="notif-time">{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}