import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProfileMenu.css';

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
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
          <div className="profile-divider" />
          <button className="profile-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}