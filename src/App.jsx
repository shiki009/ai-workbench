import { useState, useEffect } from 'react';
import { Header } from './components/Header.jsx';
import { Footer } from './components/Footer.jsx';
import { URLInput } from './components/URLInput.jsx';
import { ProgressSteps } from './components/ProgressSteps.jsx';
import { Results } from './components/Results.jsx';
import { SettingsModal, useSettings } from './components/SettingsModal.jsx';
import { useAnalysis } from './hooks/useAnalysis.js';
import { useRecentUrls } from './hooks/useRecentUrls.js';

export function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, updateSettings] = useSettings();
  const { state, steps, result, error, analyzedUrl, analyze, reset } = useAnalysis();
  const { add: addToHistory, get: getRecent } = useRecentUrls();
  const [recentUrls, setRecentUrls] = useState([]);

  useEffect(() => {
    setRecentUrls(getRecent());
  }, [state]);

  useEffect(() => {
    if (state === 'done' && analyzedUrl) {
      addToHistory(analyzedUrl);
      setRecentUrls(getRecent());
    }
  }, [state, analyzedUrl, addToHistory, getRecent]);

  const handleSubmit = (url) => {
    const { apiKeys, provider } = settings;
    analyze(url, apiKeys, provider);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onSettingsClick={() => setSettingsOpen(true)} />

      <main className="flex-1 flex flex-col items-center px-4 pt-12 pb-8">
        {/* Big headline */}
        {state === 'idle' && (
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="font-display text-6xl md:text-8xl uppercase tracking-wider text-foreground leading-none mb-4">
              Video Fact Checker
            </h2>
            <p className="text-muted text-base">
              Drop a TikTok or Instagram Reel URL. We'll transcribe it and fact-check the claims.
            </p>
          </div>
        )}

        {/* Loading headline */}
        {state === 'loading' && (
          <div className="text-center mb-8">
            <h2 className="font-display text-5xl md:text-7xl uppercase tracking-wider text-foreground leading-none mb-4">
              Checking...
            </h2>
          </div>
        )}

        {/* Results headline */}
        {state === 'done' && (
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="font-display text-5xl md:text-7xl uppercase tracking-wider text-foreground leading-none mb-4">
              Results
            </h2>
          </div>
        )}

        {/* Error headline */}
        {state === 'error' && (
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="font-display text-5xl md:text-7xl uppercase tracking-wider text-foreground leading-none mb-4">
              Oops
            </h2>
          </div>
        )}

        <div className="w-full max-w-xl">
          {/* URL Input — show on idle and loading */}
          {(state === 'idle' || state === 'loading') && (
            <URLInput
              onSubmit={handleSubmit}
              isLoading={state === 'loading'}
              recentUrls={recentUrls}
            />
          )}

          {/* Progress steps */}
          {state === 'loading' && <ProgressSteps steps={steps} />}

          {/* Results */}
          {state === 'done' && result && (
            <Results
              result={result}
              analyzedUrl={analyzedUrl}
              onReset={reset}
            />
          )}

          {/* Error */}
          {state === 'error' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-card border-2 border-foreground shadow-brutal p-4">
                {(() => {
                  const err = typeof error === 'object' ? error : { message: error, code: 'unknown' };
                  const titles = {
                    download: 'Download failed',
                    transcription: 'Transcription failed',
                    rate_limit: 'Rate limited',
                    analysis: 'Analysis failed',
                    unknown: 'Error',
                  };
                  return (
                    <>
                      <p className="text-sm text-false font-bold uppercase tracking-wide mb-1">
                        {titles[err.code] || titles.unknown}
                      </p>
                      <p className="text-sm text-foreground">{err.message}</p>
                    </>
                  );
                })()}
              </div>
              <button
                onClick={reset}
                className="w-full py-3 text-sm font-bold uppercase tracking-widest text-foreground border-2 border-foreground hover:bg-foreground hover:text-card transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdate={updateSettings}
      />
    </div>
  );
}
