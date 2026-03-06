import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import config from '@config';

/* ── Build the system prompt from wedding config ── */
const SYSTEM_PROMPT = `You are the warm and enthusiastic AI wedding assistant for Perla and Antonio's wedding celebration. 
Answer questions joyfully and concisely. Use the wedding details below to answer any guest questions.

══ COUPLE ══
Bride: ${config.couple.bride.fullName} (parents: ${config.couple.bride.parents})
Groom: ${config.couple.groom.fullName} (parents: ${config.couple.groom.parents})

══ CEREMONY ══
Date: Saturday, June 6, 2026 at ${config.events.ceremony.time}
Venue: ${config.events.ceremony.venue}
Address: ${config.events.ceremony.address}
Map: ${config.events.ceremony.mapUrl}

══ RECEPTION ══
Time: ${config.events.reception.time}
Venue: ${config.events.reception.venue}
Address: ${config.events.reception.address}
Map: ${config.events.reception.mapUrl}

══ RSVP ══
Deadline: May 20, 2026
Email: ${config.events.rsvp.email}
Phone: ${config.events.rsvp.phone1} or ${config.events.rsvp.phone2}

══ DAY SCHEDULE ══
${config.events.timeline.map(t => `• ${t.time} — ${t.title}: ${t.description}`).join('\n')}

══ FREQUENTLY ASKED QUESTIONS ══
${config.events.chatbot_faqs.map(q => `Q: ${q.question}\nA: ${q.answer}`).join('\n\n')}

══ ADDITIONAL GUIDELINES ══
${config.events.chatbot.customInstructions}

Keep replies concise, warm, and celebratory. Use occasional tasteful emojis. 
Do not reveal personal details beyond what's listed here.
If you don't know the answer, suggest contacting ${config.events.rsvp.email}.`;

const QUICK_QUESTIONS = [
  "What's the dress code?",
  "Where is the ceremony?",
  "What time to arrive?",
  "Is there parking?",
];

function ChatMessage({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '0.75rem',
      }}
    >
      {!isUser && (
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#2d6a4f,#40916c)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            flexShrink: 0,
            alignSelf: 'flex-end',
            marginRight: '0.5rem',
          }}
        >
          ♡
        </div>
      )}
      <div
        style={{
          maxWidth: '82%',
          padding: '0.6rem 0.9rem',
          ...(isUser
            ? {
                background: 'linear-gradient(135deg,#c9a84c,#f0d080)',
                color: '#050d0a',
                borderRadius: '18px 18px 4px 18px',
              }
            : {
                background: 'rgba(5,13,10,0.85)',
                color: '#faf8f0',
                border: '1px solid rgba(201,168,76,0.2)',
                borderRadius: '18px 18px 18px 4px',
              }),
        }}
      >
        <p
          style={{
            fontFamily: 'Jost, sans-serif',
            fontWeight: isUser ? 400 : 300,
            fontSize: '0.82rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
          }}
        >
          {msg.content}
          {msg.streaming && (
            <span
              style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#c9a84c',
                marginLeft: '3px',
                verticalAlign: 'middle',
                animation: 'blink 1s step-end infinite',
              }}
            />
          )}
        </p>
      </div>
    </motion.div>
  );
}

