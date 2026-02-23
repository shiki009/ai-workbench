---
name: test
description: Run project verification — build check, lint, and manual test instructions
user-invocable: true
allowed-tools: Bash(npm *), Bash(node *), Read, Grep, Glob
---

Run project verification for Spatial AI Workbench.

## Verification Steps

1. **Build Check**: Run `npm run build` — must succeed with zero errors
2. **Import Analysis**: Verify no circular dependencies with `node -e "import('./src/main.js')"`
3. **Dev Server**: Start `npm run dev` and verify it launches without errors
4. **Manual Checks** — Report these for user:
   - Scene loads with room visible
   - Tool shelf opens with E key
   - Panels spawn and are draggable
   - AI models download and run inference
5. **Report Results**: List pass/fail for each step
