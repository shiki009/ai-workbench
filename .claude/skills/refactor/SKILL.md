---
name: refactor
description: Refactor code while preserving behavior — extract, simplify, optimize
argument-hint: [file-or-module]
user-invocable: true
allowed-tools: Read, Edit, Write, Grep, Glob, Bash(npm run build)
---

Refactor: $ARGUMENTS

## Refactoring Rules

1. **Preserve Behavior** — No functional changes unless explicitly requested
2. **Follow Patterns** — Use existing project conventions:
   - Managers for lifecycle, Tools extend BaseTool, Events for communication
   - ES modules, immutable patterns, class-based architecture
3. **Verify** — `npm run build` must pass after every change
4. **Small Steps** — One refactoring at a time, verify between each
5. **Document** — If refactoring changes API surface, update CLAUDE.md

## Common Refactorings
- Extract method/class when function > 50 lines
- Replace magic numbers with constants in `src/constants.js`
- Extract event names to `src/events.js`
- Consolidate duplicate shader code
- Improve resource disposal patterns
