# Arcane Estates

**Build Your Magical Empire** - A multiplayer Monopoly-style board game with a fantasy wizard theme for 2-6 players.

## About

Arcane Estates is a real-time multiplayer property trading game where wizards compete to build magical empires. Buy enchanted properties, build towers and fortresses, trade with rivals, and bankrupt your opponents to claim victory.

## Features

- **Real-time multiplayer** - 2-6 players via WebSocket (Colyseus)
- **40-space board** with properties, portals, mana wells, and special spaces
- **Property management** - Buy, build towers/fortresses, mortgage, collect rent
- **Trading system** - Propose and negotiate trades with other players
- **Auction system** - Timed bidding when a player declines a property
- **Card system** - Fate Cards and Guild Cards with random effects
- **Dungeon (jail)** - Pay fines, roll doubles, or use an Escape Scroll to get out

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS 4, Framer Motion, Zustand |
| Backend | Colyseus 0.16 (WebSocket game server) |
| Monorepo | Turborepo + Bun workspaces |
| Language | TypeScript |

## Getting Started

```bash
# Install dependencies
bun install

# Start dev (web + server)
bun run dev

# Start only the web client
bun run dev:web

# Start only the game server
bun run dev:server
```

## Project Structure

```
arcane-estates/
├── apps/
│   ├── web/          # React frontend (Vite)
│   │   └── src/
│   │       ├── components/
│   │       │   ├── board/      # Board, spaces, dice, tokens
│   │       │   ├── home/       # Home page, create/join game
│   │       │   ├── lobby/      # Player lobby, token selection
│   │       │   ├── modals/     # Property, trade, auction, card reveal
│   │       │   ├── panels/     # Player info, actions, game log
│   │       │   └── effects/    # Particle effects
│   │       ├── hooks/          # Colyseus + Zustand hooks
│   │       └── lib/            # WebSocket client setup
│   └── server/       # Colyseus game server
│       └── src/
│           ├── rooms/          # Game room definition
│           ├── state/          # Synchronized game state (@colyseus/schema)
│           ├── logic/          # Property, card, auction, trade, jail, turns
│           └── data/           # Board spaces + card definitions
└── packages/
    └── shared/       # Shared types and constants (WIP)
```

## How to Play

1. **Create or join** a game room using a 6-character code
2. **Pick your wizard token** in the lobby
3. **Roll dice** to move around the board
4. **Buy properties** you land on, or let them go to auction
5. **Build towers** (up to 4) then upgrade to a **fortress** on your color sets
6. **Trade** properties and crowns with other players
7. **Collect rent** when opponents land on your properties
8. **Last wizard standing** wins!

## License

MIT
