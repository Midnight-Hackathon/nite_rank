// src/pages/Test.jsx
import { useState } from 'react';
import { fetchActivities } from '../context/ActivityContext.jsx';

const Test = () => {
  const [status, setStatus] = useState('');
  const [txHash, setTxHash] = useState('');
  const [inputDistance, setInputDistance] = useState('');
  const [inputDuration, setInputDuration] = useState('');

  // Hardcoded test run (always passes: 6.5km in 18min)
  const submitTestProof = async () => {
    setStatus('Sending to backend...');
    try {
      const resp = await fetch('http://localhost:3001/submit-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ distance: 6500, duration: 1080 }),
      });
      const data = await resp.json();
      if (data.success) {
        setTxHash(data.txHash);
        setStatus('✅ Proof submitted!');
        loadProofCount();
      } else {
        setStatus(`❌ ${data.error}`);
      }
    } catch (err) {
      setStatus(`❌ ${err.message}`);
    }
  };

  // Fetch latest run from Strava
  const fetchLatestRun = async () => {
    setStatus('Fetching Strava activities...');
    const accessToken = import.meta.env.VITE_ACCESS_TOKEN;

    if (!accessToken) {
      setStatus('❌ VITE_ACCESS_TOKEN missing in .env');
      return;
    }

    try {
      const activities = await fetchActivities(accessToken);
      if (activities.length === 0) {
        setStatus('No activities found');
        return;
      }

      // Take the most recent run/walk
      const latest = activities[0];
      const distance = Math.round(latest.distance); // meters
      const duration = latest.duration; // seconds

      console.log('Latest activity:', latest);

      setInputDistance(distance.toString());
      setInputDuration(duration.toString());

      setStatus(`Fetched: ${latest.name} - ${distance}m in ${Math.floor(duration / 60)}min ${duration % 60}s`);
    } catch (err) {
      setStatus(`❌ ${err.message}`);
    }
  };

  // Submit proof with custom distance and duration
  const submitProof = async () => {
    const distance = parseInt(inputDistance);
    const duration = parseInt(inputDuration);

    if (isNaN(distance) || isNaN(duration)) {
      setStatus('❌ Invalid distance or duration');
      return;
    }

    setStatus('Sending to backend...');
    try {
      const resp = await fetch('http://localhost:3001/submit-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ distance, duration }),
      });
      const data = await resp.json();
      if (data.success) {
        setTxHash(data.txHash);
        setStatus('✅ Proof submitted!');
        loadProofCount();
      } else {
        setStatus(`❌ ${data.error}`);
      }
    } catch (err) {
      setStatus(`❌ ${err.message}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Midnight ZK Proof Test</h1>

      <div className="space-y-6">

        <div>
          <button
            type="button"
            onClick={fetchLatestRun}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition text-lg"
          >
            Fetch Latest Run
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Distance (meters)</label>
            <input
              type="number"
              value={inputDistance}
              onChange={(e) => setInputDistance(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Duration (seconds)</label>
            <input
              type="number"
              value={inputDuration}
              onChange={(e) => setInputDuration(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <button
              type="button"
              onClick={submitProof}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition text-lg"
            >
              Submit Proof
            </button>
          </div>
        </div>

        {status && (
          <div className={`mt-6 p-4 rounded-lg text-center font-medium ${status.includes('✅') ? 'bg-green-100 text-green-800' : status.includes('❌') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
            {status}
          </div>
        )}

        {txHash && (
          <div className="mt-6 p-4 bg-gray-900 text-green-400 rounded-lg text-center">
            <p className="text-sm mb-2">Transaction Hash:</p>
            <code className="text-xs break-all">{txHash}</code>
            <br />
            <a
              href={`https://testnet-explorer.midnight.network/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline mt-2 inline-block"
            >
              View on Midnight Explorer →
            </a>
          </div>
        )}
      </div>

      <p className="text-center text-gray-500 text-sm mt-12">
        Make sure <code>npm run docker</code> is running in another terminal!
      </p>
    </div>
  );
};

export default Test;