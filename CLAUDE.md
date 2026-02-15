# CLAUDE.md

## Project Overview

Arcane Estates is a real-time multiplayer property trading board game (Monopoly-style) with a fantasy wizard theme. 2-6 players compete to build magical empires through property acquisition, tower/fortress building, trading, and rent collection.

## Tech Stack

- **Monorepo**: Bun workspaces + Turborepo
- **Frontend**: React 19, Vite 6, Tailwind CSS 4, Framer Motion, Zustand 5
- **Backend**: Colyseus 0.16, @colyseus/schema 3.x, tsx
- **Shared**: TypeScript types and game constants
- **Language**: TypeScript 5.8 (strict mode)

## Commands

```bash
bun install          # Install all dependencies
bun run dev          # Run web (port 3001) + server (port 3000)
bun run dev:web      # Frontend only
bun run dev:server   # Backend only
bun run build        # Build all packages
bun run check-types  # Type-check all packages
```

## Project Structure

```
apps/
  web/src/
    components/
      board/       # Board grid, spaces, player tokens, dice
      home/        # Home page, create/join screens
      lobby/       # Token selection, player list, start game
      modals/      # Property card, trade, auction, card reveal
      panels/      # Player info, action buttons, game log
      effects/     # Particle effects
    hooks/
      use-colyseus.ts   # WebSocket connection & state snapshot sync
      use-game-store.ts # UI-only state (Zustand)
    lib/
      colyseus-client.ts
  server/src/
    rooms/GameRoom.ts      # Room lifecycle & message handlers
    state/GameState.ts     # @colyseus/schema decorated state classes
    logic/                 # Pure game logic functions
      property-logic.ts    # Buy, rent, build, mortgage
      auction-logic.ts     # Timed auction system
      card-logic.ts        # Fate & Guild card effects
      trade-logic.ts       # Player-to-player trades
      jail-logic.ts        # Dungeon mechanics
      turn-manager.ts      # Turn order & advancement
    data/
      board-data.ts        # 40 space definitions
      card-data.ts         # Fate & Guild card pools
packages/
  shared/src/index.ts      # Types (ColorGroup, SpaceDefinition, CardDefinition, etc.)
                           # Constants (GO_SALARY, PLAYER_TOKENS, BOARD_GRID_POSITIONS, etc.)
```

## Architecture

- **Server-side authority**: All state mutations happen in the Colyseus GameRoom. The client sends messages; the server validates and mutates state.
- **State sync**: @colyseus/schema handles automatic delta-compressed serialization. The client converts Colyseus proxy objects to plain JS snapshots in `use-colyseus.ts`.
- **UI state**: Zustand store holds UI-only concerns (modal visibility, selected cards). Game state comes from Colyseus snapshots.
- **Logic separation**: Game logic is split into pure functions by domain. GameRoom orchestrates them.

## Conventions

- **React components**: PascalCase filenames (`Board.tsx`, `PlayerToken.tsx`)
- **Hooks**: `use-` prefix, kebab-case (`use-colyseus.ts`)
- **Logic/data files**: kebab-case (`property-logic.ts`, `board-data.ts`)
- **Server imports**: Use `.js` extensions (`import { GameRoom } from "./rooms/GameRoom.js"`)
- **Type imports**: Use `import type` where possible
- **Shared imports**: `import { ... } from "@arcane-estates/shared"`

## Important Gotchas

- **Server tsconfig** requires `experimentalDecorators: true` and `useDefineForClassFields: false` for @colyseus/schema v3 decorators to work. Without `useDefineForClassFields: false`, class field initializers override the getter/setter descriptors that Schema needs, causing `Symbol.metadata` errors at runtime.
- **Board grid** is 11x11 CSS grid (not 10x10). `BOARD_GRID_POSITIONS` maps 40 space indexes to `[row, col]`.
- **Client state snapshots**: Never store Colyseus proxy objects in React state. Always convert to plain objects via `stateToSnapshot()`.
- **Environment variables**: Frontend uses `VITE_SERVER_URL` (must have `VITE_` prefix for Vite).
- **Shared package**: Exports source TypeScript directly (no build step). Both apps resolve `@arcane-estates/shared` to `packages/shared/src/index.ts`.
