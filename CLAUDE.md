# CLAUDE.md — Spatial AI Workbench

This file is read by Claude Code at the start of every session. It provides persistent context, rules, and project knowledge.

## Project Overview

Spatial AI Workbench is a browser-based 3D environment combining Three.js visualization with Hugging Face Transformers for in-browser AI inference. Users navigate a first-person 3D room, interact with glassmorphic UI panels, and run AI tools (image classification, text generation, image generation) via Web Workers.

**Stack:** Vite 6 + Three.js 0.170 + Troika Text + @huggingface/transformers 3.x
**Storage:** IndexedDB + OPFS (model cache) + localStorage (prefs)
**Architecture:** Event-driven (EventBus pub/sub), modular managers, Web Workers for ML inference

## Build & Run

- `npm run dev` — start Vite dev server (port 5173, COEP/COOP headers enabled)
- `npm run build` — production build
- `npm run preview` — preview production build

## Code Style

- ES modules only (import/export), never CommonJS
- Vanilla JS — no TypeScript, no React, no frameworks
- Immutable patterns: spread operator, never mutate state directly
- Class-based architecture with clear manager/tool/component separation
- Constants in `src/constants.js`, events in `src/events.js`
- IMPORTANT: All 3D UI components use custom GLSL shaders — do not replace with CSS
- Web Workers for heavy computation — never run ML inference on main thread

## Architecture Rules

- **Managers** orchestrate lifecycle: SceneManager, PanelManager, AIManager, StorageManager
- **Tools** extend BaseTool — register via ToolRegistry, never instantiate directly
- **Panels** are 3D meshes with canvas textures — not DOM elements
- **Events** decouple all communication — components never import each other directly
- New tools MUST: extend BaseTool, register in ToolRegistry, use Web Worker for inference
- New panels MUST: go through PanelManager for z-ordering and focus management

## File Structure

```
src/
├── ai/          # AIManager, ModelRegistry, PipelineExecutor, Web Workers
├── input/       # KeyboardControls, PointerLock, RaycastInteraction, XRInputHandler
├── scene/       # SceneManager, CameraController, Lighting, Room, PostProcessing
├── ui3d/        # Panel3D, PanelManager, PanelControls, ToolShelf, ButtonMesh, SliderMesh
├── tools/       # ToolRegistry, BaseTool, ImageClassifier, TextGenerator, ImageGenerator
├── storage/     # StorageManager, IndexedDBStore, OPFSStore, ModelCacheManager
├── onboarding/  # OnboardingOverlay, CapabilityDetector
├── utils/       # animate, debounce, disposable, formatBytes
├── constants.js # Global constants, colors, dimensions
├── events.js    # EventBus pub/sub system
└── main.js      # Application bootstrap
```

## Common Gotchas

- Vite config requires custom COEP/COOP headers for SharedArrayBuffer (Web Workers)
- @huggingface/transformers is excluded from Vite pre-optimization (too large, dynamic imports)
- Image generator requires WebGPU — check `CapabilityDetector` before enabling
- Troika text rendering is async — always await text sync before measuring bounds
- Pointer lock only works after user gesture — never call requestPointerLock() on page load
- Panel content uses Canvas2D textures — must call `needsUpdate = true` after drawing

## Self-Improvement Protocol

After ANY correction from the user:
1. Fix the immediate issue
2. Update `tasks/lessons.md` with a rule to prevent the same mistake
3. If it's a project-wide pattern, update this CLAUDE.md file

## Git Workflow

- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `perf:`
- Feature branches from main
- IMPORTANT: Always verify changes work before committing — run `npm run build` minimum

## Team

- Owner: shiki009 (vladislavshik10@gmail.com)
- Repo: https://github.com/shiki009/ai-workbench.git
- All PycharmProjects/ repos are personal projects

@tasks/lessons.md
