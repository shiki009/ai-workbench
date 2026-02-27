import { useState, useEffect } from 'react';

const PROVIDERS = [
  { key: 'groq', label: 'Groq', description: 'Free tier — Llama 3.3 70B' },
  { key: 'openai', label: 'OpenAI', description: 'GPT-4o Mini' },
  { key: 'claude', label: 'Claude', description: 'Claude Sonnet' },
];

function loadSettings() {
  try {
    const saved = localStorage.getItem('vfc-settings');
    return saved ? JSON.parse(saved) : { provider: 'groq', apiKeys: {} };
  } catch {
    return { provider: 'groq', apiKeys: {} };
  }
}

function saveSettings(settings) {
  localStorage.setItem('vfc-settings', JSON.stringify(settings));
}

export function useSettings() {
  const [settings, setSettings] = useState(loadSettings);

  const updateSettings = (updates) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      saveSettings(next);
      return next;
    });
  };

  return [settings, updateSettings];
}

export function SettingsModal({ isOpen, onClose, settings, onUpdate }) {
  const [keys, setKeys] = useState(settings.apiKeys);
  const [provider, setProvider] = useState(settings.provider);

  useEffect(() => {
    setKeys(settings.apiKeys);
    setProvider(settings.provider);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdate({ provider, apiKeys: keys });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40" onClick={onClose}>
      <div className="bg-card border-2 border-foreground shadow-brutal w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-3xl uppercase text-foreground">Settings</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Provider selector */}
        <div className="mb-6">
          <label className="text-sm font-bold text-foreground uppercase tracking-wider mb-2 block">Fact-Check Provider</label>
          <div className="grid grid-cols-3 gap-2">
            {PROVIDERS.map(p => (
              <button
                key={p.key}
                onClick={() => setProvider(p.key)}
                className={`px-3 py-2 text-sm font-bold border-2 transition-all uppercase tracking-wide ${
                  provider === p.key
                    ? 'border-foreground bg-foreground text-card'
                    : 'border-border text-muted hover:border-foreground'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted mt-2">
            {PROVIDERS.find(p => p.key === provider)?.description}
          </p>
        </div>

        {/* API keys */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm font-bold text-foreground uppercase tracking-wider mb-1 block">
              Groq API Key <span className="text-false">*</span>
            </label>
            <p className="text-xs text-muted mb-2">Required for transcription (Whisper)</p>
            <input
              type="password"
              value={keys.groq || ''}
              onChange={e => setKeys({ ...keys, groq: e.target.value })}
              placeholder="gsk_..."
              className="w-full px-3 py-2 border-2 border-foreground text-sm bg-card text-foreground placeholder:text-muted focus:outline-none focus:shadow-brutal-sm"
            />
          </div>

          {provider !== 'groq' && (
            <div>
              <label className="text-sm font-bold text-foreground uppercase tracking-wider mb-1 block">
                {PROVIDERS.find(p => p.key === provider)?.label} API Key
              </label>
              <input
                type="password"
                value={keys[provider] || ''}
                onChange={e => setKeys({ ...keys, [provider]: e.target.value })}
                placeholder={provider === 'openai' ? 'sk-...' : 'sk-ant-...'}
                className="w-full px-3 py-2 border-2 border-foreground text-sm bg-card text-foreground placeholder:text-muted focus:outline-none focus:shadow-brutal-sm"
              />
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 bg-foreground text-card font-bold text-sm uppercase tracking-widest hover:bg-muted transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
