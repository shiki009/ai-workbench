# Lessons Learned

Self-improvement log. After ANY correction from the user, add a rule here to prevent the same mistake.

## Rules

### Project-Specific
- @huggingface/transformers must be excluded from Vite pre-optimization
- COEP/COOP headers are required in Vite config for Web Workers
- Image generator requires WebGPU — degrade gracefully without it
- DOM-based UI with CSS glassmorphism — no canvas rendering for UI
- All AI inference runs in Web Workers, never on main thread

### Workflow
- Always run `npm run build` before marking any task complete
- Plan first for multi-step tasks — use the planner agent
- Commit with conventional format, never batch unrelated changes
- Update this file after every correction
- When pivoting architecture, keep the valuable core (AI, storage, events) and rebuild the shell

### Code Patterns
- New tools must extend BaseTool and register via ToolRegistry
- Events for all inter-module communication, never direct imports
- Web Workers for all ML inference, never on main thread
- Tools render into Workspace card bodies (DOM elements)

---
_Last updated: v2.0 pivot from 3D to 2D dashboard_
