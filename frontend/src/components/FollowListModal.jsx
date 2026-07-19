import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFollowers, getFollowing } from '../api/social';
import { getUsersByIds } from '../api/users';
import FollowButton from './FollowButton';
import './FollowListModal.css';

export default function FollowListModal({ userId, mode, onClose }) {
  const [userIds, setUserIds] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = mode === 'followers' ? await getFollowers(userId) : await getFollowing(userId);
        const ids = mode === 'followers' ? data.followers : data.following;
        setUserIds(ids || []);
        if (ids?.length > 0) {
          const { users } = await getUsersByIds(ids);
          setUserMap(Object.fromEntries(users.map((u) => [u._id, u])));
        }
      } catch (err) {
        console.error('Failed to load follow list', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, mode]);

  return (
    <div className="follow-modal-overlay" onClick={onClose}>
      <div className="follow-modal" onClick={(e) => e.stopPropagation()}>
        <div className="follow-modal-head">
          <h3>{mode === 'followers' ? 'Followers' : 'Following'}</h3>
          <button className="follow-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="follow-modal-list">
          {loading ? (
            <p className="shelf-empty">Loading…</p>
          ) : userIds.length === 0 ? (
            <p className="shelf-empty">
              {mode === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
            </p>
          ) : (
            userIds.map((id) => {
              const u = userMap[id];
              return (
                <div key={id} className="follow-modal-row">
                  <div className="message-avatar">{(u?.username?.[0] || '?').toUpperCase()}</div>
                  <span className="message-username">{u?.username || 'unknown reader'}</span>
                  <FollowButton userId={id} small />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}