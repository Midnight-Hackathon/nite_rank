import React, { useState } from 'react';
import { useStrava } from '../context/StravaContext.jsx';
import TrailerModal from './TrailerModal.jsx';
import heroPoster from '../pictures/midnight.jpg';

const HeroVideo = () => {
  const { isConnected, connectStrava } = useStrava();
  const [openTrailer, setOpenTrailer] = useState(false);

  const heroVideoUrl = import.meta.env.VITE_HERO_VIDEO_URL; // MP4 or iframe URL
  const trailerUrl = import.meta.env.VITE_TRAILER_URL; // YouTube/Vimeo embed URL or MP4

  return (
    <section className="relative w-full overflow-hidden">
      {heroVideoUrl ? (
        <video
          src={heroVideoUrl}
          className="w-full h-[60vh] sm:h-[72vh] object-cover"
          autoPlay
          loop
          muted
          playsInline
          poster={heroPoster}
        />
      ) : (
        <img
          src={heroPoster}
          alt="UE5 Parkour city"
          className="w-full h-[60vh] sm:h-[72vh] object-cover"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

      <div className="absolute inset-0">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-full flex items-center">
          <div className="max-w-2xl text-white space-y-5">
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">
              Hybrid play:
              <br />
              run IRL, then parkour digitally.
            </h1>
            <p className="text-sm sm:text-base text-white/80">
              Strava connection is required. Digital sessions are optional — mix short IRL runs with parkour whenever you want.
              Private ZK proofs unlock in‑game perks without exposing your data.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
              <button
                onClick={connectStrava}
                className="inline-flex justify-center items-center rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-3 shadow-lg transition-colors"
              >
                {isConnected ? '✅ Strava Connected — Ready' : 'Connect Strava — required'}
              </button>

              <button
                onClick={() => setOpenTrailer(true)}
                className="inline-flex justify-center items-center rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 border border-white/30 transition-colors"
              >
                Watch Gameplay
              </button>
            </div>

            <div className="text-xs sm:text-sm text-white/70">
              Digital play is optional. IRL runs are required — your verified effort powers progress and unlocks perks via Midnight ZK.
            </div>
          </div>
        </div>
      </div>

      <TrailerModal
        open={openTrailer}
        onClose={() => setOpenTrailer(false)}
        url={trailerUrl}
        title="NiteRun — Gameplay Trailer"
      />
    </section>
  );
};

export default HeroVideo;