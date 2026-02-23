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
- Organize by feature domain: ai/, scene/, ui3d/, tools/, input/, storage/
- Target: 200-400 lines per file, maximum 800 lines

## Naming
- Classes: PascalCase (SceneManager, Panel3D)
- Methods/functions: camelCase (spawnPanel, handleClick)
- Constants: UPPER_SNAKE_CASE (PANEL_WIDTH, EVENTS.PANEL_SPAWN)
- Files: PascalCase for classes (SceneManager.js), camelCase for utilities (debounce.js)
- Private methods: prefix with underscore (_updateLayout)

## Functions
- Maximum 50 lines per function
- Maximum 3 levels of nesting
- No default exports — always named exports
- Arrow functions for callbacks, regular functions for methods

## 3D Code
- All 3D UI uses custom GLSL shaders — never CSS overlays
- Canvas2D for panel content textures
- Always dispose geometries, materials, textures in cleanup methods
- Set `texture.needsUpdate = true` after Canvas2D drawing
