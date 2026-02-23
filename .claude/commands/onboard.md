---
description: Quick onboarding — understand project structure and get ready to contribute
---

## Onboarding Guide

Welcome to the Spatial AI Workbench! Here's how to get productive fast.

### Quick Start
1. `npm install` — install dependencies
2. `npm run dev` — start dev server at http://localhost:5173
3. Open browser → click to enter → WASD to move → E for tool shelf

### Architecture Overview
- Read `CLAUDE.md` for full project context
- Read `src/constants.js` for all shared values
- Read `src/events.js` for the event system
- Read `src/main.js` for the bootstrap flow

### Key Patterns
- **Managers** control lifecycle (SceneManager, PanelManager, AIManager)
- **Tools** extend BaseTool and register via ToolRegistry
- **Events** decouple everything — never import between modules directly
- **Web Workers** handle all ML inference off the main thread
- **3D UI** uses custom GLSL shaders and canvas textures, not DOM

### Adding a New Feature
1. Plan with the planner agent first
2. Follow existing patterns in similar files
3. Run `npm run build` before committing
4. Use conventional commit format
