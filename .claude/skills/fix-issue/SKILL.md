---
name: fix-issue
description: Fix a GitHub issue end-to-end — analyze, implement, test, commit
argument-hint: [issue-number]
user-invocable: true
allowed-tools: Bash(gh *), Bash(npm *), Bash(git *), Read, Edit, Write, Grep, Glob
---

Fix GitHub issue: $ARGUMENTS

## Steps

1. Use `gh issue view $ARGUMENTS --repo shiki009/ai-workbench` to get details
2. Understand the problem — read related files
3. Search codebase for relevant code
4. Implement the fix following project patterns:
   - ES modules, immutable patterns, event-driven
   - If 3D: proper Three.js disposal, shader patterns
   - If AI: Web Worker, ModelRegistry integration
5. Verify: `npm run build` must pass
6. Commit with conventional format: `fix: <description> (closes #$ARGUMENTS)`
7. Push to feature branch and create PR
