import React from 'react';

const Point = ({ icon, text }) => (
  <li className="flex items-start gap-2">
    <span className="text-xl leading-none">{icon}</span>
    <span className="text-gray-700">{text}</span>
  </li>
);

const Card = ({ tone = 'neutral', title, emoji, points }) => {
  const tones = {
    red: {
      wrap: 'bg-red-50 border-red-200',
      title: 'text-red-700',
    },
    green: {
      wrap: 'bg-emerald-50 border-emerald-200',
      title: 'text-emerald-700',
    },
    neutral: {
      wrap: 'bg-gray-50 border-gray-200',
      title: 'text-gray-800',
    },
  };
  const t = tones[tone] ?? tones.neutral;

  return (
    <div className={`rounded-xl border p-6 ${t.wrap}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="text-3xl">{emoji}</div>
        <h4 className={`text-lg font-bold ${t.title}`}>{title}</h4>
      </div>
      <ul className="space-y-2">
        {points.map((p, i) => (
          <Point key={i} icon={p.icon} text={p.text} />
        ))}
      </ul>
    </div>
  );
};

const PrivacyComparison = () => {
  return (
    <section className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900">Real runs → real advantages, zero data exposed</h3>
        <p className="text-gray-600 mt-2">The only parkour game where being fast IRL actually matters.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card
          tone="red"
          emoji="🪙"
          title="Traditional fitness games"
          points={[
            { icon: '🤖', text: 'Fake runs, bots, and no stakes' },
            { icon: '📤', text: 'Or full Strava data exposed' },
            { icon: '😴', text: 'Graphics and gameplay feel last‑gen' },
          ]}
        />
        <Card
          tone="green"
          emoji="⚡"
          title="NiteRun + Midnight"
          points={[
            { icon: '🏃‍♂️', text: 'Real runs = real advantages' },
            { icon: '🔒', text: 'Zero personal data exposed (ZK on Midnight)' },
            { icon: '🎮', text: 'UE5 visuals that actually look next‑gen' },
          ]}
        />
      </div>
    </section>
  );
};

export default PrivacyComparison;