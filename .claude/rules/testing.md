# Testing Rules

## Verification Strategy

1. **Build Verification**: `npm run build` must pass — no errors, no warnings
2. **Dev Server Check**: `npm run dev` must start both Vite + Express without errors
3. **Manual Testing Protocol**:
   - App loads with centered card and URL input
   - Settings modal opens, API keys can be entered and saved
   - URL validation rejects non-TikTok/Instagram URLs
   - Progress steps animate during analysis
   - Results show truth score, verdict, and claim breakdown
   - "Check Another" resets to initial state
   - Error states display properly

## Before Marking Any Task Complete
- ALWAYS run `npm run build`
- Verify no console errors in dev server
- Check that existing features still work (no regressions)

## Future: When Adding Test Framework
- Prefer Vitest (Vite-native)
- Unit test hooks (useAnalysis state machine)
- Integration tests for SSE streaming
- Backend route tests with mock services
