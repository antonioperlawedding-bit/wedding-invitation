import { useState, useEffect } from 'react';

/**
 * Returns the single Audio element created in index.html.
 * Falls back to creating one if not yet available (e.g. during dev HMR).
 * We do NOT call play() here — index.html already did.
 */
function getAudio() {
  if (!window.__audio) {
    const a = new Audio('/music.mp3');
    a.loop    = true;
    a.volume  = 0.35;
    a.preload = 'auto';
    window.__audio = a;
  }
  return window.__audio;
}

/**
 * Called by App.jsx every time the loading screen finishes.
 * Ensures audio is playing and unmuted. No-ops if already audibly playing.
 */
export function triggerPlay() {
  const audio = getAudio();

  // Already playing audibly — nothing to do
  if (!audio.paused && !audio.muted) return;

  // Playing muted (normal muted-autoplay path) — just unmute
  if (!audio.paused && audio.muted) {
    audio.muted  = false;
    audio.volume = 0.35;
    return;
  }

  // Paused — attempt play (needs gesture on iOS <16.4)
  audio.muted  = false;
  audio.volume = 0.35;
  audio.play().catch(() => {
    // Gesture still required on this browser — the _unlock listener in
    // index.html will handle it on first tap/scroll
  });
}

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(() => {
    const a = getAudio();
    return !a.paused && !a.muted;
  });
  const [chatOpen, setChatOpen] = useState(false);

  // Sync React state directly to native audio element events
  useEffect(() => {
    const a = getAudio();
    const sync = () => setPlaying(!a.paused && !a.muted);
    a.addEventListener('play',         sync);
    a.addEventListener('pause',        sync);
    a.addEventListener('volumechange', sync);
    return () => {
      a.removeEventListener('play',         sync);
      a.removeEventListener('pause',        sync);
      a.removeEventListener('volumechange', sync);
    };
  }, []);

  // Hide button when chatbot is open on mobile
  useEffect(() => {
    const onChat = (e) => setChatOpen(e.detail?.open ?? false);
    window.addEventListener('chatbot:toggle', onChat);
    return () => window.removeEventListener('chatbot:toggle', onChat);
  }, []);

  const toggle = (e) => {
    e.stopPropagation();
    const a = getAudio();
    if (a.paused) {
      a.muted  = false;
      a.volume = 0.35;
      a.play().catch(() => {});
    } else {
      a.pause();
    }
  };

  return (
    <button
      onClick={toggle}
      title={playing ? 'Pause music' : 'Play music'}
      style={{
        position: 'fixed',
        bottom: '1.25rem',
        left: '1.25rem',
        zIndex: 9999,
        width: '40px',
        height: '40px',
        minWidth: '40px',
        minHeight: '40px',
        borderRadius: '50%',
        border: '1px solid rgba(135,169,107,0.4)',
        background: 'rgba(242,248,236,0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: chatOpen ? 'none' : 'flex',
        cursor: 'pointer',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 12px rgba(135,169,107,0.15)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        padding: 0,
        margin: 0,
        outline: 'none',
        appearance: 'none',
        WebkitAppearance: 'none',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(135,169,107,0.25)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(135,169,107,0.15)';
      }}
    >
      {playing ? (
        <span style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '14px' }}>
          {[0, 0.15, 0.3].map((delay, i) => (
            <span
              key={i}
              style={{
                display: 'block',
                width: '3px',
                borderRadius: '2px',
                background: '#87A96B',
                animation: `musicBar 0.8s ease-in-out ${delay}s infinite alternate`,
              }}
            />
          ))}
        </span>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M9 18V5l12-2v13"
            stroke="#87A96B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="6" cy="18" r="3" stroke="#87A96B" strokeWidth="2" />
          <circle cx="18" cy="16" r="3" stroke="#87A96B" strokeWidth="2" />
        </svg>
      )}
      <style>{`
        @keyframes musicBar {
          from { height: 4px; }
          to   { height: 14px; }
        }
      `}</style>
    </button>
  );
}
