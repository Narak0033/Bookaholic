import ReasonPill from './ReasonPill';
import './DiscoverCard.css';

export default function DiscoverCard({ book, score, reasons, onAdd }) {
  return (
    <div className="discover-card">
      <div className="discover-cover">
        {book.coverImage ? (
          <img src={book.coverImage} alt={book.title} />
        ) : (
          <div className="discover-cover-placeholder">{book.title?.[0] || '?'}</div>
        )}
      </div>
      <div className="discover-info">
        <h3>{book.title}</h3>
        <p className="discover-author">{book.authors?.join(', ') || 'Unknown author'}</p>

        {reasons?.length > 0 && (
          <div className="discover-reasons">
            {reasons.map((r, i) => (
              <ReasonPill key={i} text={r} />
            ))}
          </div>
        )}

        <button className="discover-add-btn" onClick={() => onAdd(book)}>
          + add to shelf
        </button>
      </div>
    </div>
  );
}