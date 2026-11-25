import { useState } from 'react';
import { CONTACTS } from '../../data/portfolioData';
import GlitchText from '../effects/GlitchText';
import GlitchContainer from '../effects/GlitchContainer';

const BUBBLE_THEME = {
  yellow: { bg: '#ffe600', text: '#05050a', tail: '#ffe600', shadow: 'misprint-magenta' },
  cyan: { bg: '#00f0ff', text: '#05050a', tail: '#00f0ff', shadow: 'misprint-coral' },
  magenta: { bg: '#ff2d95', text: '#f7f4ff', tail: '#ff2d95', shadow: 'misprint-cyan' },
};

export default function ContactSection({ reducedMotion }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = async (item) => {
    if (!item.copyable || !navigator?.clipboard) return;
    try {
      await navigator.clipboard.writeText(item.value);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Clipboard blocked; anchor href still opens mail client
    }
  };

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        minHeight: '100%',
        paddingBottom: 'clamp(0.75rem, 3vh, 2rem)',
        gap: '1.25rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flexWrap: 'wrap' }}>
        <GlitchText
          as="h2"
          text="SIGNAL ME"
          reducedMotion={reducedMotion}
          style={{ fontSize: 'clamp(2.3rem, 5.2vw, 3.9rem)' }}
        >
          SIGNAL ME
        </GlitchText>
        <span
          className={`sfx-badge ${reducedMotion ? '' : 'on-twos-bob'}`}
          style={{ background: '#39ff9c', color: '#05050a', fontSize: '1.05rem' }}
        >
          PING!
        </span>
      </div>

      <GlitchContainer
        reducedMotion={reducedMotion}
        className="caption-box"
        style={{
          maxWidth: '640px',
          padding: '0.85rem 1.1rem',
          fontSize: '0.96rem',
          lineHeight: 1.5,
          overflow: 'hidden',
        }}
      >
        <p style={{ margin: 0 }}>
          Looking for a Data Scientist, AI/ML Engineer, or Data Engineer? Pick a speech bubble
          below to connect or inspect my code.
        </p>
      </GlitchContainer>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
          paddingBottom: '0.75rem',
        }}
      >
        {CONTACTS.map((contact) => {
          const theme = BUBBLE_THEME[contact.accent] || BUBBLE_THEME.cyan;
          const isCopied = copiedId === contact.id;

          return (
            <div key={contact.id} style={{ position: 'relative', paddingBottom: '18px' }}>
              <GlitchContainer
                as="a"
                reducedMotion={reducedMotion}
                href={contact.href}
                target={contact.id === 'email' ? undefined : '_blank'}
                rel={contact.id === 'email' ? undefined : 'noreferrer noopener'}
                onClick={() => handleCopy(contact)}
                className={theme.shadow}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  padding: '1.2rem 1.25rem',
                  background: theme.bg,
                  color: theme.text,
                  border: '3.5px solid #05050a',
                  borderRadius: '18px',
                  textDecoration: 'none',
                  zIndex: 2,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                  }}
                >
                  <span
                    className="font-mono-tag"
                    style={{
                      background: '#05050a',
                      color: '#ffe600',
                      padding: '0.18rem 0.55rem',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}
                  >
                    {contact.label}
                  </span>
                  <span
                    className="font-comic sv-glitch-sub"
                    style={{ fontSize: '1.15rem', letterSpacing: '0.05em' }}
                  >
                    {isCopied ? 'COPIED!' : contact.bubbleTitle}
                  </span>
                </div>

                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    wordBreak: 'break-word',
                    marginTop: '0.2rem',
                  }}
                >
                  <span>{contact.value}</span>
                </div>

                <div style={{ fontSize: '0.82rem', opacity: 0.88, fontWeight: 600 }}>
                  <span>{contact.note} →</span>
                </div>
              </GlitchContainer>

              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: '34px',
                  bottom: '2px',
                  width: '24px',
                  height: '24px',
                  background: theme.tail,
                  borderRight: '3.5px solid #05050a',
                  borderBottom: '3.5px solid #05050a',
                  transform: 'rotate(45deg)',
                  zIndex: 1,
                }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
