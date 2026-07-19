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
  updateMessage,
  deleteMessage,
} from '../api/social';
import { getUsersByIds } from '../api/users';
import { useAuth } from '../context/AuthContext';
import FollowButton from '../components/FollowButton';
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
  const [userMap, setUserMap] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');

  const isMember = club?.members?.includes(user?._id);

  const resolveUsernames = async (ids) => {
    const unknown = [...new Set(ids)].filter((id) => id && !userMap[id]);
    if (unknown.length === 0) return;
    try {
      const { users } = await getUsersByIds(unknown);
      setUserMap((prev) => {
        const next = { ...prev };
        users.forEach((u) => { next[u._id] = u.username; });
        return next;
      });
    } catch (err) {
      console.error('Failed to resolve usernames', err);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const [clubData, discData] = await Promise.all([
        getClubById(clubId),
        getDiscussions(clubId),
      ]);
      setClub(clubData.club);
      setDiscussions(discData.discussions || []);
      resolveUsernames(discData.discussions.map((d) => d.createdBy));
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
    resolveUsernames(data.messages.map((m) => m.userId));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    const { message } = await sendMessage(activeDiscussion._id, messageText.trim(), replyingTo?._id || null);
    setMessages((prev) => [...prev, message]);
    setMessageText('');
    setReplyingTo(null);
  };

  const startEditMessage = (m) => {
    setEditingMessageId(m._id);
    setEditText(m.content);
  };

  const cancelEditMessage = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  const saveEditMessage = async (messageId) => {
    if (!editText.trim()) return;
    const { message } = await updateMessage(messageId, editText.trim());
    setMessages((prev) => prev.map((m) => (m._id === messageId ? message : m)));
    cancelEditMessage();
  };

  const handleDeleteMessage = async (messageId) => {
    const confirmed = window.confirm('Delete this message?');
    if (!confirmed) return;
    await deleteMessage(messageId);
    setMessages((prev) => prev.filter((m) => m._id !== messageId && m.parentMessageId !== messageId));
  };

  const nameFor = (id) => userMap[id] || 'unknown reader';
  const initialFor = (id) => (userMap[id]?.[0] || '?').toUpperCase();

  const buildThreads = (msgs) => {
    const byId = Object.fromEntries(msgs.map((m) => [m._id, m]));

    const rootOf = (m) => {
      let current = m;
      while (current.parentMessageId && byId[current.parentMessageId]) {
        current = byId[current.parentMessageId];
      }
      return current._id;
    };

    const roots = msgs.filter((m) => !m.parentMessageId);
    const repliesFor = (rootId) =>
      msgs.filter((m) => m.parentMessageId && rootOf(m) === rootId && m._id !== rootId)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const directParent = (m) => (m.parentMessageId ? byId[m.parentMessageId] : null);

    return { roots, repliesFor, directParent };
  };

  const isReply2Root = (m, parent, roots) => roots.some((r) => r._id === parent._id);

  if (loading) return <p className="shelf-empty">Loading…</p>;
  if (!club) return <p className="shelf-empty">Club not found.</p>;

  if (activeDiscussion) {
    return (
      <div className="club-detail">
        <button className="book-detail-back" onClick={() => setActiveDiscussion(null)}>
          ← back to {club.name}
        </button>
        <h2>{activeDiscussion.title}</h2>
        <p className="discussion-started-by">
          started by {nameFor(activeDiscussion.createdBy)}
        </p>

        <div className="discussion-messages">
          {messages.length === 0 ? (
            <p className="shelf-empty">No messages yet — say something.</p>
          ) : (
            (() => {
              const { roots, repliesFor, directParent } = buildThreads(messages);

              const renderMessage = (m, isReply, parent) => {
                const isMine = m.userId === user?._id;
                const isReplyToReply = isReply && parent && !isReply2Root(m, parent, roots);

                if (editingMessageId === m._id) {
                  return (
                    <div className="review-comment-edit">
                      <input value={editText} onChange={(e) => setEditText(e.target.value)} autoFocus />
                      <button onClick={() => saveEditMessage(m._id)}>save</button>
                      <button className="review-comment-cancel" onClick={cancelEditMessage}>cancel</button>
                    </div>
                  );
                }

                return (
                  <>
                    <div className="discussion-message-author">
                      <span className="message-avatar">{initialFor(m.userId)}</span>
                      <span className="message-username">{nameFor(m.userId)}</span>
                      <FollowButton userId={m.userId} small />
                    </div>
                    {isReply && parent && (
                      <p className="reply-target">replying to {nameFor(parent.userId)}</p>
                    )}
                    <p>{m.content}</p>
                    <div className="message-footer">
                      <span className="message-time">{new Date(m.createdAt).toLocaleString()}</span>
                      {isMember && (
                        <button className="message-reply-btn" onClick={() => setReplyingTo(m)}>reply</button>
                      )}
                      {isMine && (
                        <>
                          <button className="message-reply-btn" onClick={() => startEditMessage(m)}>edit</button>
                          <button className="message-reply-btn message-delete-btn" onClick={() => handleDeleteMessage(m._id)}>delete</button>
                        </>
                      )}
                    </div>
                  </>
                );
              };

              return roots.map((m) => (
                <div key={m._id} className="message-thread">
                  <div className="discussion-message">{renderMessage(m, false, null)}</div>

                  {repliesFor(m._id).length > 0 && (
                    <div className="message-replies">
                      {repliesFor(m._id).map((r) => (
                        <div key={r._id} className="discussion-message discussion-message-reply">
                          {renderMessage(r, true, directParent(r))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ));
            })()
          )}
        </div>

        {isMember && (
          <form onSubmit={handleSendMessage} className="discussion-message-form">
            <div className="message-form-wrap">
              {replyingTo && (
                <div className="replying-banner">
                  replying to {nameFor(replyingTo.userId)}
                  <button type="button" onClick={() => setReplyingTo(null)}>cancel</button>
                </div>
              )}
              <div className="message-form-row">
                <input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={replyingTo ? 'Write a reply…' : 'Join the discussion…'}
                />
                <button type="submit">send</button>
              </div>
            </div>
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
                <span>
                  {d.title}
                  <span className="discussion-by"> · by {nameFor(d.createdBy)}</span>
                </span>
                <span className="discussion-count">{d.messageCount} replies</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}