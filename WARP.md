# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a NestJS authentication service written in TypeScript, built exclusively with GraphQL. NestJS is a progressive Node.js framework that uses decorators and dependency injection to build scalable server-side applications. The project follows the standard NestJS project structure with modular architecture.

## Architecture

### Core Structure
- **Modules**: The application is organized into modules (`app.module.ts`), which are the basic building blocks that group related functionality
- **Resolvers**: Handle GraphQL queries and mutations (`auth.resolver.ts`)
- **Services**: Contain business logic and can be injected into resolvers (`auth.service.ts`)
- **Decorators**: Extensively used for defining GraphQL operations (`@Query()`, `@Mutation()`), dependency injection (`@Injectable()`), and module configuration (`@Module()`)

### Key Files
- `src/main.ts` - Application entry point, bootstraps the NestJS application and starts listening on port 3000
- `src/app.module.ts` - Root module that imports all other modules and defines the application structure
- `nest-cli.json` - NestJS CLI configuration with source root and compiler options

## Development Commands

### Installation
```bash
npm install
```

### Development Server
```bash
# Start in development mode
npm run start

# Start with file watching (auto-restart on changes)
npm run start:dev

# Start with debugging enabled
npm run start:debug
```

### Production
```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Testing
```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Debug tests
npm run test:debug
```

### Code Quality
```bash
# Lint and fix TypeScript files
npm run lint

# Format code with Prettier
npm run format
```

## Testing Architecture

- **Unit Tests**: Located alongside source files with `.spec.ts` suffix, use Jest testing framework
- **Coverage**: Generated in `coverage/` directory when running `npm run test:cov`

## TypeScript Configuration

The project uses modern TypeScript settings:
- **Module System**: `nodenext` with proper ESM/CommonJS interop
- **Target**: ES2023 for modern JavaScript features
- **Strict Checks**: Enabled for null checks and consistent casing
- **Decorators**: Experimental decorators enabled for NestJS functionality

## Code Style

- **ESLint**: Uses TypeScript ESLint with recommended rules, some strictness relaxed for development speed
- **Prettier**: Configured for consistent code formatting
- **Import Style**: CommonJS source type with Node.js and Jest globals

## Development Notes

- The application runs on port 3000 by default (configurable via PORT environment variable)
- Hot reload is available in development mode via `npm run start:dev`
- The project uses dependency injection extensively - services should be decorated with `@Injectable()` and registered in module providers
- When adding new features, follow the NestJS pattern: create modules, resolvers, and services as separate files and wire them together in the module decorator
- This service is GraphQL-only - all API operations are handled through GraphQL queries and mutations
