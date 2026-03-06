import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import config from '@config';

gsap.registerPlugin(ScrollTrigger);

function FloatingInput({ label, value, onChange, type = 'text', name, required = false, placeholder = ' ' }) {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.length > 0;

  return (
    <div style={{ position: 'relative', marginBottom: '2rem' }}>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        placeholder={placeholder}
        autoComplete="off"
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          borderBottom: `1px solid ${focused ? '#c9a84c' : 'rgba(250,248,240,0.18)'}`,
          padding: '1.25rem 0 0.5rem',
          fontFamily: 'Jost, sans-serif',
          fontWeight: 300,
          fontSize: '1rem',
          color: '#faf8f0',
          outline: 'none',
          transition: 'border-color 0.35s ease',
        }}
      />
      {/* Animated label */}
      <label
        style={{
          position: 'absolute',
          left: 0,
          top: focused || hasValue ? '0' : '1.25rem',
          fontSize: focused || hasValue ? '0.62rem' : '0.9rem',
          letterSpacing: focused || hasValue ? '0.35em' : '0.05em',
          color: focused ? '#c9a84c' : 'rgba(250,248,240,0.45)',
          textTransform: focused || hasValue ? 'uppercase' : 'none',
          transition: 'all 0.3s ease',
          pointerEvents: 'none',
          fontFamily: 'Jost, sans-serif',
          fontWeight: 200,
        }}
      >
        {label}
      </label>
      {/* Bottom line */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: focused ? '100%' : '0%',
          height: '1px',
          background: '#c9a84c',
          transition: 'width 0.45s ease',
        }}
      />
    </div>
  );
}

function FloatingTextarea() { return null; }

function ConfettiEffect() {
  const colors = ['#c9a84c','#f0d080','#40916c','#faf8f0','#e8d5a3'];
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {Array.from({ length: 30 }, (_, i) => (
        <motion.div
          key={i}
          initial={{ y: 0, x: `${Math.random() * 100}%`, opacity: 1, rotate: 0 }}
          animate={{
            y: '110vh',
            rotate: Math.random() * 720,
            opacity: [1,1,0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 1,
            ease: 'easeIn',
          }}
          style={{
            position: 'absolute',
            top: '-20px',
            width: i % 3 === 0 ? '8px' : '5px',
            height: i % 3 === 0 ? '8px' : '14px',
            borderRadius: i % 2 === 0 ? '50%' : '2px',
            background: colors[i % colors.length],
          }}
        />
      ))}
    </div>
  );
}

