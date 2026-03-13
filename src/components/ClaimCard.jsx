const VERDICT_STYLES = {
  TRUE: { bg: 'bg-true', text: 'text-card', label: 'TRUE' },
  FALSE: { bg: 'bg-false', text: 'text-card', label: 'FALSE' },
  MISLEADING: { bg: 'bg-misleading', text: 'text-card', label: 'MISLEADING' },
  UNVERIFIABLE: { bg: 'bg-unverifiable', text: 'text-card', label: 'UNVERIFIABLE' },
};

const SOURCE_LABELS = {
  'audio': 'SPOKEN',
  'on-screen': 'ON-SCREEN',
  'both': 'SPOKEN + ON-SCREEN',
};

export function ClaimCard({ claim, verdict, explanation, source, sources }) {
  const style = VERDICT_STYLES[verdict] || VERDICT_STYLES.UNVERIFIABLE;
  const links = Array.isArray(sources) ? sources.filter(Boolean) : [];

  return (
    <div className="bg-card border-2 border-foreground shadow-brutal-sm p-4 animate-fade-in">
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-sm font-bold text-foreground flex-1">{claim}</p>
        <span className={`text-xs font-bold px-3 py-1 ${style.bg} ${style.text} uppercase tracking-wider shrink-0`}>
          {style.label}
        </span>
      </div>
      <p className="text-sm text-muted">{explanation}</p>
      {source && (
        <p className="text-xs text-muted mt-2 uppercase tracking-wider">
          Source: {SOURCE_LABELS[source] || source}
        </p>
      )}
      {links.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {links.map((href, i) => (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-foreground underline underline-offset-2 hover:text-muted"
            >
              Source {i + 1}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
