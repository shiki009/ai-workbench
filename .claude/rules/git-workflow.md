# Git Workflow Rules

## Commit Messages
- Format: `<type>: <description>`
- Types: feat, fix, refactor, docs, test, chore, perf, ci, style
- Description: imperative mood, lowercase, no period
- Body: optional, explain "why" not "what"
- Examples:
  - `feat: add speech-to-text tool with Whisper model`
  - `fix: prevent panel z-fighting on overlap`
  - `refactor: extract shader code to shared module`

## Branches
- Feature: `feat/<short-description>`
- Fix: `fix/<short-description>`
- Refactor: `refactor/<short-description>`
- Always branch from main

## Before Committing
- IMPORTANT: Run `npm run build` — must pass
- Review changed files — no debug logs, no console.log left behind
- No .env files, no secrets, no API keys

## PR Guidelines
- Title under 70 characters
- Description with Summary and Test Plan sections
- Link related issues

## Remote
- Repository: https://github.com/shiki009/ai-workbench.git
- User: shiki009
- Email: vladislavshik10@gmail.com
