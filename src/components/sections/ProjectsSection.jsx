import { useState } from 'react';
import { PROJECTS } from '../../data/portfolioData';
import GlitchText from '../effects/GlitchText';
import GlitchContainer from '../effects/GlitchContainer';

const ACCENT_STYLES = {
  magenta: { shadow: 'misprint-magenta', pill: '#ff2d95', pillText: '#f7f4ff' },
  cyan: { shadow: 'misprint-cyan', pill: '#00f0ff', pillText: '#05050a' },
  yellow: { shadow: 'misprint-coral', pill: '#ffe600', pillText: '#05050a' },
};

function ProjectComicCard({ project, reducedMotion, isMobile, onInspect }) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, hovered: false });
  const accent = ACCENT_STYLES[project.accent] || ACCENT_STYLES.cyan;

  const handleMouseMove = (event) => {
    if (reducedMotion || isMobile) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rx: Number((-py * 5.5).toFixed(2)),
      ry: Number((px * 6.5).toFixed(2)),
      hovered: true,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0, hovered: false });
  };

  // Outer wrapper handles crisp 3D angle; inner GlitchContainer handles movie slice-glitch cleanly
  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'flex',
        transform:
          reducedMotion || isMobile
            ? 'none'
            : `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(${tilt.hovered ? '8px' : '0px'})`,
        transition: tilt.hovered ? 'transform 0.08s steps(2, end)' : 'transform 0.2s ease-out',
        transformStyle: 'preserve-3d',
      }}
    >
      <GlitchContainer
        as="article"
        reducedMotion={reducedMotion}
        onClick={() => onInspect(project)}
        className={`comic-panel ${accent.shadow}`}
        style={{
          width: '100%',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.85rem',
          cursor: 'pointer',
        }}
      >
        <div>
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
                background: accent.pill,
                color: accent.pillText,
                border: '2px solid #05050a',
                padding: '0.18rem 0.55rem',
                fontSize: '0.74rem',
                fontWeight: 700,
                boxShadow: '2px 2px 0 #05050a',
              }}
            >
              {project.issue}
            </span>

            <span
              className="sfx-badge"
              style={{
                background: '#39ff9c',
                color: '#05050a',
                fontSize: '0.95rem',
                padding: '0.12rem 0.55rem',
              }}
            >
              {project.sfx}
            </span>
          </div>

          <GlitchText
            as="h3"
            text={project.title}
            reducedMotion={reducedMotion}
            style={{
              margin: '0 0 0.4rem',
              fontSize: '1.72rem',
              letterSpacing: '0.04em',
              color: '#f7f4ff',
              lineHeight: 1.06,
              WebkitTextStroke: '1px #05050a',
            }}
          >
            {project.title}
          </GlitchText>

          <p
            className={reducedMotion ? '' : 'sv-glitch-sub'}
            style={{
              margin: '0 0 0.72rem',
              fontSize: '0.84rem',
              fontWeight: 700,
              color: accent.pill === '#ffe600' ? '#ffe600' : accent.pill,
              lineHeight: 1.35,
            }}
          >
            {project.subtitle}
          </p>

          <p style={{ margin: '0 0 0.85rem', fontSize: '0.9rem', lineHeight: 1.5, color: '#e6deff' }}>
            {project.description}
          </p>

          <ul
            style={{
              margin: 0,
              paddingLeft: '1.1rem',
              display: 'grid',
              gap: '0.35rem',
              fontSize: '0.83rem',
              color: '#d4c9ff',
            }}
          >
            {project.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.4rem',
            paddingTop: '0.65rem',
            borderTop: '2px dashed rgba(255, 255, 255, 0.22)',
          }}
        >
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="font-mono-tag"
              style={{
                background: '#090024',
                border: '2px solid #05050a',
                boxShadow: `2px 2px 0 ${accent.pill}`,
                padding: '0.2rem 0.48rem',
                fontSize: '0.72rem',
                color: '#f7f4ff',
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </GlitchContainer>
    </div>
  );
}

export default function ProjectsSection({ reducedMotion, isMobile }) {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', paddingTop: '0.35rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flexWrap: 'wrap' }}>
        <GlitchText
          as="h2"
          text="FEATURED BUILDS"
          reducedMotion={reducedMotion}
          style={{ fontSize: 'clamp(2.3rem, 5.2vw, 3.9rem)' }}
        >
          FEATURED BUILDS
        </GlitchText>
        <span
          className={`sfx-badge ${reducedMotion ? '' : 'on-twos-bob'}`}
          style={{ background: '#00f0ff', fontSize: '1.05rem' }}
        >
          CLICK TO INSPECT!
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {PROJECTS.map((project) => (
          <ProjectComicCard
            key={project.id}
            project={project}
            reducedMotion={reducedMotion}
            isMobile={isMobile}
            onInspect={setSelectedProject}
          />
        ))}
      </div>

      {/* Interactive Comic Issue Dossier Modal */}
      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedProject.title}
          onClick={() => setSelectedProject(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 55,
            background: 'rgba(7, 0, 24, 0.82)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
        >
          <GlitchContainer
            reducedMotion={reducedMotion}
            onClick={(e) => e.stopPropagation()}
            className="comic-panel misprint-magenta"
            style={{
              maxWidth: '640px',
              width: '100%',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.95rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                className="font-mono-tag"
                style={{
                  background: '#ffe600',
                  color: '#05050a',
                  border: '2px solid #05050a',
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}
              >
                {selectedProject.issue} // DOSSIER
              </span>
              <button
                type="button"
                className="comic-btn"
                onClick={() => setSelectedProject(null)}
                style={{ padding: '0.3rem 0.8rem', fontSize: '0.95rem', background: '#ff4d2e', color: '#ffe600' }}
              >
                CLOSE ✕
              </button>
            </div>

            <GlitchText
              as="h3"
              text={selectedProject.title}
              reducedMotion={reducedMotion}
              style={{ fontSize: '2.15rem', WebkitTextStroke: '1.5px #05050a' }}
            >
              {selectedProject.title}
            </GlitchText>

            <p style={{ margin: 0, color: '#00f0ff', fontWeight: 700, fontSize: '0.96rem' }}>
              {selectedProject.subtitle}
            </p>

            <div className="caption-box" style={{ padding: '0.9rem 1rem', fontSize: '0.95rem', fontWeight: 500 }}>
              <p style={{ margin: 0 }}>{selectedProject.description}</p>
            </div>

            <ul style={{ margin: 0, paddingLeft: '1.15rem', display: 'grid', gap: '0.45rem', color: '#f7f4ff' }}>
              {selectedProject.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {selectedProject.stack.map((tech) => (
                <span
                  key={tech}
                  className="font-mono-tag"
                  style={{
                    background: '#090024',
                    border: '2px solid #05050a',
                    boxShadow: '2px 2px 0 #39ff9c',
                    padding: '0.25rem 0.55rem',
                    fontSize: '0.75rem',
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </GlitchContainer>
        </div>
      )}
    </section>
  );
}
