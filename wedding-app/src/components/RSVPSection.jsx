import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import { useConfig } from '../i18n/useConfig';
import { useLang } from '../i18n/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

function FloatingInput({ label, value, onChange, type = 'text', name, required = false, placeholder = ' ' }) {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.length > 0;

  return (
    <div style={{ position: 'relative', marginBottom: '1.75rem' }}>
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
          borderBottom: `1px solid ${focused ? '#87A96B' : 'rgba(58,46,32,0.15)'}`,
          padding: '1.25rem 0 0.5rem',
          fontFamily: 'Jost, sans-serif',
          fontWeight: 300,
          fontSize: '1rem',
          color: '#3a2e20',
          outline: 'none',
          transition: 'border-color 0.35s ease',
        }}
      />
      <label
        style={{
          position: 'absolute',
          left: 0,
          top: focused || hasValue ? '0' : '1.25rem',
          fontSize: focused || hasValue ? '0.62rem' : '0.9rem',
          letterSpacing: focused || hasValue ? '0.3em' : '0.05em',
          color: focused ? '#87A96B' : 'rgba(58,46,32,0.4)',
          textTransform: focused || hasValue ? 'uppercase' : 'none',
          transition: 'all 0.3s ease',
          pointerEvents: 'none',
          fontFamily: 'Jost, sans-serif',
          fontWeight: 300,
        }}
      >
        {label}
      </label>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: focused ? '100%' : '0%',
          height: '1.5px',
          background: '#87A96B',
          transition: 'width 0.45s ease',
        }}
      />
    </div>
  );
}

