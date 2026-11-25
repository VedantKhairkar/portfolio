export default function SectionWrapper({ children, label }) {
  return (
    <main className="section-viewport" aria-label={label}>
      <div className="section-scroll">{children}</div>
    </main>
  );
}
