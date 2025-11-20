import React from 'react';

const isIframeUrl = (url) => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('vimeo.com');
};

const TrailerModal = ({ open, onClose, url, title = 'Gameplay Trailer' }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative z-10 mx-auto max-w-4xl w-full px-4 sm:px-6">
        <div className="mt-10 sm:mt-16 rounded-xl overflow-hidden bg-black shadow-xl">
          <div className="flex justify-between items-center px-4 py-3 bg-black/60">
            <h3 className="text-white font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white border border-white/20 rounded-md px-3 py-1 text-sm"
            >
              Close
            </button>
          </div>

          <div className="aspect-video bg-black">
            {isIframeUrl(url) ? (
              <iframe
                src={url}
                title={title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              />
            ) : (
              <video
                src={url}
                className="w-full h-full"
                autoPlay
                loop
                controls
                playsInline
                muted={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;