export default function RSVPSection() {
  const sectionRef = useRef(null);
  const config = useConfig();
  const { t, isAr } = useLang();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedAttendance, setSubmittedAttendance] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    attendance: '',
    guests: '1',
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.rsvp-header > *', {
        y: 30,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'expo.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      });
      gsap.from('.rsvp-form-wrap', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.rsvp-form-wrap', start: 'top 80%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      setSubmittedAttendance(form.attendance);
      setSubmitted(true);
    } catch {
      setError(t('rsvp.errorMessage') || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="rsvp"
      ref={sectionRef}
      className="watermark-sunflower"
      style={{
        background: '#eaf3e2',
        padding: 'clamp(3rem,8vw,7rem) clamp(1rem,4vw,3rem) clamp(1.5rem,4vw,3.5rem)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <div
          className="rsvp-header"
          style={{ textAlign: 'center', marginBottom: 'clamp(1.5rem,5vw,3.5rem)' }}
        >
          <p className="section-tag" style={{ marginBottom: '0.75rem' }}>
            {config.ui.rsvp.tag}
          </p>
          <h2
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 400,
              fontSize: 'clamp(2rem,5vw,3.5rem)',
              color: '#3a2e20',
              marginBottom: '0.5rem',
            }}
          >
            {config.ui.rsvp.title}
          </h2>
          <p
            style={{
              fontFamily: 'Jost, sans-serif',
              fontWeight: 300,
              fontSize: '0.82rem',
              color: 'rgba(58,46,32,0.5)',
              letterSpacing: '0.1em',
            }}
          >
            {t('rsvp.respondBy')} {new Date(config.events.rsvp.deadline + 'T00:00:00').toLocaleDateString(isAr ? 'ar-LB' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <div
            style={{
              width: '60px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #87A96B, transparent)',
              margin: '1.25rem auto 0',
            }}
          />
        </div>

        {/* Form or Success */}
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              className="rsvp-form-wrap"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div
                style={{
                  background: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(135,169,107,0.15)',
                  borderRadius: '1rem',
                  padding: 'clamp(1.5rem,4vw,2.5rem)',
                }}
              >
                <form onSubmit={handleSubmit}>
                  <FloatingInput label={t('rsvp.fullName')} name="name" value={form.name} onChange={handleChange} required />
                  <FloatingInput label={t('rsvp.phone')} name="phone" type="tel" value={form.phone} onChange={handleChange} required />
                  <FloatingInput label={t('rsvp.email')} name="email" type="email" value={form.email} onChange={handleChange} />

                  {/* Attendance toggle */}
                  <div style={{ marginBottom: '1.75rem' }}>
                    <p
                      style={{
                        fontFamily: isAr ? '"Tajawal", sans-serif' : 'Jost, sans-serif',
                        fontWeight: 300,
                        fontSize: '0.62rem',
                        letterSpacing: isAr ? '0' : '0.3em',
                        color: 'rgba(58,46,32,0.45)',
                        textTransform: isAr ? 'none' : 'uppercase',
                        marginBottom: '0.75rem',
                      }}
                    >
                      {t('rsvp.attendance')}
                    </p>
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                      {config.ui.rsvp.attendanceOptions.map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, attendance: opt }))}
                          style={{
                            flex: '1 1 auto',
                            minWidth: '90px',
                            padding: '0.7rem 0.5rem',
                            fontFamily: 'Jost, sans-serif',
                            fontWeight: 300,
                            fontSize: '0.75rem',
                            letterSpacing: '0.08em',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            borderRadius: '0.5rem',
                            border: form.attendance === opt
                              ? '1px solid #87A96B'
                              : '1px solid rgba(58,46,32,0.12)',
                            background: form.attendance === opt
                              ? 'rgba(135,169,107,0.12)'
                              : 'transparent',
                            color: form.attendance === opt
                              ? '#87A96B'
                              : 'rgba(58,46,32,0.5)',
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <FloatingInput label={t('rsvp.numGuests')} name="guests" type="number" value={form.guests} onChange={handleChange} />

                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary"
                      style={{
                        width: '100%',
                        padding: '0.9rem 2rem',
                        fontSize: '0.8rem',
                        letterSpacing: '0.2em',
                        borderRadius: '0.5rem',
                        opacity: submitting ? 0.6 : 1,
                      }}
                    >
                      {submitting ? t('rsvp.sending') : t('rsvp.sendRsvp')}
                    </button>
                    {error && (
                      <p style={{ marginTop: '0.75rem', color: '#c0392b', fontSize: '0.82rem', fontFamily: 'Jost, sans-serif', fontWeight: 300 }}>
                        {error}
                      </p>
                    )}
                  </div>
                </form>
              </div>

              {/* Alternative contact */}
              <div
                style={{
                  marginTop: '2.5rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid rgba(58,46,32,0.08)',
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    fontFamily: 'Jost, sans-serif',
                    fontWeight: 300,
                    fontSize: '0.75rem',
                    color: 'rgba(58,46,32,0.45)',
                    letterSpacing: '0.1em',
                    marginBottom: '0.75rem',
                  }}
                >
                  {t('rsvp.contactDirect')}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(0.75rem,3vw,1.5rem)', flexWrap: 'wrap' }}>
                  <a
                    href={`https://wa.me/${config.events.rsvp.phone1.replace(/[\s+]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: 'Jost, sans-serif',
                      fontWeight: 300,
                      fontSize: '0.8rem',
                      color: '#87A96B',
                      textDecoration: 'none',
                    }}
                    dir="ltr"
                  >
                    {config.events.rsvp.phone1}
                  </a>
                  <span style={{ color: 'rgba(135,169,107,0.3)' }}>·</span>
                  <a
                    href={`https://wa.me/${config.events.rsvp.phone2.replace(/[\s+]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: 'Jost, sans-serif',
                      fontWeight: 300,
                      fontSize: '0.8rem',
                      color: '#87A96B',
                      textDecoration: 'none',
                    }}
                    dir="ltr"
                  >
                    {config.events.rsvp.phone2}
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
              style={{ position: 'relative', textAlign: 'center', padding: 'clamp(3rem,8vw,5rem) 2rem' }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  border: '1.5px solid #87A96B',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  color: '#C41E3A',
                  margin: '0 auto 2rem',
                }}
              >
                {submittedAttendance === config.ui.rsvp.attendanceOptions[1] ? '✦' : '♡'}
              </div>
              <h3
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontWeight: 400,
                  fontSize: 'clamp(1.8rem,5vw,2.8rem)',
                  color: '#3a2e20',
                  marginBottom: '1rem',
                }}
              >
                {t('rsvp.thankYou')}
              </h3>
              <p
                style={{
                  fontFamily: 'Jost, sans-serif',
                  fontWeight: 300,
                  fontSize: '0.9rem',
                  color: 'rgba(58,46,32,0.6)',
                  lineHeight: 1.8,
                  maxWidth: '360px',
                  margin: '0 auto',
                }}
              >
                {submittedAttendance === config.ui.rsvp.attendanceOptions[1]
                  ? config.ui.rsvp.declineMessage
                  : config.ui.rsvp.successMessage}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}