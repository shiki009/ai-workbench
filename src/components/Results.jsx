import { useState } from 'react';
import { ClaimCard } from './ClaimCard.jsx';

function ScoreRing({ score }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 70 ? 'var(--color-true)' : score >= 40 ? 'var(--color-misleading)' : 'var(--color-false)';

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-border)" strokeWidth="6" />
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="butt"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="score-ring-circle"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl text-foreground">{score}</span>
        <span className="text-xs text-muted uppercase tracking-wider">/ 100</span>
      </div>
    </div>
  );
}

const VERDICT_STYLES = {
  'Accurate': 'text-true',
  'Mostly Accurate': 'text-true',
  'Mixed': 'text-misleading',
  'Mostly False': 'text-false',
  'False': 'text-false',
  'No Factual Claims': 'text-muted',
};

export function Results({ result, onReset }) {
  const [showTranscript, setShowTranscript] = useState(false);

  const { truthScore, verdict, summary, claims, transcript } = result;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Score */}
      {truthScore !== null && (
        <div className="text-center space-y-3">
          <ScoreRing score={truthScore} />
          <p className={`text-lg font-bold uppercase tracking-widest ${VERDICT_STYLES[verdict] || 'text-muted'}`}>
            {verdict}
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="bg-card border-2 border-foreground shadow-brutal p-4">
        <p className="text-sm text-foreground">{summary}</p>
      </div>

      {/* Claims */}
      {claims.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Claims ({claims.length})</h3>
          {claims.map((claim, i) => (
            <ClaimCard key={i} {...claim} />
          ))}
        </div>
      )}

      {/* Transcript toggle */}
      {transcript && (
        <div>
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="text-sm font-bold text-foreground underline underline-offset-4 hover:text-muted transition-colors uppercase tracking-wider"
          >
            {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
          </button>
          {showTranscript && (
            <div className="mt-3 bg-card border-2 border-foreground shadow-brutal-sm p-4">
              <p className="text-sm text-muted whitespace-pre-wrap">{transcript}</p>
            </div>
          )}
        </div>
      )}

      {/* Reset button */}
      <button
        onClick={onReset}
        className="w-full py-4 text-sm font-bold uppercase tracking-widest text-foreground border-2 border-foreground shadow-brutal hover:bg-foreground hover:text-card transition-colors"
      >
        Check Another Video
      </button>
    </div>
  );
}
