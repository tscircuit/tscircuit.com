# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

tscircuit.com is a React-based web application for creating, sharing, and managing electronic circuit designs using TypeScript and React. It features a circuit editor, package management system, AI-assisted design tools, and visualization of PCB layouts and 3D models.

## Development Commands

- `bun run dev` - Start development server (builds fake API and runs on localhost:5173)
- `bun run build` - Full production build (generates images, sitemap, builds fake API, compiles TypeScript, and builds with Vite)
- `bun run typecheck` - Run TypeScript type checking without emitting files
- `bun run format` - Format code using Biome
- `bun run lint` - Check code formatting with Biome
- `bun run playwright` - Run Playwright end-to-end tests
- `bun run playwright:update` - Update Playwright test snapshots
- `bun run snapshot` - Interactive snapshot updating tool (prompts for specific test file)

### Fake API Development
- `bun run build:fake-api` - Build the complete fake API (TypeScript compilation, bundle generation, schema building)
- `bun run dev:registry` - Run dev server using registry API at localhost:3100

## Architecture

### Frontend Structure
- **React SPA** with Vite bundler, using Wouter for routing and lazy-loaded pages
- **State Management**: Zustand for global state, React Query for server state
- **UI Framework**: Tailwind CSS with Radix UI components and custom shadcn/ui components
- **Code Editor**: CodeMirror 6 with TypeScript support and AI completion

### API Architecture
- **Fake API**: Development API built with Winterspec, providing full backend simulation
- **Database Schema**: Zod-validated schemas for packages, builds, releases, snippets, accounts, orders
- **Authentication**: Session-based auth with GitHub integration

### Key Domains
- **Packages**: Reusable circuit components with versioning and releases
- **Package Builds**: Compilation artifacts with build status and logs  
- **Package Releases**: Published versions with metadata and assets
- **Snippets**: Legacy circuit designs (being migrated to packages)
- **Circuit JSON**: Standard format for circuit data interchange

### File Organization
- `src/components/` - Reusable UI components
- `src/pages/` - Route-based page components  
- `src/hooks/` - Custom React hooks for data fetching and state
- `src/lib/` - Utilities, constants, and helper functions
- `fake-snippets-api/` - Mock API implementation with Winterspec
- `playwright-tests/` - End-to-end tests with visual regression snapshots

## Testing Strategy

Uses Playwright for end-to-end testing with visual regression snapshots. Tests cover critical user flows including editor functionality, package management, authentication, and responsive design across viewport sizes.

## Key Technical Patterns

### Data Fetching
- React Query for server state with custom hooks (use-package-*, use-snippet-*, etc.)
- Fake API provides development backend with realistic data simulation
- SSR support via Vercel for SEO and performance

### Circuit Visualization  
- Multiple viewers: PCB viewer, schematic viewer, 3D viewer, assembly viewer
- SVG-based rendering with interactive controls
- Real-time preview updates during code editing

### Code Compilation
- TypeScript compilation in browser using Monaco/TypeScript compiler API
- Circuit JSON generation from TypeScript code
- Error handling and display for compilation issues

### Package Management
- Package files with hierarchical structure
- Build artifacts and release management
- GitHub integration for repository linking

## Environment Variables

Development AI testing requires:
```bash
VITE_USE_DIRECT_AI_REQUESTS=true
VITE_ANTHROPIC_API_KEY=<your-key-here>
```

## Build Tools

- **Bundler**: Vite with React plugin and image optimization
- **TypeScript**: Strict mode with path aliases (@/* → src/*)
- **Styling**: Tailwind CSS with custom design tokens
- **Code Quality**: Biome for formatting and linting
- **Package Manager**: Bun for fast installs and script execution
