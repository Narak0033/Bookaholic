import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookById } from '../api/books';
import { getBookReviews } from '../api/reviews';
import { addToShelf } from '../api/tracking';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import ReviewForm from '../components/ReviewForm';
import ReviewCard from '../components/ReviewCard';
import './BookDetail.css';

export default function BookDetail() {
  const { bookId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [bookData, reviewData] = await Promise.all([
          getBookById(bookId),
          getBookReviews(bookId),
        ]);
        setBook(bookData.book);
        setReviews(reviewData.reviews || []);
        setAvgRating(reviewData.avgRating || 0);
        setTotal(reviewData.total || 0);
      } catch (err) {
        console.error('Failed to load book', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookId]);

  const handleAdd = async () => {
    try {
      await addToShelf(bookId, {
        title: book.title,
        authors: book.authors,
        genres: book.genres,
        tropes: book.tropes || [],
        pageCount: book.pageCount,
        coverImage: book.coverImage,
      });
      setAdded(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add this book');
    }
  };

  const handleReviewCreated = (review) => {
    setReviews((prev) => [review, ...prev]);
    setTotal((prev) => prev + 1);
  };

  if (loading) return <p className="shelf-empty">Loading…</p>;
  if (!book) return <p className="shelf-empty">Book not found.</p>;

  return (
    <div className="book-detail">
      <button className="book-detail-back" onClick={() => navigate(-1)}>← back</button>

      <div className="book-detail-header">
        <div className="book-detail-cover">
          {book.coverImage ? (
            <img src={book.coverImage} alt={book.title} />
          ) : (
            <div className="book-detail-cover-placeholder">{book.title?.[0] || '?'}</div>
          )}
        </div>
        <div className="book-detail-info">
          <h1>{book.title}</h1>
          <p className="book-detail-author">{book.authors?.join(', ') || 'Unknown author'}</p>

          <div className="book-detail-rating">
            <StarRating value={Math.round(avgRating)} size={18} />
            <span>{avgRating || '—'} · {total} review{total === 1 ? '' : 's'}</span>
          </div>

          {(book.genres?.length > 0 || book.tropes?.length > 0) && (
            <div className="book-tags">
              {book.genres?.map((g) => <span key={g} className="book-tag">{g}</span>)}
              {book.tropes?.map((t) => <span key={t} className="book-tag">{t}</span>)}
            </div>
          )}

          {book.description && <p className="book-detail-desc">{book.description}</p>}

          <button className="shelf-add-btn" onClick={handleAdd} disabled={added}>
            {added ? '✓ added to shelf' : '+ add to shelf'}
          </button>
        </div>
      </div>

      <div className="book-detail-reviews">
        <h2>Reviews</h2>

        {user && <ReviewForm book={book} bookId={bookId} onCreated={handleReviewCreated} />}

        {reviews.length === 0 ? (
          <p className="shelf-empty">No reviews yet — be the first.</p>
        ) : (
          reviews.map((r) => <ReviewCard key={r._id} review={r} />)
        )}
      </div>
    </div>
  );
}