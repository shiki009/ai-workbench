# Testing Rules

## Verification Strategy

1. **Build Verification**: `npm run build` must pass — no errors, no warnings
2. **Dev Server Check**: `npm run dev` must start without errors
3. **Manual Testing Protocol**:
   - App loads, sidebar visible with 3 tools
   - Tool cards open/close from sidebar
   - AI tools: model downloads, inference runs, results display
   - Keyboard: E toggles sidebar
   - Onboarding shows on first visit
   - Storage: preferences persist on refresh

## Before Marking Any Task Complete
- ALWAYS run `npm run build`
- Verify no console errors in dev server
- Check that existing features still work (no regressions)

## Future: When Adding Test Framework
- Prefer Vitest (Vite-native)
- Unit test utilities, event bus, storage
- Integration tests for tool lifecycle
- Worker integration tests with mock messages
