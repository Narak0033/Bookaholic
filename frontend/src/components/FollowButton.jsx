import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { followUser, unfollowUser, checkFollowing } from '../api/social';
import './FollowButton.css';

export default function FollowButton({ userId, small }) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId || userId === user?._id) return;
    let active = true;
    checkFollowing(userId)
      .then((data) => {
        if (active) setFollowing(data.isFollowing);
      })
      .finally(() => active && setReady(true));
    return () => { active = false; };
  }, [userId, user]);

  if (!userId || userId === user?._id) return null;
  if (!ready) return null;

  const toggle = async () => {
    setLoading(true);
    try {
      if (following) {
        await unfollowUser(userId);
        setFollowing(false);
      } else {
        await followUser(userId);
        setFollowing(true);
      }
    } catch (err) {
      console.error('Follow toggle failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`follow-btn${small ? ' follow-btn-small' : ''}${following ? ' follow-btn-active' : ''}`}
      onClick={toggle}
      disabled={loading}
    >
      {following ? 'following' : 'follow'}
    </button>
  );
}