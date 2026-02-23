export const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Spatial AI Workbench',
    description: 'A 3D workspace where AI tools run locally in your browser. No server. No data leaves your device.',
    action: null,
  },
  {
    id: 'capabilities',
    title: 'Checking Your Device',
    description: 'Detecting GPU, storage, and browser capabilities...',
    action: 'detect-capabilities',
  },
  {
    id: 'navigation',
    title: 'Navigation',
    description: 'Click to enter the workspace. Use WASD to move and mouse to look around. Press ESC to release the cursor.',
    action: null,
  },
  {
    id: 'tools',
    title: 'AI Tools',
    description: 'Press E to open the Tool Shelf. Click a tool to spawn it as a floating 3D panel. Each tool runs a different AI model.',
    action: null,
  },
  {
    id: 'ready',
    title: 'You\'re Ready!',
    description: 'Start by pressing E to open the Tool Shelf and selecting an AI tool. Models download on first use and are cached for future sessions.',
    action: null,
  },
];
