const STEP_CONFIG = [
  { key: 'downloading', label: 'Downloading video' },
  { key: 'transcribing', label: 'Transcribing audio' },
  { key: 'analyzing', label: 'Analyzing claims' },
];

function StepIcon({ status }) {
  if (status === 'done') {
    return (
      <div className="w-6 h-6 bg-foreground flex items-center justify-center">
        <svg className="w-3.5 h-3.5 text-card" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }

  if (status === 'active') {
    return (
      <div className="w-6 h-6 border-2 border-foreground flex items-center justify-center animate-pulse-dot">
        <div className="w-2 h-2 bg-foreground" />
      </div>
    );
  }

  return (
    <div className="w-6 h-6 border-2 border-border flex items-center justify-center">
      <div className="w-2 h-2 bg-border" />
    </div>
  );
}

export function ProgressSteps({ steps }) {
  return (
    <div className="flex flex-col gap-4 py-6">
      {STEP_CONFIG.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-3">
          <StepIcon status={steps[key]} />
          <span className={`text-sm uppercase tracking-wide ${
            steps[key] === 'active' ? 'text-foreground font-bold' :
            steps[key] === 'done' ? 'text-foreground' :
            'text-muted'
          }`}>
            {label}
            {steps[key] === 'active' && '...'}
          </span>
        </div>
      ))}
    </div>
  );
}
