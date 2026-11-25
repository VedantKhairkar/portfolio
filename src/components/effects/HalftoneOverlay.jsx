export default function HalftoneOverlay() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        background:
          'radial-gradient(circle at 50% 45%, transparent 45%, rgba(6, 0, 22, 0.7) 100%)',
      }}
    >
      {/* Corner Ben-Day dot accents for comic-page framing */}
      <div
        className="halftone-magenta"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '34vw',
          height: '30vh',
          maskImage: 'radial-gradient(ellipse at top left, black 12%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(ellipse at top left, black 12%, transparent 72%)',
          opacity: 0.72,
        }}
      />
      <div
        className="halftone-cyan"
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '38vw',
          height: '32vh',
          maskImage: 'radial-gradient(ellipse at bottom right, black 12%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(ellipse at bottom right, black 12%, transparent 72%)',
          opacity: 0.72,
        }}
      />

      {/* Subtle comic action speedlines along upper-right edge */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '28vw',
          height: '26vh',
          backgroundImage:
            'repeating-linear-gradient(-38deg, rgba(255,230,0,0.08) 0px, rgba(255,230,0,0.08) 2px, transparent 2px, transparent 14px)',
          maskImage: 'radial-gradient(ellipse at top right, black 5%, transparent 68%)',
          WebkitMaskImage: 'radial-gradient(ellipse at top right, black 5%, transparent 68%)',
        }}
      />

      {/* CMYK Comic Print Registration Crosshairs */}
      <span
        className="font-mono-tag"
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '14px',
          fontSize: '0.72rem',
          color: 'rgba(0, 240, 255, 0.55)',
          textShadow: '2px 0 0 rgba(255, 45, 149, 0.55)',
        }}
      >
        ⊕ CMYK // 12FPS
      </span>
    </div>
  );
}
