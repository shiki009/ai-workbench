# CLAUDE.md — AI Workbench

This file is read by Claude Code at the start of every session. It provides persistent context, rules, and project knowledge.

## Project Overview

AI Workbench is a browser-based dashboard for running AI models locally using Hugging Face Transformers. Users interact with a clean glassmorphism UI to run image classification, text generation, and image generation — all via Web Workers with no server required.

**Stack:** Vite 6 + @huggingface/transformers 3.x + vanilla JS
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
- Web Workers for heavy computation — never run ML inference on main thread
- DOM-based UI with CSS glassmorphism — no canvas rendering for UI

## Architecture Rules

- **UI Components** (src/ui/) render DOM elements — Sidebar, Workspace, StatusBar, Toast
- **Tools** extend BaseTool — register via ToolRegistry, render into Workspace cards
- **AI Layer** (src/ai/) manages Web Workers and model lifecycle
- **Events** decouple all communication — components never import each other directly
- New tools MUST: extend BaseTool, register in ToolRegistry, use Web Worker for inference

## File Structure

```
src/
├── ai/          # AIManager, ModelRegistry, PipelineExecutor, Web Workers
├── ui/          # Sidebar, Workspace, StatusBar, Toast
├── tools/       # ToolRegistry, BaseTool, ImageClassifier, TextGenerator, ImageGenerator
├── storage/     # StorageManager, IndexedDBStore, OPFSStore, ModelCacheManager
├── onboarding/  # OnboardingOverlay, CapabilityDetector
├── utils/       # debounce, formatBytes
├── styles/      # main.css (glassmorphism, layout, components)
├── constants.js # Tool types, events, storage keys
├── events.js    # EventBus pub/sub system
└── main.js      # Application bootstrap
```

## Common Gotchas

- Vite config requires custom COEP/COOP headers for SharedArrayBuffer (Web Workers)
- @huggingface/transformers is excluded from Vite pre-optimization (too large, dynamic imports)
- Image generator requires WebGPU — check CapabilityDetector before enabling

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
