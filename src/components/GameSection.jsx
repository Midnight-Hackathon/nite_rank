import React, { useState } from 'react';
import TrailerModal from './TrailerModal.jsx';

const GameSection = () => {
  const [openTrailer, setOpenTrailer] = useState(false);
  const trailerUrl = import.meta.env.VITE_TRAILER_URL;

  return (
    <section className="bg-white rounded-xl shadow-sm p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-2xl font-bold text-gray-900">NiteRun — Hybrid play, ZK‑powered</h3>
        <button
          onClick={() => setOpenTrailer(true)}
          className="rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-semibold px-4 py-2"
        >
          Watch Trailer
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-xs font-bold text-gray-500">REAL WORLD</div>
          <div className="font-semibold text-gray-900 mt-1">Run IRL when you want</div>
          <p className="text-sm text-gray-600 mt-2">Short sessions count. Your effort stays private — no raw data enters the game.</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-xs font-bold text-gray-500">PRIVATE PROOF</div>
          <div className="font-semibold text-gray-900 mt-1">Midnight ZK</div>
          <p className="text-sm text-gray-600 mt-2">Prove distance/time/streaks without sharing routes, pace, or HR.</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-xs font-bold text-gray-500">DIGITAL PLAY (OPTIONAL)</div>
          <div className="font-semibold text-gray-900 mt-1">Perks in the parkour runner</div>
          <p className="text-sm text-gray-600 mt-2">Play when you want — perks and multipliers apply when you’ve run IRL.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🌆</span>
            <h4 className="font-bold text-gray-900">Infinite neon city</h4>
          </div>
          <p className="text-gray-600 text-sm">Procedural levels with speed lines and cinematic lighting.</p>
        </div>
        <div className="rounded-xl border p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🏃‍♂️</span>
            <h4 className="font-bold text-gray-900">Fluid movement</h4>
          </div>
          <p className="text-gray-600 text-sm">Wall-running, grinding, vaulting — tuned for flow and speed.</p>
        </div>
        <div className="rounded-xl border p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">♟️</span>
            <h4 className="font-bold text-gray-900">Hybrid loop</h4>
          </div>
          <p className="text-gray-600 text-sm">Alternate IRL runs with digital sessions.</p>
        </div>
        <div className="rounded-xl border p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🌐</span>
            <h4 className="font-bold text-gray-900">Global leaderboards</h4>
          </div>
          <p className="text-gray-600 text-sm">Physical + Digital side-by-side. Perks carry into digital play.</p>
        </div>
        <div className="rounded-xl border p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">⛓️</span>
            <h4 className="font-bold text-gray-900">On-chain skins & badges</h4>
          </div>
          <p className="text-gray-600 text-sm">Minted on Midnight, privately owned.</p>
        </div>
      </div>

      <TrailerModal
        open={openTrailer}
        onClose={() => setOpenTrailer(false)}
        url={trailerUrl}
        title="NiteRun — Trailer"
      />
    </section>
  );
};

export default GameSection;