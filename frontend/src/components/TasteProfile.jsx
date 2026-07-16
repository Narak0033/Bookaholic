export default function TasteProfile({ preferences }) {
  if (!preferences || preferences.totalBooksRead === 0) return null;

  const { topGenres = [], topTropes = [], topAuthors = [] } = preferences;

  return (
    <div className="taste-profile">
      <p className="taste-eyebrow">based on {preferences.totalBooksRead} books you've finished</p>
      <div className="taste-rows">
        {topGenres.length > 0 && (
          <div className="taste-row">
            <span className="taste-label">genres</span>
            {topGenres.map((g) => (
              <span key={g} className="taste-tag">{g}</span>
            ))}
          </div>
        )}
        {topTropes.length > 0 && (
          <div className="taste-row">
            <span className="taste-label">tropes</span>
            {topTropes.map((t) => (
              <span key={t} className="taste-tag">{t}</span>
            ))}
          </div>
        )}
        {topAuthors.length > 0 && (
          <div className="taste-row">
            <span className="taste-label">authors</span>
            {topAuthors.map((a) => (
              <span key={a} className="taste-tag">{a}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}