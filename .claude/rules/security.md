# Security Rules

## Input Handling
- Sanitize ALL user input before rendering to canvas
- No innerHTML, no eval(), no Function constructor
- Validate message data in Web Worker message handlers
- Validate IndexedDB data on read

## Storage
- No sensitive data in localStorage
- Model integrity checks on cached files
- No PII stored without user consent

## Network
- All external resources over HTTPS only
- COEP/COOP headers must stay in Vite config
- No open CORS policies
- External model URLs from ModelRegistry only — no dynamic URL construction

## Dependencies
- Audit before adding: `npm audit`
- Prefer well-maintained packages with security track records
- Pin major versions in package.json

## WebGPU/WebXR
- Check permissions before API access
- Graceful degradation on denied permissions
- No device fingerprinting
