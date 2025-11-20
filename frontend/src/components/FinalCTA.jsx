import React from 'react';
import { useStrava } from '../context/StravaContext.jsx';
import heroPoster from '../pictures/midnight.jpg';

const FinalCTA = () => {
  const { connectStrava } = useStrava();
  const ctaVideoUrl = import.meta.env.VITE_FINAL_CTA_VIDEO_URL;

  return (
    <section className="relative w-full overflow-hidden rounded-xl">
      {ctaVideoUrl ? (
        <video
          src={ctaVideoUrl}
          className="w-full h-[40vh] sm:h-[60vh] object-cover"
          autoPlay
          loop
          muted
          playsInline
          poster={heroPoster}
        />
      ) : (
        <img
          src={heroPoster}
          alt="UE5 cinematic"
          className="w-full h-[40vh] sm:h-[60vh] object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      <div className="absolute inset-0">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-full flex items-center">
          <div className="max-w-2xl text-white space-y-4">
            <h3 className="text-2xl sm:text-4xl font-extrabold">Run IRL sometimes. Parkour digitally anytime.</h3>
            <p className="text-white/80">Strava is required. Digital play is optional — IRL runs privately unlock perks and multipliers.</p>
            <button
              onClick={connectStrava}
              className="inline-flex justify-center items-center rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-3 shadow-lg transition-colors"
            >
              Connect Strava — required
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;