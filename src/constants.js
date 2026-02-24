// Tool types
export const TOOL_TYPES = {
  IMAGE_CLASSIFIER: 'image-classifier',
  TEXT_GENERATOR: 'text-generator',
  IMAGE_GENERATOR: 'image-generator',
};

// Events
export const EVENTS = {
  TOOL_ACTIVATE: 'tool:activate',
  TOOL_DEACTIVATE: 'tool:deactivate',
  MODEL_DOWNLOAD_START: 'model:download:start',
  MODEL_DOWNLOAD_PROGRESS: 'model:download:progress',
  MODEL_DOWNLOAD_COMPLETE: 'model:download:complete',
  MODEL_READY: 'model:ready',
  INFERENCE_START: 'inference:start',
  INFERENCE_PROGRESS: 'inference:progress',
  INFERENCE_COMPLETE: 'inference:complete',
  WORKSPACE_SAVE: 'workspace:save',
  WORKSPACE_LOAD: 'workspace:load',
  SETTINGS_CHANGED: 'settings:changed',
  TOAST: 'toast:show',
};

// Storage keys
export const STORAGE = {
  DB_NAME: 'ai-workbench',
  DB_VERSION: 1,
  STORE_WORKSPACE: 'workspace',
  STORE_HISTORY: 'history',
  STORE_IMAGES: 'images',
  PREFS_KEY: 'aw-preferences',
};

// Device tiers
export const DEVICE_TIER = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};
