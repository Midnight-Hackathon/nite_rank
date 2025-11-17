import { useState, useEffect } from 'react';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockData = [
      { id: 1, name: 'Alice', score: 150 },
      { id: 2, name: 'Bob', score: 120 },
      { id: 3, name: 'Charlie', score: 100 },
      { id: 4, name: 'Diana', score: 80 },
      { id: 5, name: 'Eve', score: 60 },
    ];
    setLeaderboard(mockData);
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Leaderboard</h2>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboard.map((entry, index) => (
              <tr key={entry.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;