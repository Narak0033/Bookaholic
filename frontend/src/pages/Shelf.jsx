import { useState, useEffect, useCallback } from 'react';
import { searchBooks } from '../api/books';
import BookCard from '../components/BookCard';
import StatusTabs from '../components/StatusTabs';
import ManualBookForm from '../components/ManualBookForm';
import './Shelf.css';
import { getShelf, addToShelf, updateShelfEntry, removeFromShelf } from '../api/tracking';

export default function Shelf() {
  const [activeStatus, setActiveStatus] = useState('reading');
  const [shelf, setShelf] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  const loadShelf = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getShelf(activeStatus);
      setShelf(data.shelf || []);
    } catch (err) {
      console.error('Failed to load shelf', err);
    } finally {
      setLoading(false);
    }
  }, [activeStatus]);

  useEffect(() => {
    loadShelf();
  }, [loadShelf]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const data = await searchBooks(query);
      setResults(data.books || []);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async (book) => {
    try {
      await addToShelf(
        book._id,
        {
          title: book.title,
          authors: book.authors,
          genres: book.genres,
          tropes: book.tropes || [],
          pageCount: book.pageCount,
          coverImage: book.coverImage,
        },
        'want_to_read'
      );
      setSearchOpen(false);
      setQuery('');
      setResults([]);
      if (activeStatus === 'want_to_read') loadShelf();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add this book');
    }
  };

  const handleStatusChange = async (bookId, newStatus) => {
    try {
      await updateShelfEntry(bookId, { status: newStatus });
      loadShelf();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleRemove = async (bookId, title) => {
  const confirmed = window.confirm(`Remove "${title}" from your shelf?`);
    if (!confirmed) return;
    try {
      await removeFromShelf(bookId);
      loadShelf();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not remove this book');
    }
  };

  const handleManualAdd = async (book) => {
    try {
      await addToShelf(
        book._id,
        {
          title: book.title,
          authors: book.authors,
          genres: book.genres,
          tropes: book.tropes || [],
          pageCount: book.pageCount,
          coverImage: book.coverImage,
        },
        'want_to_read'
      );
      setShowManualForm(false);
      setSearchOpen(false);
      if (activeStatus === 'want_to_read') loadShelf();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add this book to your shelf');
    }
  };

  return (
    <div className="shelf-page">
      <div className="shelf-header">
        <div>
          <p className="shelf-eyebrow">your library</p>
          <h1>Shelf</h1>
        </div>
        <button className="shelf-add-btn" onClick={() => setSearchOpen(!searchOpen)}>
          {searchOpen ? 'close' : '+ add a book'}
        </button>
      </div>

      {searchOpen && (
        <div className="shelf-search">
          <form onSubmit={handleSearch} className="shelf-search-form">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or author…"
              autoFocus
            />
            <button type="submit" disabled={searching}>
              {searching ? 'searching…' : 'search'}
            </button>
          </form>

          {results.length > 0 && (
            <div className="shelf-results">
              {results.map((book) => (
                <BookCard
                  key={book._id}
                  book={book}
                  action={
                    <button className="book-add-btn" onClick={() => handleAdd(book)}>
                      add
                    </button>
                  }
                />
              ))}
            </div>
          )}

          {!showManualForm ? (
            <button className="manual-toggle" onClick={() => setShowManualForm(true)}>
              + can't find it? add manually
            </button>
          ) : (
            <ManualBookForm
              onAdded={handleManualAdd}
              onCancel={() => setShowManualForm(false)}
            />
          )}
        </div>
      )}

      <StatusTabs active={activeStatus} onChange={setActiveStatus} />

      {loading ? (
        <p className="shelf-empty">Loading…</p>
      ) : shelf.length === 0 ? (
        <p className="shelf-empty">Nothing here yet. Add a book to get started.</p>
      ) : (
        <div className="shelf-list">
          {shelf.map((entry) => (
            <BookCard
              key={entry._id}
              book={entry.bookSnapshot}
              bookId={entry.bookId}
              action={
                <div className="shelf-card-actions">
                  <select
                    className="shelf-status-select"
                    value={entry.status}
                    onChange={(e) => handleStatusChange(entry.bookId, e.target.value)}
                  >
                    <option value="want_to_read">want to read</option>
                    <option value="reading">reading</option>
                    <option value="finished">finished</option>
                  </select>
                  <button
                    className="shelf-remove-btn"
                    onClick={() => handleRemove(entry.bookId, entry.bookSnapshot.title)}
                    aria-label={`Remove ${entry.bookSnapshot.title} from shelf`}
                  >
                    remove
                  </button>
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}