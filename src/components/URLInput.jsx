import { useState } from 'react';
import { normalizeVideoUrl, isValidVideoUrl } from '../utils/url.js';

export function URLInput({ onSubmit, isLoading }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handlePaste = (e) => {
    const pasted = (e.clipboardData?.getData('text') ?? '').trim();
    if (!pasted) return;
    const normalized = normalizeVideoUrl(pasted);
    if (normalized !== pasted) {
      e.preventDefault();
      setUrl(normalized);
      setError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const normalized = normalizeVideoUrl(url);
    if (!normalized) {
      setError('Please enter a URL');
      return;
    }

    if (!isValidVideoUrl(normalized)) {
      setError('Please enter a valid TikTok or Instagram Reel URL');
      return;
    }

    onSubmit(normalized);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="flex w-full border-2 border-foreground shadow-brutal">
        <input
          type="url"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(''); }}
          onPaste={handlePaste}
          placeholder="Paste TikTok or Instagram Reel URL"
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
    </form>
  );
}
