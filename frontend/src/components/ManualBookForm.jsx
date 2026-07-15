import { useState } from 'react';
import { createManualBook } from '../api/books';
import './ManualBookForm.css';
import ImageDropzone from './ImageDropzone';

export default function ManualBookForm({ onAdded, onCancel }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genres, setGenres] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { book } = await createManualBook({
        title: title.trim(),
        authors: author.trim() ? [author.trim()] : [],
        genres: genres.trim() ? genres.split(',').map((g) => g.trim()) : [],
        pageCount: pageCount ? parseInt(pageCount, 10) : 0,
        coverImage: coverImage.trim(),
      });
      onAdded(book);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="manual-form" onSubmit={handleSubmit}>
      <p className="manual-form-note">
        Can't find it on Google Books? Add it yourself — only the title is required.
      </p>

      {error && <div className="auth-error">{error}</div>}

      <div className="manual-field">
        <label>Title *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Book title" required />
      </div>

      <div className="manual-row">
        <div className="manual-field">
          <label>Author</label>
          <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author name" />
        </div>
        <div className="manual-field manual-field-small">
          <label>Pages</label>
          <input
            type="number"
            value={pageCount}
            onChange={(e) => setPageCount(e.target.value)}
            placeholder="0"
            min="0"
          />
        </div>
      </div>

      <div className="manual-field">
        <label>Genres <span className="manual-hint">(comma separated)</span></label>
        <input value={genres} onChange={(e) => setGenres(e.target.value)} placeholder="Dark Romance, Enemies to Lovers" />
      </div>

      <div className="manual-field">
        <label>Cover image <span className="manual-hint">(optional)</span></label>
        <ImageDropzone value={coverImage} onChange={setCoverImage} />
      </div>

      <div className="manual-actions">
        <button type="button" className="manual-cancel" onClick={onCancel}>cancel</button>
        <button type="submit" className="manual-submit" disabled={loading}>
          {loading ? 'saving…' : 'add book'}
        </button>
      </div>
    </form>
  );
}