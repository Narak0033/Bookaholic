import { useState } from 'react';
import StarRating from './StarRating';
import { likeReview, getComments, addComment } from '../api/reviews';
import './ReviewCard.css';

export default function ReviewCard({ review }) {
  const [revealed, setRevealed] = useState(!review.containsSpoilers);
  const [likes, setLikes] = useState(review.likes?.length || 0);
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(null);
  const [commentText, setCommentText] = useState('');

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
            <p key={c._id} className="review-comment">{c.content}</p>
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