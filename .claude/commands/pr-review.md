---
description: Review a PR for code quality, architecture compliance, and security
---

## PR Review Workflow

1. Get PR details: `gh pr view ${ARGUMENTS} --repo shiki009/ai-workbench`
2. Get the diff: `gh pr diff ${ARGUMENTS} --repo shiki009/ai-workbench`
3. Analyze changes for:
   - Architecture compliance (managers, tools, events pattern)
   - Code style (ES modules, immutability, naming)
   - Security concerns (input validation, no eval, HTTPS)
   - Performance (no main-thread ML, proper disposal)
   - Missing error handling
   - Regressions in existing features
4. Post review comments: `gh pr review ${ARGUMENTS} --repo shiki009/ai-workbench`
