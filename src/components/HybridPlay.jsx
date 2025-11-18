import React from 'react';

const HybridCard = ({ title, emoji, text, pills = [] }) => (
  <div className="rounded-xl border p-5 bg-white">
    <div className="flex items-center gap-3 mb-2">
      <span className="text-2xl">{emoji}</span>
      <h4 className="font-bold text-gray-900">{title}</h4>
    </div>
    <p className="text-gray-600 text-sm">{text}</p>
    {pills.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-3">
        {pills.map((p, i) => (
          <span key={i} className="inline-flex items-center rounded-full bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1">
            {p}
          </span>
        ))}
      </div>
    )}
  </div>
);

const HybridPlay = () => {
  return (
    <section className="bg-white rounded-xl shadow-sm p-6 sm:p-8 space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900">Your hybrid loop</h3>
        <p className="text-gray-600 mt-2">Mix short IRL runs with digital sessions whenever you want — perks apply, privacy preserved.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <HybridCard
          title="Run IRL"
          emoji="🏃‍♀️"
          text="Do a quick run — 10 to 20 minutes is perfect. Keep your route, pace, and HR private."
          pills={['≥ 5km', '≤ 20min', 'Streaks']}
        />
        <HybridCard
          title="Prove privately"
          emoji="🔒"
          text="Generate a zero‑knowledge proof on Midnight. Only validity is revealed — never your raw data."
          pills={['No data exposed', 'Instant verification']}
        />
        <HybridCard
          title="Play with perks"
          emoji="🎮"
          text="Jump back into NiteRun with advantages unlocked by your IRL effort."
          pills={['Speed Boost', 'XP Multiplier', 'Cosmetics']}
        />
      </div>
    </section>
  );
};

export default HybridPlay;