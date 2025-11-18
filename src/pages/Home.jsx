import React from 'react';
import HeroVideo from '../components/HeroVideo.jsx';
import GameSection from '../components/GameSection.jsx';
import HybridPlay from '../components/HybridPlay.jsx';
import DualLeaderboards from '../components/DualLeaderboards.jsx';
import PrivacyComparison from '../components/PrivacyComparison.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import FinalCTA from '../components/FinalCTA.jsx';

const Home = () => {
  return (
    <div className="space-y-12">
      {/* Full-width hero */}
      <HeroVideo />

      {/* Page content container */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-12">
        {/* The Game */}
        <GameSection />

        {/* Hybrid loop section */}
        <HybridPlay />

        {/* Two Leaderboards */}
        <DualLeaderboards />

        {/* Comparison */}
        <PrivacyComparison />

        {/* How It Works */}
        <HowItWorks />

        {/* Final CTA */}
        <FinalCTA />
      </div>
    </div>
  );
};

export default Home;