export default function ChatbotWidget() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: config.events.chatbot.welcomeMessage },
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef        = useRef(null);
  const inputRef              = useRef(null);

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const model  = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4.1-mini';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const sendMessage = useCallback(async (text) => {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;

    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // Placeholder streaming message
    const streamingId = Date.now();
    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: '', streaming: true, id: streamingId },
    ]);

    try {
      if (!apiKey) {
        // Fallback: simple FAQ matching without API
        const q = userText.toLowerCase();
        const faq = config.events.chatbot_faqs.find(f =>
          f.question.toLowerCase().split(' ').some(w => w.length > 3 && q.includes(w))
        );
        const reply = faq
          ? faq.answer
          : `Thank you for your question! Please contact us at ${config.events.rsvp.email} or call ${config.events.rsvp.phone1} for more details. We can't wait to celebrate with you! 💐`;

        // Simulate typing
        let displayed = '';
        for (const char of reply) {
          displayed += char;
          const finalDisplayed = displayed;
          setMessages(prev =>
            prev.map(m => m.id === streamingId ? { ...m, content: finalDisplayed } : m)
          );
          await new Promise(r => setTimeout(r, 12));
        }
        setMessages(prev => prev.map(m => m.id === streamingId ? { ...m, streaming: false, id: undefined } : m));
        setLoading(false);
        return;
      }

      // Real OpenAI streaming call
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          stream: true,
          max_tokens: 350,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...newMessages.map(m => ({ role: m.role, content: m.content })),
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText  = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk  = decoder.decode(value);
        const lines  = chunk.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            const delta  = parsed.choices?.[0]?.delta?.content ?? '';
            fullText += delta;
            const snapshot = fullText;
            setMessages(prev =>
              prev.map(m => m.id === streamingId ? { ...m, content: snapshot } : m)
            );
          } catch {
            // Ignore parse errors in stream chunks
          }
        }
      }

      setMessages(prev =>
        prev.map(m => m.id === streamingId ? { ...m, streaming: false, id: undefined } : m)
      );
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev =>
        prev.map(m =>
          m.id === streamingId
            ? {
                ...m,
                content: `I'm sorry, I had trouble answering that. Please reach out at ${config.events.rsvp.email} 💌`,
                streaming: false,
                id: undefined,
              }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading, apiKey, model]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1  }}
            exit={{   opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.25,0.46,0.45,0.94] }}
            style={{
              position: 'fixed',
              bottom: '5.5rem',
              right: 'clamp(1rem,3vw,2rem)',
              width: 'min(380px, calc(100vw - 2rem))',
              maxHeight: '70vh',
              zIndex: 4000,
              borderRadius: '16px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              background: '#0a1a12',
              border: '1px solid rgba(201,168,76,0.25)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '0.9rem 1.1rem',
                background: 'linear-gradient(135deg, rgba(45,106,79,0.5), rgba(5,13,10,0.8))',
                borderBottom: '1px solid rgba(201,168,76,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg,#c9a84c,#f0d080)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  flexShrink: 0,
                }}
              >
                💍
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: '1rem',
                    fontWeight: 400,
                    color: '#faf8f0',
                    lineHeight: 1.2,
                  }}
                >
                  Wedding Assistant
                </p>
                <p
                  style={{
                    fontFamily: 'Jost, sans-serif',
                    fontWeight: 200,
                    fontSize: '0.65rem',
                    color: 'rgba(201,168,76,0.7)',
                    letterSpacing: '0.1em',
                  }}
                >
                  Perla &amp; Antonio · June 6, 2026
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(250,248,240,0.5)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: '4px',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#faf8f0'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(250,248,240,0.5)'}
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(201,168,76,0.3) transparent',
              }}
            >
              {messages.map((msg, i) => (
                <ChatMessage key={msg.id ?? i} msg={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick questions (show only if no user msgs yet) */}
            {messages.filter(m => m.role === 'user').length === 0 && (
              <div
                style={{
                  padding: '0 0.75rem 0.5rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.4rem',
                }}
              >
                {QUICK_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    style={{
                      background: 'rgba(201,168,76,0.08)',
                      border: '1px solid rgba(201,168,76,0.25)',
                      color: 'rgba(201,168,76,0.8)',
                      padding: '0.3rem 0.7rem',
                      borderRadius: '20px',
                      fontFamily: 'Jost, sans-serif',
                      fontWeight: 300,
                      fontSize: '0.68rem',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      letterSpacing: '0.05em',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(201,168,76,0.18)';
                      e.currentTarget.style.color = '#c9a84c';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(201,168,76,0.08)';
                      e.currentTarget.style.color = 'rgba(201,168,76,0.8)';
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div
              style={{
                borderTop: '1px solid rgba(201,168,76,0.12)',
                padding: '0.75rem 0.75rem',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={config.events.chatbot.placeholderText}
                disabled={loading}
                style={{
                  flex: 1,
                  background: 'rgba(250,248,240,0.05)',
                  border: '1px solid rgba(201,168,76,0.2)',
                  borderRadius: '20px',
                  padding: '0.55rem 0.9rem',
                  fontFamily: 'Jost, sans-serif',
                  fontWeight: 300,
                  fontSize: '0.82rem',
                  color: '#faf8f0',
                  outline: 'none',
                  transition: 'border-color 0.3s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.2)'}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: loading || !input.trim()
                    ? 'rgba(201,168,76,0.2)'
                    : 'linear-gradient(135deg,#c9a84c,#f0d080)',
                  border: 'none',
                  cursor: loading || !input.trim() ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.3s ease',
                }}
                aria-label="Send"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#050d0a" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating button ── */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.5, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: 'clamp(1.5rem,4vw,2rem)',
          right: 'clamp(1rem,3vw,2rem)',
          zIndex: 4001,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: open
            ? 'rgba(5,13,10,0.9)'
            : 'linear-gradient(135deg,#c9a84c,#f0d080)',
          border: open ? '1px solid rgba(201,168,76,0.5)' : 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
          boxShadow: open
            ? '0 4px 20px rgba(0,0,0,0.4)'
            : '0 4px 20px rgba(201,168,76,0.4)',
          transition: 'background 0.3s, box-shadow 0.3s, border 0.3s',
        }}
        aria-label={open ? 'Close chat' : 'Open wedding assistant'}
      >
        {open ? (
          <span style={{ color: '#c9a84c', fontSize: '1rem' }}>✕</span>
        ) : (
          '💬'
        )}
      </motion.button>

      {/* Pulse ring (only when closed) */}
      {!open && (
        <div
          style={{
            position: 'fixed',
            bottom: 'clamp(1.5rem,4vw,2rem)',
            right: 'clamp(1rem,3vw,2rem)',
            zIndex: 4000,
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            border: '2px solid rgba(201,168,76,0.4)',
            animation: 'pulseGold 2.5s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
      )}
    </>
  );
}
