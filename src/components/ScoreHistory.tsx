import { useEffect, useState } from 'react';
import { getScores, type ScoreEntry } from '../api';

interface Props {
  token: string;
}

export default function ScoreHistory({ token }: Props) {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Small delay so the just-saved score is included in the fetch
    const timer = setTimeout(() => {
      getScores(token)
        .then(setScores)
        .catch(() => setScores([]))
        .finally(() => setLoading(false));
    }, 500);
    return () => clearTimeout(timer);
  }, [token]);

  if (loading) {
    return <p className="text-amber-600 text-sm mt-2">Loading history...</p>;
  }
  if (scores.length === 0) {
    return <p className="text-amber-600 text-sm mt-2">No previous games yet.</p>;
  }

  return (
    <div className="mt-2 w-full max-w-xs">
      <h3 className="text-amber-800 font-medium mb-2 text-sm text-center">Your Recent Games</h3>
      <div className="space-y-1">
        {scores.map((entry, i) => (
          <div
            key={i}
            className="flex justify-between items-center text-sm bg-amber-50 rounded px-3 py-1.5 border border-amber-200"
          >
            <span className={`font-semibold ${entry.score > 0 ? 'text-green-600' : entry.score < 0 ? 'text-red-600' : 'text-yellow-600'}`}>
              {entry.score > 0 ? '+' : ''}${entry.score}
            </span>
            <span className="text-amber-500 text-xs">
              {new Date(entry.played_at).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
