import { useState } from 'react';
import { prepareVideoUrl, isValidVideoUrl } from '../utils/url.js';

const EXAMPLE_LINKS = [
  { label: 'YouTube Shorts', url: 'https://www.youtube.com/shorts/O9wLadU2joc' },
  { label: 'Random', url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ' },
];

export function URLInput({ onSubmit, isLoading }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handlePaste = (e) => {
    const pasted = (e.clipboardData?.getData('text') ?? '').trim();
    if (!pasted) return;
    const prepared = prepareVideoUrl(pasted);
    if (prepared !== pasted) {
      e.preventDefault();
      setUrl(prepared);
      setError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const prepared = prepareVideoUrl(url);
    if (!prepared) {
      setError('Please enter a URL');
      return;
    }

    if (!isValidVideoUrl(prepared)) {
      setError('Please enter a valid TikTok, Instagram Reel, or YouTube Shorts URL');
      return;
    }

    onSubmit(prepared);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="flex w-full border-2 border-foreground shadow-brutal">
        <input
          type="url"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(''); }}
          onPaste={handlePaste}
          placeholder="Paste TikTok, Instagram Reel, or YouTube Shorts URL"
          autoComplete="url"
          disabled={isLoading}
          className="flex-1 px-4 py-4 bg-card text-sm text-foreground placeholder:text-muted focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-4 bg-foreground text-card font-bold text-sm uppercase tracking-widest hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          {isLoading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : 'Check It'}
        </button>
      </div>
      {error && (
        <p className="mt-3 text-sm font-bold text-false">{error}</p>
      )}
      <p className="mt-4 text-xs text-muted uppercase tracking-wider mb-2">Try with</p>
      <div className="flex flex-wrap gap-2">
        {EXAMPLE_LINKS.map(({ label, url }) => (
          <button
            key={url}
            type="button"
            onClick={() => {
              setUrl(url);
              setError('');
            }}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs font-medium uppercase tracking-wide border border-muted text-muted hover:border-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-muted/80">
        No results? Video may be age-restricted, private, have no speech, or platform may be rate-limiting.
      </p>
    </form>
  );
}
