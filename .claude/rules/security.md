# Security Rules

## API Keys
- API keys stored in localStorage — users provide their own keys
- Keys are passed per-request in the POST body — never stored on the server
- Never log API keys in server console output
- Never commit .env files — use .env.example for templates

## Input Handling
- Validate URLs server-side before passing to yt-dlp
- No innerHTML, no eval(), no Function constructor
- Sanitize all user input before rendering in React (JSX handles this by default)
- Validate request body in Express routes

## Network
- All external API calls over HTTPS only
- Vite proxy handles /api routing in dev — no open CORS needed
- No dynamic URL construction for external services

## File System
- Temp files in server/tmp/ — always cleaned up after processing
- Never serve arbitrary file paths — only dist/ in production
- Validate file extensions before processing

## Dependencies
- Audit before adding: `npm audit`
- Prefer well-maintained packages with security track records
- Pin major versions in package.json
- groq-sdk is the only AI SDK — Claude and OpenAI use raw fetch
