import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getClubById,
  joinClub,
  leaveClub,
  getDiscussions,
  createDiscussion,
  getMessages,
  sendMessage,
} from '../api/social';
import { useAuth } from '../context/AuthContext';
import './ClubDetail.css';

export default function ClubDetail() {
  const { clubId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [club, setClub] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [activeDiscussion, setActiveDiscussion] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');

  const isMember = club?.members?.includes(user?._id);

  const load = async () => {
    setLoading(true);
    try {
      const [clubData, discData] = await Promise.all([
        getClubById(clubId),
        getDiscussions(clubId),
      ]);
      setClub(clubData.club);
      setDiscussions(discData.discussions || []);
    } catch (err) {
      console.error('Failed to load club', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [clubId]);

  const handleJoin = async () => {
    await joinClub(clubId);
    load();
  };

  const handleLeave = async () => {
    await leaveClub(clubId);
    load();
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const { discussion } = await createDiscussion(clubId, newTitle.trim());
    setDiscussions((prev) => [discussion, ...prev]);
    setNewTitle('');
    setShowNewDiscussion(false);
  };

  const openDiscussion = async (discussion) => {
    setActiveDiscussion(discussion);
    const data = await getMessages(discussion._id);
    setMessages(data.messages || []);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    const { message } = await sendMessage(activeDiscussion._id, messageText.trim());
    setMessages((prev) => [...prev, message]);
    setMessageText('');
  };

  if (loading) return <p className="shelf-empty">Loading…</p>;
  if (!club) return <p className="shelf-empty">Club not found.</p>;

  if (activeDiscussion) {
    return (
      <div className="club-detail">
        <button className="book-detail-back" onClick={() => setActiveDiscussion(null)}>
          ← back to {club.name}
        </button>
        <h2>{activeDiscussion.title}</h2>

        <div className="discussion-messages">
          {messages.length === 0 ? (
            <p className="shelf-empty">No messages yet — say something.</p>
          ) : (
            messages.map((m) => (
              <div key={m._id} className="discussion-message">
                <p>{m.content}</p>
                <span>{new Date(m.createdAt).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>

        {isMember && (
          <form onSubmit={handleSendMessage} className="discussion-message-form">
            <input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Join the discussion…"
            />
            <button type="submit">send</button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="club-detail">
      <button className="book-detail-back" onClick={() => navigate('/clubs')}>← all clubs</button>

      <div className="club-detail-header">
        <div>
          <h1>{club.name}</h1>
          <p className="club-detail-desc">{club.description}</p>
          <p className="club-detail-members">{club.members?.length || 0} members</p>
        </div>
        {isMember ? (
          <button className="manual-cancel" onClick={handleLeave}>leave club</button>
        ) : (
          <button className="shelf-add-btn" onClick={handleJoin}>join club</button>
        )}
      </div>

      <div className="club-detail-discussions">
        <div className="shelf-header">
          <h2>Discussions</h2>
          {isMember && (
            <button className="manual-toggle" onClick={() => setShowNewDiscussion(!showNewDiscussion)}>
              + new discussion
            </button>
          )}
        </div>

        {showNewDiscussion && (
          <form onSubmit={handleCreateDiscussion} className="new-discussion-form">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What do you want to talk about?"
              autoFocus
            />
            <button type="submit">post</button>
          </form>
        )}

        {discussions.length === 0 ? (
          <p className="shelf-empty">No discussions yet.</p>
        ) : (
          <div className="discussions-list">
            {discussions.map((d) => (
              <button key={d._id} className="discussion-item" onClick={() => openDiscussion(d)}>
                <span>{d.title}</span>
                <span className="discussion-count">{d.messageCount} replies</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}