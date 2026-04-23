import { useState, useEffect } from 'react';
import musicFile from '../assets/music/Air Supply - Making Love Out Of Nothing At All (Piano Cover by Riyandi Kusuma).mp3';

/* ── Module-level singleton so audio starts as early as possible ── */
let _audio = null;
let _playing = false;
let _started = false; // synchronous flag — set BEFORE the async play() Promise resolves
const _listeners = new Set();

function getAudio() {
  if (!_audio) {
    _audio = new Audio(musicFile);
    _audio.loop = true;
    _audio.volume = 0.35;
    _audio.preload = 'auto';
  }
  return _audio;
}

function notifyListeners() {
  _listeners.forEach(fn => fn(_playing));
}

const EVENTS = ['click', 'touchstart', 'touchend', 'pointerdown', 'scroll', 'keydown', 'mousemove'];

function removeListeners() {
  EVENTS.forEach(ev => document.removeEventListener(ev, onAnyInteraction));
}

function tryPlay() {
  if (_started) return; // prevent duplicate concurrent play() calls
  _started = true;
  const audio = getAudio();
  audio.play().then(() => {
    _playing = true;
    notifyListeners();
    removeListeners();
  }).catch(() => {
    _started = false; // allow retry on next gesture if play() was rejected
  });
}

function onAnyInteraction() {
  tryPlay();
}

EVENTS.forEach(ev => document.addEventListener(ev, onAnyInteraction, { passive: true }));

/* Try immediately — works on desktop Chrome when user has prior engagement with the site */
tryPlay();

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(_playing);

  useEffect(() => {
    _listeners.add(setPlaying);
    setPlaying(_playing);
    return () => { _listeners.delete(setPlaying); };
  }, []);

  const toggle = (e) => {
    e.stopPropagation();
    const audio = getAudio();
    if (_playing) {
      audio.pause();
      _playing = false;
      notifyListeners();
    } else {
      audio.play().then(() => {
        _playing = true;
        notifyListeners();
      }).catch(() => {});
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
        cursor: 'pointer',
        display: 'flex',
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
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(135,169,107,0.25)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(135,169,107,0.15)'; }}
    >
      {playing ? (
        /* Animated bars when playing */
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
        /* Music note icon when paused */
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
