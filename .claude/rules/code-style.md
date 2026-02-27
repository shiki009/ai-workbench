# Code Style Rules

## Language & Modules
- React 19 + JSX for frontend, Node.js for backend
- ES modules exclusively (import/export), never CommonJS (require)
- Destructure imports when possible
- Named exports everywhere — no default exports

## Frontend
- Functional components with hooks — no class components
- Tailwind CSS 4 for all styling — no separate CSS modules
- State management via custom hooks (useAnalysis, useSettings)
- PascalCase for component files (Header.jsx), camelCase for utilities (api.js)

## Backend
- Express.js with ES module syntax
- Services in server/services/, routes in server/routes/
- Async/await for all async operations

## Immutability
- CRITICAL: Create new objects rather than modifying existing ones
- Use spread operator for object/array updates
- Never mutate function parameters or React state directly

## File Organization
- One component per file, file named after the component
- Organize by role: components/, services/, hooks/ (frontend); routes/, services/, utils/ (backend)
- Target: 200-400 lines per file, maximum 800 lines

## Naming
- Components: PascalCase (Header, URLInput, Results)
- Hooks: camelCase with "use" prefix (useAnalysis, useSettings)
- Functions/variables: camelCase (analyzeVideo, handleSubmit)
- Constants: UPPER_SNAKE_CASE (SYSTEM_PROMPT, URL_PATTERN)

## Functions
- Maximum 50 lines per function
- Maximum 3 levels of nesting
- Arrow functions for callbacks, named functions for exports
