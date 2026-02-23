// Colors
export const COLORS = {
  BG: 0x0a0a1a,
  CYAN: 0x00d4ff,
  PURPLE: 0x9b59ff,
  WARM_WHITE: 0xffe4c4,
  PANEL_BG: 'rgba(10, 14, 30, 0.65)',
  PANEL_BORDER: 'rgba(0, 212, 255, 0.4)',
  TEXT_PRIMARY: '#e0e0e0',
  TEXT_ACCENT: '#00d4ff',
  TEXT_SECONDARY: '#9b59ff',
  FLOOR_GRID: 0x00d4ff,
  WALL_BASE: 0x111128,
  CEILING: 0x080818,
};

// Room dimensions
export const ROOM = {
  WIDTH: 10,
  HEIGHT: 6,
  DEPTH: 10,
};

// Panel defaults
export const PANEL = {
  DEFAULT_WIDTH: 2.0,
  DEFAULT_HEIGHT: 1.5,
  MIN_WIDTH: 1.0,
  MIN_HEIGHT: 0.8,
  MAX_WIDTH: 4.0,
  MAX_HEIGHT: 3.0,
  TITLE_BAR_HEIGHT: 0.12,
  BORDER_WIDTH: 0.008,
  CORNER_RADIUS: 0.02,
  SPAWN_DISTANCE: 3.0,
  SPAWN_HEIGHT: 1.6,
};

// Tool types
export const TOOL_TYPES = {
  IMAGE_CLASSIFIER: 'image-classifier',
  TEXT_GENERATOR: 'text-generator',
  IMAGE_GENERATOR: 'image-generator',
};

// Events
export const EVENTS = {
  PANEL_SPAWN: 'panel:spawn',
  PANEL_CLOSE: 'panel:close',
  PANEL_FOCUS: 'panel:focus',
  PANEL_MINIMIZE: 'panel:minimize',
  PANEL_RESTORE: 'panel:restore',
  TOOL_ACTIVATE: 'tool:activate',
  TOOL_DEACTIVATE: 'tool:deactivate',
  MODEL_DOWNLOAD_START: 'model:download:start',
  MODEL_DOWNLOAD_PROGRESS: 'model:download:progress',
  MODEL_DOWNLOAD_COMPLETE: 'model:download:complete',
  MODEL_READY: 'model:ready',
  INFERENCE_START: 'inference:start',
  INFERENCE_PROGRESS: 'inference:progress',
  INFERENCE_COMPLETE: 'inference:complete',
  PIPELINE_CONNECT: 'pipeline:connect',
  PIPELINE_DISCONNECT: 'pipeline:disconnect',
  PIPELINE_DATA: 'pipeline:data',
  CAMERA_LOCK: 'camera:lock',
  CAMERA_UNLOCK: 'camera:unlock',
  WORKSPACE_SAVE: 'workspace:save',
  WORKSPACE_LOAD: 'workspace:load',
};

// Storage keys
export const STORAGE = {
  DB_NAME: 'spatial-ai-workbench',
  DB_VERSION: 1,
  STORE_WORKSPACE: 'workspace',
  STORE_HISTORY: 'history',
  STORE_IMAGES: 'images',
  PREFS_KEY: 'saw-preferences',
};

// Device tiers
export const DEVICE_TIER = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};
