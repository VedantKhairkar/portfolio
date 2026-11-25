import { SECTIONS } from '../../data/portfolioData';

export default function Navbar({ activeSection, onNavigate, reducedMotion }) {
  return (
    <header
      style={{
        position: 'relative',
        zIndex: 20,
        width: '100%',
        padding: '0.75rem 1.25rem 0.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.65rem',
      }}
    >
      {/* Diegetic Dimension / Identity Badge */}
      <button
        type="button"
        onClick={() => onNavigate('home')}
        className={reducedMotion ? '' : 'micro-glitch-hover'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.55rem',
          background: 'rgba(13, 0, 44, 0.85)',
          backdropFilter: 'blur(6px)',
          color: '#f7f4ff',
          border: '3px solid #05050a',
          boxShadow: '4px 4px 0 #05050a, 7px 7px 0 #ff2d95',
          padding: '0.35rem 0.78rem',
          cursor: 'pointer',
          fontFamily: 'var(--font-display)',
          fontSize: '1.15rem',
          letterSpacing: '0.06em',
        }}
        aria-label="Go to Home"
      >
        <span
          style={{
            background: '#ffe600',
            color: '#05050a',
            padding: '0.04rem 0.42rem',
            border: '2px solid #05050a',
            fontSize: '0.9rem',
          }}
        >
          VK
        </span>
        <span className={reducedMotion ? '' : 'chromatic-subtle'}>EARTH-VPK</span>
      </button>

      {/* Spatial District Switcher */}
      <nav aria-label="Primary navigation" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
        {SECTIONS.map((sec) => {
          const isActive = sec.id === activeSection;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => onNavigate(sec.id)}
              aria-current={isActive ? 'page' : undefined}
              className={reducedMotion ? '' : 'micro-glitch-hover'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.36rem 0.78rem',
                border: '3px solid #05050a',
                background: isActive ? '#ffe600' : 'rgba(13, 0, 44, 0.82)',
                backdropFilter: 'blur(6px)',
                color: isActive ? '#05050a' : '#f7f4ff',
                boxShadow: isActive
                  ? '4px 4px 0 #05050a, 7px 7px 0 #00f0ff'
                  : '3px 3px 0 #05050a',
                fontFamily: 'var(--font-display)',
                fontSize: '1.02rem',
                letterSpacing: '0.06em',
                cursor: 'pointer',
                transform: isActive ? 'translate(-2px, -2px)' : 'none',
              }}
            >
              <span
                className="font-mono-tag"
                style={{
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  opacity: isActive ? 0.95 : 0.72,
                }}
              >
                #{sec.issue}
              </span>
              <span>{sec.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
