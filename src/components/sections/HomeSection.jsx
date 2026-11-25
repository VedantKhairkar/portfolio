import { PROFILE } from '../../data/portfolioData';
import GlitchText from '../effects/GlitchText';
import GlitchContainer from '../effects/GlitchContainer';

export default function HomeSection({ onNavigate, reducedMotion }) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        minHeight: '100%',
        paddingBottom: 'clamp(0.75rem, 3vh, 2.25rem)',
        gap: '1rem',
      }}
    >
      {/* Floating Comic Telemetry Pill */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <span
          className="font-mono-tag"
          style={{
            background: '#00f0ff',
            color: '#05050a',
            border: '2.5px solid #05050a',
            padding: '0.22rem 0.68rem',
            fontWeight: 700,
            fontSize: '0.76rem',
            boxShadow: '3px 3px 0 #05050a, 6px 6px 0 #ff4d2e',
          }}
        >
          SECTOR #00 // {PROFILE.status}
        </span>

        <span
          className={`sfx-badge ${reducedMotion ? '' : 'on-twos-bob'}`}
          style={{ background: '#ff2d95', color: '#f7f4ff', fontSize: '1.05rem' }}
        >
          ACROSS THE DATA-VERSE!
        </span>
      </div>

      {/* Hero Title Floating Directly Over the 3D Skyline */}
      <div style={{ maxWidth: '920px' }}>
        <GlitchText
          as="h1"
          ambient={!reducedMotion}
          reducedMotion={reducedMotion}
          text={PROFILE.name}
          style={{
            fontSize: 'clamp(2.35rem, 8.2vw, 6.4rem)',
            letterSpacing: '0.04em',
            marginBottom: '0.65rem',
            overflowWrap: 'break-word',
            filter: 'drop-shadow(0 8px 18px rgba(5, 0, 20, 0.78))',
          }}
        >
          Vedant.<wbr />P.<wbr />Khairkar
        </GlitchText>

        {/* Subheading Role Strip */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.55rem',
            marginBottom: '0.95rem',
          }}
        >
          {PROFILE.roles.map((role, index) => {
            const bgColors = ['#ffe600', '#00f0ff', '#ff4d2e'];
            const textColors = ['#05050a', '#05050a', '#f7f4ff'];
            return (
              <span
                key={role}
                className={`font-mono-tag ${reducedMotion ? '' : 'sv-glitch-sub'}`}
                style={{
                  background: bgColors[index % bgColors.length],
                  color: textColors[index % textColors.length],
                  border: '2.5px solid #05050a',
                  boxShadow: '3px 3px 0 #05050a',
                  padding: '0.26rem 0.72rem',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'default',
                }}
              >
                {role}
              </span>
            );
          })}
        </div>
      </div>

      {/* Compact Comic Caption Panel + Actions */}
      <GlitchContainer
        reducedMotion={reducedMotion}
        className="comic-panel misprint-cyan"
        style={{
          padding: '1.05rem 1.25rem',
          maxWidth: '640px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.95rem',
        }}
      >
        <p
          className={reducedMotion ? '' : 'sv-glitch-sub'}
          style={{
            margin: 0,
            fontSize: 'clamp(0.95rem, 1.7vw, 1.08rem)',
            lineHeight: 1.5,
            fontWeight: 600,
            color: '#f7f4ff',
          }}
        >
          {PROFILE.shortTagline}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', alignItems: 'center' }}>
          <button
            type="button"
            className="comic-btn"
            onClick={() => onNavigate('projects')}
          >
            EXPLORE BUILDS →
          </button>

          <button
            type="button"
            className="comic-btn"
            onClick={() => onNavigate('about')}
            style={{
              background: '#00f0ff',
              boxShadow: '4px 4px 0 #05050a, 7px 7px 0 #ff2d95',
            }}
          >
            ORIGIN STORY
          </button>

          <button
            type="button"
            onClick={() => onNavigate('contact')}
            className={`font-mono-tag ${reducedMotion ? '' : 'micro-glitch-hover'}`}
            style={{
              background: 'transparent',
              color: '#39ff9c',
              border: '2px solid #39ff9c',
              padding: '0.45rem 0.75rem',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            SCROLL / WARP ▼
          </button>
        </div>
      </GlitchContainer>
    </section>
  );
}
