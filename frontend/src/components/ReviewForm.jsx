import { useState } from 'react';
import StarRating from './StarRating';
import { createReview } from '../api/reviews';
import './ReviewForm.css';

export default function ReviewForm({ book, bookId, onCreated }) {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [spoilers, setSpoilers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError('Pick a star rating first');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { review } = await createReview(
        bookId,
        { title: book.title, authors: book.authors, coverImage: book.coverImage },
        rating,
        content,
        spoilers
      );
      setRating(0);
      setContent('');
      setSpoilers(false);
      onCreated(review);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not post your review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <p className="review-form-label">your rating</p>
      <StarRating value={rating} onChange={setRating} size={22} />

      {error && <div className="auth-error">{error}</div>}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What did you think?"
        rows={4}
      />

      <label className="review-spoiler-check">
        <input type="checkbox" checked={spoilers} onChange={(e) => setSpoilers(e.target.checked)} />
        contains spoilers
      </label>

      <button className="review-submit" type="submit" disabled={loading}>
        {loading ? 'posting…' : 'post review'}
      </button>
    </form>
  );
}