import { Link } from 'react-router-dom';
import './BookCard.css';

export default function BookCard({ book, action, bookId }) {
  const id = bookId || book._id;

  return (
    <div className="book-card">
      <Link to={`/book/${id}`} className="book-card-link">
        <div className="book-cover">
          {book.coverImage ? (
            <img src={book.coverImage} alt={book.title} />
          ) : (
            <div className="book-cover-placeholder">{book.title?.[0] || '?'}</div>
          )}
        </div>
        <div className="book-info">
          <h4>{book.title}</h4>
          <p className="book-author">{book.authors?.join(', ') || 'Unknown author'}</p>
          {book.genres?.length > 0 && (
            <div className="book-tags">
              {book.genres.slice(0, 2).map((g) => (
                <span key={g} className="book-tag">{g}</span>
              ))}
            </div>
          )}
        </div>
      </Link>
      {action && <div className="book-action">{action}</div>}
    </div>
  );
}