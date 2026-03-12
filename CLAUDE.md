# CLAUDE.md — Video Fact Checker

This file is read by Claude Code at the start of every session. It provides persistent context, rules, and project knowledge.

## Project Overview

Video Fact Checker is a web app where users paste a TikTok, Instagram Reel, or YouTube Shorts URL, and the app downloads the video, transcribes it with Groq Whisper, and uses an LLM to fact-check the claims. Clean, minimal UI inspired by checkhercount.com.

**Stack:** React 19 + Vite 6 + Tailwind CSS 4 (frontend) / Express.js (backend)
**AI:** Groq Whisper for transcription, Groq Llama / Claude / OpenAI for fact-checking
**Video:** youtube-dl-exec (yt-dlp wrapper) for downloading

## Build & Run

- `npm run dev` — start both Vite (port 5173) + Express (port 3001) via concurrently
- `npm run dev:client` — Vite only
- `npm run dev:server` — Express only
- `npm run build` — production build (Vite)
- `npm start` — production server (serves built frontend + API)

## Code Style

- React 19 with JSX — functional components, hooks only
- Tailwind CSS 4 for all styling — no separate CSS files except index.css
- ES modules only (import/export)
- Named exports everywhere (no default exports)
- File naming: PascalCase for components (Header.jsx), camelCase for utilities (api.js)

## Architecture

```
src/                          # React frontend
├── components/               # UI components (Header, URLInput, Results, etc.)
├── services/api.js           # SSE client for /api/analyze
├── hooks/useAnalysis.js      # State machine hook
├── App.jsx                   # Main app component
├── main.jsx                  # Entry point
└── index.css                 # Tailwind imports + custom animations

server/                       # Express backend
├── index.js                  # Express entry, port 3001
├── routes/analyze.js         # POST /api/analyze → SSE streaming
├── services/
│   ├── providers.js          # Groq SDK + Claude/OpenAI via fetch
│   ├── videoExtractor.js     # yt-dlp download
│   ├── transcriber.js        # Groq Whisper API
│   └── factChecker.js        # LLM fact-check with structured prompt
└── utils/cleanup.js          # Temp file deletion
```

## Key Design Decisions

- **SSE via POST**: fetch() + ReadableStream — not EventSource — because we POST API keys in the body
- **No ffmpeg**: Groq Whisper accepts mp4 directly
- **API keys in localStorage**: Users provide their own keys, passed per-request to backend
- **Groq always required**: Whisper transcription uses Groq; fact-checking provider is configurable

## Common Gotchas

- Vite proxies `/api` to Express on port 3001 — both must run for dev
- yt-dlp must be installed on the system (`brew install yt-dlp` or `pip install yt-dlp`)
- Groq API key is always required (even if Claude/OpenAI is the fact-check provider) because Whisper runs on Groq
- Tailwind v4 uses `@import "tailwindcss"` + Vite plugin — no postcss.config or tailwind.config needed

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

## Agent Pipelines

4 pipelines, 13 agent files. Full documentation in `.claude/agents/README.md`.

### Quick Reference

| Pipeline | Command | When | Stages |
|----------|---------|------|--------|
| **Feature** | `@saw-orchestrator` | New feature | planner → architect → implementor → tester → reviewer |
| **Bugfix** | `@saw-bug-orchestrator` | Bug, unknown root cause | triager → fixer → tester → reviewer |
| **Hotfix** | `@saw-hotfix-orchestrator` | Bug, known root cause | fixer → reviewer |
| **Refactor** | `@saw-refactor-orchestrator` | Restructure code | analyzer → executor → tester → reviewer |

@tasks/lessons.md
