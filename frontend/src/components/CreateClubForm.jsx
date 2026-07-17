import { useState } from 'react';
import { createClub } from '../api/social';
import './CreateClubForm.css';

export default function CreateClubForm({ onCreated, onCancel }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { club } = await createClub({
        name: name.trim(),
        description: description.trim(),
        tags: tags.trim() ? tags.split(',').map((t) => t.trim()) : [],
      });
      onCreated(club);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create the club');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="create-club-form" onSubmit={handleSubmit}>
      {error && <div className="auth-error">{error}</div>}
      <div className="manual-field">
        <label>Club name *</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dark Romance Addicts" required />
      </div>
      <div className="manual-field">
        <label>Description</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this club about?" />
      </div>
      <div className="manual-field">
        <label>Tags <span className="manual-hint">(comma separated)</span></label>
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="dark romance, enemies to lovers" />
      </div>
      <div className="manual-actions">
        <button type="button" className="manual-cancel" onClick={onCancel}>cancel</button>
        <button type="submit" className="manual-submit" disabled={loading}>
          {loading ? 'creating…' : 'create club'}
        </button>
      </div>
    </form>
  );
}