export default function RSVPSection() {
  const sectionRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    attendance: '',
    guests: '1',
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.rsvp-header > *', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
      });

      gsap.from('.rsvp-form-wrap', {
        y: 50,
        opacity: 0,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: '.rsvp-form-wrap',
          start: 'top 80%',
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = `Wedding RSVP – ${form.name} (${form.attendance})`;
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Attendance: ${form.attendance}`,
      `Number of Guests: ${form.guests}`,
    ].join('\n');

    window.open(
      `mailto:${config.events.rsvp.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      '_blank'
    );
    setSubmitted(true);
  };

  return (
    <section
      id="rsvp"
      ref={sectionRef}
      style={{
      background: '#143526',
        padding: 'clamp(5rem,12vw,9rem) clamp(1.5rem,5vw,5rem)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '40%',
          height: '100%',
          background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.05))',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <div
          className="rsvp-header"
          style={{ textAlign: 'center', marginBottom: 'clamp(3rem,8vw,4.5rem)' }}
        >
          <p className="section-tag" style={{ color: '#c9a84c', marginBottom: '0.75rem' }}>
            Kindly Reply
          </p>
          <h2
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 400,
              fontSize: 'clamp(2.2rem,6vw,4rem)',
              color: '#050d0a',
              marginBottom: '0.5rem',
            }}
          >
            Will You Join Us?
          </h2>
          <p
            style={{
              fontFamily: 'Jost, sans-serif',
              fontWeight: 200,
              fontSize: '0.82rem',
              color: 'rgba(5,13,10,0.5)',
              letterSpacing: '0.15em',
              marginBottom: '0.5rem',
            }}
          >
            Please respond by May 20, 2026
          </p>
          <div
            style={{
              width: '60px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)',
              margin: '1.5rem auto 0',
            }}
          />
        </div>

        {/* Form or success */}
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              className="rsvp-form-wrap"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <form onSubmit={handleSubmit}>
                <FloatingInput
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                <FloatingInput
                  label="Email Address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                />

                {/* Attendance toggle */}
                <div style={{ marginBottom: '2rem' }}>
                  <p
                    style={{
                      fontFamily: 'Jost, sans-serif',
                      fontWeight: 200,
                      fontSize: '0.62rem',
                      letterSpacing: '0.35em',
                      color: 'rgba(250,248,240,0.45)',
                      textTransform: 'uppercase',
                      marginBottom: '0.75rem',
                    }}
                  >
                    Attendance
                  </p>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {['Joyfully Accepts', 'Regretfully Declines'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, attendance: opt }))}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          fontFamily: 'Jost, sans-serif',
                          fontWeight: 300,
                          fontSize: '0.75rem',
                          letterSpacing: '0.1em',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          border: form.attendance === opt
                            ? '1px solid #c9a84c'
                            : '1px solid rgba(250,248,240,0.15)',
                          background: form.attendance === opt
                            ? 'rgba(201,168,76,0.1)'
                            : 'transparent',
                          color: form.attendance === opt
                            ? '#c9a84c'
                            : 'rgba(250,248,240,0.5)',
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of guests */}
                <FloatingInput
                  label="Number of Guests"
                  name="guests"
                  type="number"
                  value={form.guests}
                  onChange={handleChange}
                />

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button type="submit" className="btn-gold" style={{ width: '100%' }}>
                    Send RSVP
                  </button>
                </div>
              </form>

              {/* Alternative contact */}
              <div
                style={{
                  marginTop: '3rem',
                  paddingTop: '2rem',
                  borderTop: '1px solid rgba(250,248,240,0.08)',
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    fontFamily: 'Jost, sans-serif',
                    fontWeight: 200,
                    fontSize: '0.75rem',
                    color: 'rgba(250,248,240,0.45)',
                    letterSpacing: '0.15em',
                    marginBottom: '0.75rem',
                  }}
                >
                  Or contact us directly
                </p>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '2rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <a
                    href={`mailto:${config.events.rsvp.email}`}
                    style={{
                      fontFamily: 'Jost, sans-serif',
                      fontWeight: 300,
                      fontSize: '0.8rem',
                      color: '#c9a84c',
                      textDecoration: 'none',
                    }}
                  >
                    {config.events.rsvp.email}
                  </a>
                  <span style={{ color: 'rgba(250,248,240,0.3)' }}>·</span>
                  <a
                    href="https://wa.me/96171054630"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: 'Jost, sans-serif',
                      fontWeight: 300,
                      fontSize: '0.8rem',
                      color: '#c9a84c',
                      textDecoration: 'none',
                    }}
                  >
                    {config.events.rsvp.phone1}
                  </a>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.25,0.46,0.45,0.94] }}
              style={{
                position: 'relative',
                textAlign: 'center',
                padding: 'clamp(3rem,8vw,5rem) 2rem',
              }}
            >
              <ConfettiEffect />
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  border: '1px solid #c9a84c',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  margin: '0 auto 2rem',
                }}
              >
                ♡
              </div>
              <h3
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontWeight: 400,
                  fontSize: 'clamp(1.8rem,5vw,2.8rem)',
                  color: '#faf8f0',
                  marginBottom: '1rem',
                }}
              >
                Thank You!
              </h3>
              <p
                style={{
                  fontFamily: 'Jost, sans-serif',
                  fontWeight: 300,
                  fontSize: '0.9rem',
                  color: 'rgba(250,248,240,0.55)',
                  lineHeight: 1.8,
                  maxWidth: '360px',
                  margin: '0 auto',
                }}
              >
                Your RSVP has been sent. We can't wait to celebrate with you!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
