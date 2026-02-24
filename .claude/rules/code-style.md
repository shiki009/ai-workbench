# Code Style Rules

## Language & Modules
- Vanilla JavaScript only — no TypeScript, no JSX, no frameworks
- ES modules exclusively (import/export), never CommonJS (require)
- Destructure imports when possible

## Immutability
- CRITICAL: Create new objects rather than modifying existing ones
- Use spread operator for object/array updates
- Never mutate function parameters

## File Organization
- One class per file, file named after the class
- Constants in `src/constants.js`, events in `src/events.js`
- Organize by feature domain: ai/, ui/, tools/, storage/, onboarding/, utils/
- Target: 200-400 lines per file, maximum 800 lines

## Naming
- Classes: PascalCase (StorageManager, BaseTool)
- Methods/functions: camelCase (addCard, handleClick)
- Constants: UPPER_SNAKE_CASE (TOOL_TYPES, EVENTS.TOOL_ACTIVATE)
- Files: PascalCase for classes (StorageManager.js), camelCase for utilities (debounce.js)
- Private methods: prefix with underscore (_updateLayout)

## Functions
- Maximum 50 lines per function
- Maximum 3 levels of nesting
- No default exports — always named exports
- Arrow functions for callbacks, regular functions for methods

## UI Code
- DOM-based UI with CSS glassmorphism
- Styles in src/styles/main.css with CSS custom properties
- No inline styles except dynamic values
- Clean up DOM elements and event listeners in deactivate/dispose methods
