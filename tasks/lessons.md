# Lessons Learned

Self-improvement log. After ANY correction from the user, add a rule here to prevent the same mistake.

## Rules

### Project-Specific
- Three.js canvas textures require `needsUpdate = true` after drawing
- Pointer lock requires user gesture — never call on page load
- Troika text is async — always await sync before measuring bounds
- @huggingface/transformers must be excluded from Vite pre-optimization
- COEP/COOP headers are required in Vite config for Web Workers

### Workflow
- Always run `npm run build` before marking any task complete
- Plan first for multi-step tasks — use the planner agent
- Commit with conventional format, never batch unrelated changes
- Update this file after every correction

### Code Patterns
- New tools must extend BaseTool and register via ToolRegistry
- Events for all inter-module communication, never direct imports
- Web Workers for all ML inference, never on main thread
- Proper dispose() on all Three.js objects to prevent memory leaks

---
_Last updated: Initial setup_
