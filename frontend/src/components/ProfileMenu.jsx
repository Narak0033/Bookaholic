import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFollowers, getFollowing } from '../api/social';
import FollowListModal from './FollowListModal';
import './ProfileMenu.css';

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [modalMode, setModalMode] = useState(null);
  const ref = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (!open || !user?._id) return;
    Promise.all([getFollowers(user._id), getFollowing(user._id)])
      .then(([followersData, followingData]) => {
        setCounts({
          followers: followersData.total || 0,
          following: followingData.total || 0,
        });
      })
      .catch((err) => console.error('Failed to load follow counts', err));
  }, [open, user]);

  if (!user) return null;

  const initial = user.username?.[0]?.toUpperCase() || '?';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="profile-menu" ref={ref}>
      <button className="profile-avatar" onClick={() => setOpen(!open)}>
        {initial}
      </button>
      {open && (
        <div className="profile-dropdown">
          <p className="profile-username">{user.username}</p>
          <p className="profile-email">{user.email}</p>

          <div className="profile-stats">
            <button className="profile-stat" onClick={() => { setModalMode('followers'); setOpen(false); }}>
              <span className="profile-stat-num">{counts.followers}</span>
              <span className="profile-stat-label">followers</span>
            </button>
            <button className="profile-stat" onClick={() => { setModalMode('following'); setOpen(false); }}>
              <span className="profile-stat-num">{counts.following}</span>
              <span className="profile-stat-label">following</span>
            </button>
          </div>

          <div className="profile-divider" />
          <button className="profile-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      )}

      {modalMode && (
        <FollowListModal userId={user._id} mode={modalMode} onClose={() => setModalMode(null)} />
      )}
    </div>
  );
}