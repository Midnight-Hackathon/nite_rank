import { useState, useMemo } from 'react';
import { CheckCircle } from 'lucide-react';

const initialData = [
  {
    rank: 1,
    alias: "Runner_98",
    activity: "Real Run",
    metric: "7.2 km",
    proof: "valid"
  },
  {
    rank: 2,
    alias: "GhostFox",
    activity: "Game Run",
    metric: "1540 points",
    proof: "valid"
  },
  {
    rank: 3,
    alias: "anon_12f3a9",
    activity: "Real Run",
    metric: "5.1 km",
    proof: "valid"
  }
];

const Leaderboard = () => {
  const [activityFilter, setActivityFilter] = useState('Mixed'); // Real Run | Game Run | Mixed
  const [metricFilter, setMetricFilter] = useState('Distance'); // Distance | Score | Streaks
  const [periodFilter, setPeriodFilter] = useState('7 days'); // Today | 7 days | 30 days

  const metricTypeFromString = (m) => {
    if (!m) return 'Distance';
    const mm = m.toLowerCase();
    if (mm.includes('km')) return 'Distance';
    if (mm.includes('point')) return 'Score';
    return 'Streaks';
  };

  const filtered = useMemo(() => {
    return initialData
      .filter((e) => {
        const matchesActivity =
          activityFilter === 'Mixed' ? true : e.activity === activityFilter;
        const matchesMetric = metricTypeFromString(e.metric) === metricFilter;
        return matchesActivity && matchesMetric;
      })
      .sort((a, b) => a.rank - b.rank);
  }, [activityFilter, metricFilter]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <header className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Verified Running Leaderboard</h2>
        <p className="mt-2 text-sm text-gray-600">
          Only outcome data is shown. No routes, no GPS, no times, no health metrics.
        </p>
      </header>

      {/* Filters */}
      <section className="mb-6 rounded-lg border bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="activity" className="block text-sm font-medium text-gray-700">
              Activity type
            </label>
            <select
              id="activity"
              className="mt-1 block w-full rounded-md border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:outline-none"
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
            >
              <option>Real Run</option>
              <option>Game Run</option>
              <option>Mixed</option>
            </select>
          </div>

          <div>
            <label htmlFor="metric" className="block text-sm font-medium text-gray-700">
              Metric
            </label>
            <select
              id="metric"
              className="mt-1 block w-full rounded-md border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:outline-none"
              value={metricFilter}
              onChange={(e) => setMetricFilter(e.target.value)}
            >
              <option>Distance</option>
              <option>Score</option>
              <option>Streaks</option>
            </select>
          </div>

          <div>
            <label htmlFor="period" className="block text-sm font-medium text-gray-700">
              Time period
            </label>
            <select
              id="period"
              className="mt-1 block w-full rounded-md border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:outline-none"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
            >
              <option>Today</option>
              <option>7 days</option>
              <option>30 days</option>
            </select>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          Filters update visible results only. Personal details remain private.
        </p>
      </section>

      {/* Leaderboard Table */}
      <section className="rounded-lg border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alias</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verified metric
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proof status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-sm text-gray-500">
                    No entries match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tr key={`${entry.alias}-${entry.rank}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.rank}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.alias}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{entry.activity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.metric}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <CheckCircle className="h-5 w-5 text-emerald-600" aria-label="Verified proof" />
                        <span className="font-medium">Verified</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Proof Information Box */}
      <aside className="mt-6">
        <div className="rounded-lg border bg-emerald-50 p-4">
          <h3 className="text-sm font-semibold text-emerald-800">Proof information</h3>
          <p className="mt-1 text-sm text-emerald-900">
            Every entry is backed by a Zero-Knowledge proof. Only the result is shown. No personal data is stored.
          </p>
        </div>
      </aside>
    </div>
  );
};

export default Leaderboard;