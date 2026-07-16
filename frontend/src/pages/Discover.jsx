import { useState, useEffect } from 'react';
import { getRecommendations, getPreferences } from '../api/recommend';
import { addToShelf } from '../api/tracking';
import DiscoverCard from '../components/DiscoverCard';
import TasteProfile from '../components/TasteProfile';
import './Discover.css';

export default function Discover() {
  const [recommendations, setRecommendations] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [addedIds, setAddedIds] = useState(new Set());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [recData, prefData] = await Promise.all([
          getRecommendations(),
          getPreferences(),
        ]);
        setRecommendations(recData.recommendations || []);
        setMessage(recData.message || '');
        setPreferences(prefData);
      } catch (err) {
        console.error('Failed to load recommendations', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
      setAddedIds((prev) => new Set(prev).add(book._id));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add this book');
    }
  };

  return (
    <div className="discover-page">
      <p className="shelf-eyebrow">picked for you</p>
      <h1>Discover</h1>

      <TasteProfile preferences={preferences} />

      {message && (
        <p className="discover-message">{message}</p>
      )}

      {loading ? (
        <p className="shelf-empty">Finding books you'll love…</p>
      ) : recommendations.length === 0 ? (
        <p className="shelf-empty">Nothing to recommend yet — add a few books to your shelf first.</p>
      ) : (
        <div className="discover-grid">
          {recommendations.map(({ book, reasons }) =>
            addedIds.has(book._id) ? (
              <div key={book._id} className="discover-added">
                <span>✓ {book.title} added to your shelf</span>
              </div>
            ) : (
              <DiscoverCard
                key={book._id}
                book={book}
                reasons={reasons}
                onAdd={handleAdd}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}