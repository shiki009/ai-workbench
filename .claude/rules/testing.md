# Testing Rules

## Verification Strategy
Since this is a WebGL/3D application without a test framework currently:

1. **Build Verification**: `npm run build` must pass — no errors, no warnings
2. **Dev Server Check**: `npm run dev` must start without errors
3. **Manual Testing Protocol**:
   - Scene renders (room, lighting, skybox)
   - Tool shelf opens/closes with E key
   - Panels spawn, drag, resize, minimize, close
   - AI tools: model downloads, inference runs, results display
   - Camera: WASD movement, mouse look
   - Storage: workspace saves/loads on refresh

## Before Marking Any Task Complete
- ALWAYS run `npm run build`
- Verify no console errors in dev server
- Check that existing features still work (no regressions)

## Future: When Adding Test Framework
- Prefer Vitest (Vite-native)
- Unit test utilities, event bus, storage
- Visual regression tests for 3D rendering (screenshot comparison)
- Worker integration tests with mock messages
