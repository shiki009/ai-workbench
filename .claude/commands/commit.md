---
description: Stage, commit, and push changes with conventional commit format
---

## Commit Workflow

1. Run `git status` to see all changes
2. Run `git diff` to review changes
3. Stage relevant files (never `git add .` — be specific)
4. Write a conventional commit message:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `refactor:` for code improvements
   - `docs:` for documentation
   - `chore:` for maintenance
5. Run `npm run build` to verify
6. Create the commit
7. Push to current branch

Arguments: ${ARGUMENTS}
