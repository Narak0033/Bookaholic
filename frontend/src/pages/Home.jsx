import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>
        welcome to
      </p>
      <h1 style={{ fontSize: 40, marginBottom: 12 }}>Bookaholic</h1>
      <p style={{ color: 'var(--text-dim)', marginBottom: 24 }}>Your shelf, your taste, your people.</p>

      {user ? (
        <Link to="/shelf" style={{ color: 'var(--gold)', fontWeight: 500 }}>
          Go to your shelf →
        </Link>
      ) : (
        <div style={{ display: 'flex', gap: 12 }}>
          <Link
            to="/login"
            style={{ padding: '10px 20px', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius)' }}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            style={{ padding: '10px 20px', background: 'var(--gold)', color: '#3A2A0C', borderRadius: 'var(--radius)', fontWeight: 500 }}
          >
            Create account
          </Link>
        </div>
      )}
    </div>
  );
}