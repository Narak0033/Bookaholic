import { useState } from 'react';
import { updateShelfEntry } from '../api/tracking';
import './EditDatesModal.css';

const toInputDate = (d) => (d ? new Date(d).toISOString().split('T')[0] : '');

export default function EditDatesModal({ entry, onClose, onSaved }) {
  const [startDate, setStartDate] = useState(toInputDate(entry.startDate));
  const [endDate, setEndDate] = useState(toInputDate(entry.endDate));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {};
      if (startDate) payload.startDate = startDate;
      if (endDate) payload.endDate = endDate;
      const { entry: updated } = await updateShelfEntry(entry.bookId, payload);
      onSaved(updated);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update dates');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="follow-modal-overlay" onClick={onClose}>
      <div className="follow-modal edit-dates-modal" onClick={(e) => e.stopPropagation()}>
        <div className="follow-modal-head">
          <h3>Edit dates — {entry.bookSnapshot.title}</h3>
          <button className="follow-modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSave} className="edit-dates-form">
          <p className="edit-dates-note">
            Read this before joining Bookaholic? Set the real dates here.
          </p>

          {error && <div className="auth-error">{error}</div>}

          <div className="manual-field">
            <label>Started reading</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>

          <div className="manual-field">
            <label>Finished reading</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          <div className="manual-actions">
            <button type="button" className="manual-cancel" onClick={onClose}>cancel</button>
            <button type="submit" className="manual-submit" disabled={loading}>
              {loading ? 'saving…' : 'save dates'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}