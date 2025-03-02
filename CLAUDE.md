# TSCircuit Project Guide

## Commands
- Build: `bun run build`
- Development: `bun run dev`
- Format: `biome format --write .`
- Lint: `bun run lint`
- Run all tests: `bun run playwright`
- Run single Playwright test: `bunx playwright test path/to/test.spec.ts`
- Run Bun test: `bun test path/to/test.test.ts`
- Update snapshots: `bun run playwright:update`

## Code Style Guidelines
- **Files**: Use kebab-case for filenames (required by Biome linter)
- **Components**: Use PascalCase for React components
- **Variables**: Use camelCase for variables, constants, and functions
- **Imports**: Auto-organize imports with Biome (should be sorted)
- **Formatting**: Use double quotes for JSX, trailing commas, optional semicolons
- **Types**: Use TypeScript, strict mode enabled, avoid any when possible
- **Error Handling**: Use try/catch blocks with descriptive error messages
- **Testing**: Write Playwright tests for UI, Bun tests for unit testing