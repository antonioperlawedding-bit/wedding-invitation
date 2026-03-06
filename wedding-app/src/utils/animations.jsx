import React from 'react';

/**
 * Split a string into individual <span class="char"> elements for GSAP animation
 */
export function SplitChars({ text, className = '' }) {
  return (
    <>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className={`char inline-block ${className}`}
          style={{ '--char-index': i }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </>
  );
}

/**
 * Split text into word spans
 */
export function SplitWords({ text, className = '' }) {
  return (
    <>
      {text.split(' ').map((word, i) => (
        <span key={i} className={`word inline-block overflow-hidden ${className}`}>
          <span className="word-inner inline-block">{word}</span>
          {i < text.split(' ').length - 1 && '\u00A0'}
        </span>
      ))}
    </>
  );
}

/**
 * Format a date string to long format
 */
export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Compute time remaining until a target date
 */
export function getTimeRemaining(targetDate) {
  const total = new Date(targetDate) - new Date();
  if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / 1000 / 60) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

/**
 * Clamp a number between min and max
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Map a value from one range to another
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}
