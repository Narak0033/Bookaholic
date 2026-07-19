import { useState } from 'react';
import StarRating from './StarRating';
import { likeReview, getComments, addComment, updateComment, deleteComment } from '../api/reviews';
import { useAuth } from '../context/AuthContext';
import './ReviewCard.css';

export default function ReviewCard({ review }) {
  const { user } = useAuth();
  const [revealed, setRevealed] = useState(!review.containsSpoilers);
  const [likes, setLikes] = useState(review.likes?.length || 0);
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const handleLike = async () => {
    try {
      const { liked: nowLiked, totalLikes } = await likeReview(review._id);
      setLiked(nowLiked);
      setLikes(totalLikes);
    } catch (err) {
      console.error('Failed to like review', err);
    }
  };

  const toggleComments = async () => {
    if (!showComments && comments === null) {
      const data = await getComments(review._id);
      setComments(data.comments || []);
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const { comment } = await addComment(review._id, commentText.trim());
    setComments((prev) => [...(prev || []), comment]);
    setCommentText('');
  };

  const startEdit = (comment) => {
    setEditingId(comment._id);
    setEditText(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = async (commentId) => {
    if (!editText.trim()) return;
    const { comment } = await updateComment(review._id, commentId, editText.trim());
    setComments((prev) => prev.map((c) => (c._id === commentId ? comment : c)));
    cancelEdit();
  };

  const handleDelete = async (commentId) => {
    const confirmed = window.confirm('Delete this comment?');
    if (!confirmed) return;
    await deleteComment(review._id, commentId);
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  };

  return (
    <div className="review-card">
      <div className="review-card-head">
        <StarRating value={review.rating} size={14} />
        <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
      </div>

      {review.content &&
        (revealed ? (
          <p className="review-content">{review.content}</p>
        ) : (
          <button className="review-reveal" onClick={() => setRevealed(true)}>
            contains spoilers — tap to reveal
          </button>
        ))}

      <div className="review-actions">
        <button className={`review-like${liked ? ' review-like-active' : ''}`} onClick={handleLike}>
          ♥ {likes}
        </button>
        <button className="review-comment-toggle" onClick={toggleComments}>
          comments
        </button>
      </div>

      {showComments && (
        <div className="review-comments">
          {comments?.map((c) => (
            <div key={c._id} className="review-comment-row">
              {editingId === c._id ? (
                <div className="review-comment-edit">
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    autoFocus
                  />
                  <button onClick={() => saveEdit(c._id)}>save</button>
                  <button onClick={cancelEdit} className="review-comment-cancel">cancel</button>
                </div>
              ) : (
                <>
                  <p className="review-comment">{c.content}</p>
                  {c.userId === user?._id && (
                    <div className="review-comment-actions">
                      <button onClick={() => startEdit(c)}>edit</button>
                      <button onClick={() => handleDelete(c._id)}>delete</button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
          <form onSubmit={handleAddComment} className="review-comment-form">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment…"
            />
            <button type="submit">post</button>
          </form>
        </div>
      )}
    </div>
  );
}