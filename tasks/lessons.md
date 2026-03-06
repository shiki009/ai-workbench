# Lessons Learned

Self-improvement log. After ANY correction from the user, add a rule here to prevent the same mistake.

## Rules

### Project-Specific
- Groq API key is always required (Whisper transcription) even when using another fact-check provider
- yt-dlp must be installed on the system for video downloading to work
- Tailwind v4 uses `@import "tailwindcss"` + Vite plugin — no postcss.config or tailwind.config
- Vite proxies /api to Express on port 3001 — both must run for dev

### Workflow
- Always run `npm run build` before marking any task complete
- Plan first for multi-step tasks
- Commit with conventional format, never batch unrelated changes
- Update this file after every correction

### Code Patterns
- Normalize pasted URLs (trim, collapse whitespace/newlines) on both client and server so production runs cleanly every time; validate against allowed TikTok/Instagram domains (including vt.tiktok.com, vm.tiktok.com)
- Named exports only — no default exports
- SSE via POST + ReadableStream (not EventSource) because we need to send API keys in the body
- React state machine pattern: idle → loading → done → error
- Custom hooks for complex state (useAnalysis, useSettings)

---
_Last updated: v3.0 rewrite from AI Workbench to Video Fact Checker_
