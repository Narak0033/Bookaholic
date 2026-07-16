import './StarRating.css';

export default function StarRating({ value, onChange, size = 18 }) {
  const interactive = !!onChange;
  return (
    <div className="star-rating" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`star${n <= value ? ' star-filled' : ''}`}
          onClick={interactive ? () => onChange(n) : undefined}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          ★
        </span>
      ))}
    </div>
  );
}