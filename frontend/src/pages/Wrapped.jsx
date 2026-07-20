import { useState, useEffect } from 'react';
import { getWrapped } from '../api/tracking';
import WrappedStat from '../components/WrappedStat';
import './Wrapped.css';

const currentYear = new Date().getFullYear();
const YEARS = [currentYear, currentYear - 1, currentYear - 2];

export default function Wrapped() {
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await getWrapped(year);
        setData(result);
      } catch (err) {
        console.error('Failed to load wrapped', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [year]);

  if (loading) return <p className="shelf-empty">Unwrapping your year…</p>;
  if (!data) return <p className="shelf-empty">Could not load your Wrapped.</p>;

  const { summary, goal, booksPerMonth, bestMonth, topGenres, topAuthors, topTropes, longestBook, shortestBook, finishedBooks } = data;

  if (summary.totalBooksRead === 0) {
    return (
      <div className="wrapped-page">
        <div className="wrapped-year-picker">
          {YEARS.map((y) => (
            <button key={y} className={`wrapped-year-btn${y === year ? ' wrapped-year-active' : ''}`} onClick={() => setYear(y)}>
              {y}
            </button>
          ))}
        </div>
        <p className="shelf-empty">No books finished in {year} yet — finish one to unlock your Wrapped.</p>
      </div>
    );
  }

  const maxMonthCount = Math.max(...booksPerMonth.map((m) => m.count), 1);

  return (
    <div className="wrapped-page">
      <div className="wrapped-year-picker">
        {YEARS.map((y) => (
          <button key={y} className={`wrapped-year-btn${y === year ? ' wrapped-year-active' : ''}`} onClick={() => setYear(y)}>
            {y}
          </button>
        ))}
      </div>

      <div className="wrapped-hero">
        <p className="wrapped-eyebrow">your {year} in books</p>
        <h1>{summary.totalBooksRead} book{summary.totalBooksRead === 1 ? '' : 's'}</h1>
        <p className="wrapped-hero-sub">
          {summary.totalPagesRead.toLocaleString()} pages · {summary.totalHoursSpent} hours reading
        </p>
      </div>

      {goal && (
        <div className="wrapped-goal">
          <p className="wrapped-goal-label">
            {goal.completed ? '🎉 goal achieved' : 'reading goal progress'}
          </p>
          <div className="wrapped-goal-bar">
            <div
              className="wrapped-goal-fill"
              style={{ width: `${Math.min(goal.percentage, 100)}%` }}
            />
          </div>
          <p className="wrapped-goal-text">
            {goal.achieved} of {goal.target} books · {goal.percentage}%
          </p>
        </div>
      )}

      <div className="wrapped-stats-grid">
        <WrappedStat label="avg pages per session" value={summary.averagePagesPerSession} />
        <WrappedStat label="reading sessions" value={summary.totalReadingSessions} />
        {bestMonth && <WrappedStat label="best month" value={`${bestMonth.month} · ${bestMonth.count}`} />}
      </div>

      <div className="wrapped-section">
        <p className="wrapped-eyebrow">books per month</p>
        <div className="wrapped-bars">
          {booksPerMonth.map((m) => (
            <div key={m.month} className="wrapped-bar-col">
              <div className="wrapped-bar-track">
                <div
                  className="wrapped-bar-fill"
                  style={{ height: `${(m.count / maxMonthCount) * 100}%` }}
                />
              </div>
              <span className="wrapped-bar-count">{m.count || ''}</span>
              <span className="wrapped-bar-label">{m.month.slice(0, 3)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="wrapped-taste-grid">
        {topGenres.length > 0 && (
          <div className="wrapped-taste-card">
            <p className="wrapped-eyebrow">top genres</p>
            {topGenres.map((g, i) => (
              <div key={g.genre} className="wrapped-taste-row">
                <span className="wrapped-taste-rank">{i + 1}</span>
                <span>{g.genre}</span>
                <span className="wrapped-taste-count">{g.count}</span>
              </div>
            ))}
          </div>
        )}

        {topTropes.length > 0 && (
          <div className="wrapped-taste-card">
            <p className="wrapped-eyebrow">top tropes</p>
            {topTropes.map((t, i) => (
              <div key={t.trope} className="wrapped-taste-row">
                <span className="wrapped-taste-rank">{i + 1}</span>
                <span>{t.trope}</span>
                <span className="wrapped-taste-count">{t.count}</span>
              </div>
            ))}
          </div>
        )}

        {topAuthors.length > 0 && (
          <div className="wrapped-taste-card">
            <p className="wrapped-eyebrow">top authors</p>
            {topAuthors.map((a, i) => (
              <div key={a.author} className="wrapped-taste-row">
                <span className="wrapped-taste-rank">{i + 1}</span>
                <span>{a.author}</span>
                <span className="wrapped-taste-count">{a.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {(longestBook || shortestBook) && (
        <div className="wrapped-extremes">
          {longestBook && (
            <div className="wrapped-extreme-card">
              <p className="wrapped-eyebrow">longest book</p>
              <p className="wrapped-extreme-title">{longestBook.title}</p>
              <p className="wrapped-extreme-meta">{longestBook.pageCount} pages · {longestBook.authors?.join(', ')}</p>
            </div>
          )}
          {shortestBook && (
            <div className="wrapped-extreme-card">
              <p className="wrapped-eyebrow">shortest book</p>
              <p className="wrapped-extreme-title">{shortestBook.title}</p>
              <p className="wrapped-extreme-meta">{shortestBook.pageCount} pages · {shortestBook.authors?.join(', ')}</p>
            </div>
          )}
        </div>
      )}

      <div className="wrapped-section">
        <p className="wrapped-eyebrow">every book you finished</p>
        <div className="wrapped-book-grid">
          {finishedBooks.map((b) => (
            <div key={b.bookId} className="wrapped-book-cover">
              {b.coverImage ? (
                <img src={b.coverImage} alt={b.title} title={b.title} />
              ) : (
                <div className="wrapped-book-placeholder" title={b.title}>{b.title?.[0] || '?'}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}