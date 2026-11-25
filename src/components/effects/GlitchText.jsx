export default function GlitchText({
  as: Tag = 'h1',
  children,
  text,
  ambient = false,
  className = '',
  style = {},
  reducedMotion = false,
}) {
  const dataText =
    text || (typeof children === 'string' ? children : undefined);

  const glitchClass = reducedMotion
    ? ''
    : `sv-glitch-text chromatic-text ${ambient ? 'sv-glitch-ambient-loop' : ''}`;

  return (
    <Tag
      data-text={dataText}
      className={`font-comic ${glitchClass} ${className}`}
      style={{
        position: 'relative',
        margin: 0,
        lineHeight: 0.96,
        color: '#f7f4ff',
        WebkitTextStroke: '2px #05050a',
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
