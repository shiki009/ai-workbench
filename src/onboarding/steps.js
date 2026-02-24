export const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to AI Workbench',
    description: 'Run AI models locally in your browser. No server required. Your data never leaves your device.',
    action: null,
  },
  {
    id: 'capabilities',
    title: 'Checking Your Device',
    description: 'Detecting GPU, storage, and browser capabilities...',
    action: 'detect-capabilities',
  },
  {
    id: 'tools',
    title: 'AI Tools',
    description: 'Select a tool from the <strong>sidebar</strong> to get started. Press <strong>E</strong> to toggle it. Each tool runs a different AI model directly in your browser.',
    action: null,
  },
  {
    id: 'ready',
    title: 'You\'re Ready!',
    description: 'Pick a tool and click <strong>Load Model</strong>. Models download on first use and are cached for future sessions.',
    action: null,
  },
];
