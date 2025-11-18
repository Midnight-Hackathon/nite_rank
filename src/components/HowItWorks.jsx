import React from 'react';

const Step = ({ kicker, title, text }) => (
  <div className="rounded-lg border p-4">
    <div className="text-xs font-bold text-gray-500">{kicker}</div>
    <div className="font-semibold text-gray-900 mt-1">{title}</div>
    <p className="text-sm text-gray-600 mt-2">{text}</p>
  </div>
);

const HowItWorks = () => {
  return (
    <section className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">How it works</h3>
      <div className="grid sm:grid-cols-4 gap-4">
        <Step kicker="STEP 1" title="Connect Strava (required)" text="Required to participate and verify eligibility via read‑only access." />
        <Step kicker="STEP 2" title="Run IRL when you want" text="Choose goals (≥ 5km, sub‑20min, streaks). Midnight verifies via ZK without exposing data." />
        <Step kicker="STEP 3" title="Prove privately" text="Generate a zero‑knowledge proof — only validity is revealed, never your raw data." />
        <Step kicker="STEP 4" title="Play digital anytime (optional)" text="Jump into NiteRun with perks unlocked by your IRL effort." />
      </div>
    </section>
  );
};

export default HowItWorks;