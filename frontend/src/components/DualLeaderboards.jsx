import React from 'react';

const samplePhysical = [
  { name: 'Ava Storm', score: 12850, verified: true },
  { name: 'Kai Velocity', score: 12320, verified: true },
  { name: 'Mara Ghost', score: 11790, verified: true },
  { name: 'Rio Phantom', score: 11440, verified: true },
  { name: 'Zane Flux', score: 11010, verified: true },
];

const sampleDigital = [
  { name: 'Nova Glide', score: 9800 },
  { name: 'Echo Drift', score: 9420 },
  { name: 'Vex Sprint', score: 9100 },
  { name: 'Juno Dash', score: 8920 },
  { name: 'Iris Flip', score: 8700 },
];

const Board = ({ title, description, items, variant = 'physical' }) => {
  const isPhysical = variant === 'physical';
  return (
    <div className={`rounded-xl border p-6 ${isPhysical ? 'bg-emerald-50 border-emerald-200' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className={`font-bold ${isPhysical ? 'text-emerald-700' : 'text-gray-900'}`}>{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        {isPhysical && (
          <span className="inline-flex items-center rounded-full bg-emerald-600 text-white text-xs font-semibold px-3 py-1">
            Perk multiplier
          </span>
        )}
      </div>
      <ul className="space-y-2">
        {items.map((r, i) => (
          <li key={i} className="flex items-center justify-between rounded-lg bg-white/60 px-3 py-2">
            <div className="flex items-center gap-3">
              <span className="w-6 text-center text-xs font-bold text-gray-500">{i + 1}</span>
              <span className="font-medium text-gray-900">{r.name}</span>
              {isPhysical && r.verified && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5">
                  Verified Runner
                </span>
              )}
            </div>
            <div className={`text-sm font-bold ${isPhysical ? 'text-emerald-700' : 'text-gray-700'}`}>{r.score.toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const DualLeaderboards = () => {
  return (
    <section className="space-y-4">
      <h3 className="text-2xl font-bold text-gray-900">Hybrid leaderboards — IRL + digital side by side</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <Board
          title="Physical Leaderboard — Ghost Runners"
          description="Optional IRL runs verified privately (Strava + Midnight ZK). Earn perks that enhance digital play."
          items={samplePhysical}
          variant="physical"
        />
        <Board
          title="Digital Leaderboard — Everyone"
          description="Play anytime. Mix in IRL runs whenever you want for extra perks and higher multipliers."
          items={sampleDigital}
          variant="digital"
        />
      </div>
    </section>
  );
};

export default DualLeaderboards;