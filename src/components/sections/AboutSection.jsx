import { PROFILE, SKILL_GROUPS } from '../../data/portfolioData';
import GlitchText from '../effects/GlitchText';
import GlitchContainer from '../effects/GlitchContainer';

const ACCENT_MAP = {
  magenta: { border: 'misprint-magenta', badge: '#ff2d95', badgeText: '#f7f4ff' },
  cyan: { border: 'misprint-cyan', badge: '#00f0ff', badgeText: '#05050a' },
  yellow: { border: 'misprint-coral', badge: '#ffe600', badgeText: '#05050a' },
};

export default function AboutSection({ reducedMotion }) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.15rem',
        paddingTop: '0.35rem',
      }}
    >
      {/* Floating Comic Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flexWrap: 'wrap' }}>
        <GlitchText
          as="h2"
          text="ABOUT ME"
          reducedMotion={reducedMotion}
          style={{ fontSize: 'clamp(2.3rem, 5.2vw, 3.9rem)' }}
        >
          ABOUT ME
        </GlitchText>
        <span
          className={`sfx-badge ${reducedMotion ? '' : 'on-twos-bob'}`}
          style={{ background: '#ff4d2e', color: '#ffe600', fontSize: '1.1rem' }}
        >
          ORIGIN!
        </span>
      </div>

      {/* Staggered Asymmetric Comic Spread */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.15rem',
          alignItems: 'start',
        }}
      >
        {/* Panel 1: Main Bio Panel */}
        <GlitchContainer
          as="article"
          reducedMotion={reducedMotion}
          className="comic-panel misprint-magenta"
          style={{ padding: '1.25rem' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
            }}
          >
            <span
              className="font-mono-tag"
              style={{
                background: '#ff2d95',
                color: '#f7f4ff',
                border: '2px solid #05050a',
                padding: '0.18rem 0.55rem',
                fontSize: '0.74rem',
                fontWeight: 700,
              }}
            >
              PANEL 01 // NARRATIVE BIO
            </span>
            <GlitchText
              as="span"
              text="DATA + AI"
              reducedMotion={reducedMotion}
              style={{ fontSize: '1.15rem', color: '#ffe600', WebkitTextStroke: '1px #05050a' }}
            >
              DATA + AI
            </GlitchText>
          </div>

          <div
            className="caption-box"
            style={{
              padding: '0.95rem 1.05rem',
              lineHeight: 1.6,
              fontSize: '0.96rem',
              fontWeight: 500,
            }}
          >
            <p style={{ margin: 0 }}>{PROFILE.bio}</p>
          </div>
        </GlitchContainer>

        {/* Panel 2: Identity & Telemetry — whole box & ALL fields glitch on hover */}
        <GlitchContainer
          as="aside"
          reducedMotion={reducedMotion}
          className="comic-panel misprint-cyan"
          style={{
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.9rem',
          }}
        >
          <div
            className="font-mono-tag"
            style={{
              alignSelf: 'flex-start',
              background: '#00f0ff',
              color: '#05050a',
              border: '2px solid #05050a',
              padding: '0.18rem 0.55rem',
              fontSize: '0.74rem',
              fontWeight: 700,
            }}
          >
            PANEL 02 // PROFILE TELEMETRY
          </div>

          <dl style={{ margin: 0, display: 'grid', gap: '0.68rem', fontSize: '0.94rem' }}>
            <div>
              <dt className="font-mono-tag" style={{ color: '#ffe600', fontSize: '0.72rem' }}>
                ALIAS
              </dt>
              <dd style={{ margin: '0.1rem 0 0', fontWeight: 700 }}>
                {PROFILE.name}
              </dd>
            </div>
            <div>
              <dt className="font-mono-tag" style={{ color: '#00f0ff', fontSize: '0.72rem' }}>
                DISCIPLINES
              </dt>
              <dd style={{ margin: '0.1rem 0 0', fontWeight: 600 }}>
                {PROFILE.roles.join(' • ')}
              </dd>
            </div>
            <div>
              <dt className="font-mono-tag" style={{ color: '#ff4d2e', fontSize: '0.72rem' }}>
                CORE FOCUS
              </dt>
              <dd style={{ margin: '0.1rem 0 0', fontWeight: 500 }}>
                Computer Science Graduate • Machine Learning, Data Engineering &amp; Web Systems
              </dd>
            </div>
          </dl>

          <div
            className="font-mono-tag"
            style={{
              background: 'rgba(5, 5, 10, 0.8)',
              border: '2px solid #39ff9c',
              padding: '0.5rem 0.7rem',
              fontSize: '0.76rem',
              color: '#39ff9c',
            }}
          >
            <span>STATUS: {PROFILE.status}</span>
          </div>
        </GlitchContainer>
      </div>

      {/* Skill Comic Panels — every container & every skill chip glitches on hover */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.1rem',
        }}
      >
        {SKILL_GROUPS.map((group) => {
          const theme = ACCENT_MAP[group.accent] || ACCENT_MAP.cyan;
          return (
            <GlitchContainer
              key={group.id}
              reducedMotion={reducedMotion}
              className={`comic-panel ${theme.border}`}
              style={{ padding: '1.1rem' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.8rem',
                }}
              >
                <GlitchText
                  as="h3"
                  text={group.title}
                  reducedMotion={reducedMotion}
                  style={{
                    fontSize: '1.45rem',
                    letterSpacing: '0.05em',
                    color: '#f7f4ff',
                    WebkitTextStroke: '1px #05050a',
                  }}
                >
                  {group.title}
                </GlitchText>
                <span
                  className="sfx-badge"
                  style={{
                    background: theme.badge,
                    color: theme.badgeText,
                    fontSize: '0.86rem',
                    padding: '0.1rem 0.5rem',
                  }}
                >
                  {group.sfx}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="font-mono-tag"
                    style={{
                      background: 'rgba(10, 0, 34, 0.92)',
                      border: '2px solid #05050a',
                      boxShadow: `2px 2px 0 ${theme.badge}`,
                      padding: '0.26rem 0.52rem',
                      fontSize: '0.75rem',
                      color: '#f7f4ff',
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </GlitchContainer>
          );
        })}
      </div>
    </section>
  );
}
