import { useState, useEffect } from 'react';
import { getClubs } from '../api/social';
import ClubCard from '../components/ClubCard';
import CreateClubForm from '../components/CreateClubForm';
import './Clubs.css';

export default function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const loadClubs = async () => {
    setLoading(true);
    try {
      const data = await getClubs();
      setClubs(data.clubs || []);
    } catch (err) {
      console.error('Failed to load clubs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClubs();
  }, []);

  const handleCreated = (club) => {
    setClubs((prev) => [club, ...prev]);
    setShowCreate(false);
  };

  return (
    <div className="clubs-page">
      <div className="shelf-header">
        <div>
          <p className="shelf-eyebrow">your community</p>
          <h1>Clubs</h1>
        </div>
        <button className="shelf-add-btn" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'close' : '+ start a club'}
        </button>
      </div>

      {showCreate && <CreateClubForm onCreated={handleCreated} onCancel={() => setShowCreate(false)} />}

      {loading ? (
        <p className="shelf-empty">Loading…</p>
      ) : clubs.length === 0 ? (
        <p className="shelf-empty">No clubs yet — start the first one.</p>
      ) : (
        <div className="clubs-grid">
          {clubs.map((club) => (
            <ClubCard key={club._id} club={club} />
          ))}
        </div>
      )}
    </div>
  );
}