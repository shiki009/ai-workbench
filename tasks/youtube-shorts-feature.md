# YouTube Shorts Support — Task List

## Overview

Add YouTube Shorts support to Video Fact Checker so users can paste TikTok, Instagram Reels, and YouTube Shorts URLs. Ensure all three platforms work reliably.

---

## Phase 1: YouTube Shorts Implementation

### 1.1 URL validation
- [x] **Update `VIDEO_URL_PATTERN`** in `src/utils/url.js` — add:
  - `youtube.com`, `www.youtube.com`, `youtu.be`
  - Paths: `/shorts/VIDEO_ID`, `/watch?v=VIDEO_ID`
- [x] **Mirror changes** in `server/utils/url.js`
- [x] **Update error message** in `URLInput.jsx` and `analyze.js` — e.g. "TikTok, Instagram Reel, or YouTube Shorts URL"
- [x] **Update placeholder** in `URLInput.jsx` — e.g. "Paste TikTok, Instagram Reel, or YouTube Shorts URL"

### 1.2 Video extraction
- [x] **Add `extractYouTubeVideo(url)`** in `server/services/videoExtractor.js`:
  - Use yt-dlp (same as TikTok) — supports Shorts and regular watch URLs
  - Output mp4, no playlist
- [x] **Wire YouTube in `downloadVideo()`** — route `youtube.com` and `youtu.be` URLs
- [x] **Update unsupported-platform error** to mention YouTube

### 1.3 Tests
- [x] **Add YouTube URL cases** in `server/utils/url.test.js`:
  - Accept: `youtube.com/shorts/VIDEO_ID`, `www.youtube.com/watch?v=VIDEO_ID`, `youtu.be/VIDEO_ID`
  - Reject: `youtube.com/channel/...`, `youtube.com/playlist/...`, `youtube.com/` (no video)

---

## Phase 2: Platform Testing & Validation

### 2.1 Unit tests
- [ ] Run `npm test` — ensure all URL tests pass
- [ ] Run `npm run build` — ensure production build succeeds

### 2.2 Manual E2E tests (requires API keys + yt-dlp)

| Platform | URL type | Test URL (replace with real) | Expected |
|----------|----------|------------------------------|----------|
| TikTok | Full URL | `https://www.tiktok.com/@user/video/7067695578729221378` | Download → transcribe → fact-check |
| TikTok | Short link | `https://vm.tiktok.com/Abc12Xy/` | Same |
| Instagram | Reel | `https://www.instagram.com/reel/ABC123/` | Same |
| Instagram | Post | `https://www.instagram.com/p/shortcode/` | Same (if video) |
| YouTube | Shorts | `https://www.youtube.com/shorts/VIDEO_ID` | Same |
| YouTube | Watch | `https://www.youtube.com/watch?v=VIDEO_ID` | Same |
| YouTube | Short link | `https://youtu.be/VIDEO_ID` | Same |

### 2.3 Edge cases to verify
- [ ] Long videos (>10 min) — may hit Whisper / timeout limits
- [ ] Private/restricted videos — should fail gracefully with clear error
- [ ] Invalid/broken URLs — should show validation error
- [ ] Paste with extra whitespace/newlines — should normalize

---

## Phase 3: Polish & Documentation

- [ ] **Update CLAUDE.md** — add YouTube Shorts to supported platforms
- [ ] **Update `tasks/lessons.md`** — add rule for supported URL domains
- [ ] **Commit** — `feat: add YouTube Shorts support`

---

## Dependencies

- yt-dlp must be installed (`brew install yt-dlp` or `pip install yt-dlp`)
- Groq API key required for transcription
- At least one fact-check provider key (Groq, Claude, or OpenAI)
