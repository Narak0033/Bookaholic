import { Link } from 'react-router-dom';
import './ClubCard.css';

export default function ClubCard({ club }) {
  return (
    <Link to={`/clubs/${club._id}`} className="club-card">
      <div className="club-card-cover">
        {club.coverImage ? (
          <img src={club.coverImage} alt={club.name} />
        ) : (
          <span>{club.name?.[0] || '?'}</span>
        )}
      </div>
      <div className="club-card-body">
        <h3>{club.name}</h3>
        <p className="club-card-desc">{club.description}</p>
        <div className="club-card-meta">
          <span>{club.members?.length || 0} member{club.members?.length === 1 ? '' : 's'}</span>
          {club.tags?.slice(0, 2).map((t) => (
            <span key={t} className="book-tag">{t}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}