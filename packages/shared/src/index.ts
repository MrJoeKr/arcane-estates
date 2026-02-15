// --- Types ---

export type ColorGroup =
  | "brown"
  | "light-blue"
  | "pink"
  | "orange"
  | "red"
  | "yellow"
  | "green"
  | "dark-blue";

export type SpaceType =
  | "go"
  | "property"
  | "portal"
  | "mana-well"
  | "jail"
  | "free-parking"
  | "go-to-jail"
  | "fate-card"
  | "guild-card"
  | "tax";

export interface SpaceDefinition {
  index: number;
  name: string;
  type: SpaceType;
  color?: ColorGroup;
  cost?: number;
  rent?: number[];
  houseCost?: number;
  mortgage?: number;
}

export type CardAction =
  | { type: "collect"; amount: number }
  | { type: "pay"; amount: number }
  | { type: "move_to"; position: number; collectGo: boolean }
  | { type: "move_back"; spaces: number }
  | { type: "go_to_jail" }
  | { type: "get_out_of_jail" }
  | { type: "collect_from_each"; amount: number }
  | { type: "pay_each"; amount: number }
  | { type: "repair"; perTower: number; perFortress: number }
  | { type: "nearest"; spaceType: "portal" | "mana-well"; rentMultiplier?: number };

export interface CardDefinition {
  id: number;
  type: "fate" | "guild";
  text: string;
  action: CardAction;
}

export interface TradeOfferData {
  toId: string;
  offerProperties: number[];
  offerCrowns: number;
  requestProperties: number[];
  requestCrowns: number;
}

// --- Constants ---

export const GO_SALARY = 200;
export const JAIL_FINE = 50;
export const MAX_JAIL_TURNS = 3;
export const MAX_DOUBLES = 3;
export const STARTING_MONEY = 1500;
export const MAX_PLAYERS = 6;
export const MIN_PLAYERS = 2;

export const PLAYER_TOKENS = [
  "wizard-hat",
  "crystal-ball",
  "dragon",
  "cauldron",
  "wand",
  "owl",
] as const;

export const TOKEN_EMOJIS: Record<string, string> = {
  "wizard-hat": "🧙",
  "crystal-ball": "🔮",
  dragon: "🐉",
  cauldron: "🫕",
  wand: "🪄",
  owl: "🦉",
};

export const COLOR_HEX: Record<ColorGroup, string> = {
  brown: "#8B4513",
  "light-blue": "#87CEEB",
  pink: "#FF69B4",
  orange: "#FF8C00",
  red: "#DC143C",
  yellow: "#FFD700",
  green: "#228B22",
  "dark-blue": "#191970",
};

// Board grid positions: maps space index -> [row, col] for the 11x11 CSS grid
// Bottom row (spaces 0-10): row 11, cols 11 down to 1
// Left column (spaces 11-19): rows 10 down to 2, col 1
// Top row (spaces 20-30): row 1, cols 1 up to 11
// Right column (spaces 31-39): rows 2 up to 10, col 11
export const BOARD_GRID_POSITIONS: [number, number][] = [
  // Bottom row: GO (pos 0) at bottom-right corner, going left
  [11, 11], // 0  - GO
  [11, 10], // 1
  [11, 9],  // 2
  [11, 8],  // 3
  [11, 7],  // 4
  [11, 6],  // 5
  [11, 5],  // 6
  [11, 4],  // 7
  [11, 3],  // 8
  [11, 2],  // 9
  [11, 1],  // 10 - Jail

  // Left column: going up
  [10, 1],  // 11
  [9, 1],   // 12
  [8, 1],   // 13
  [7, 1],   // 14
  [6, 1],   // 15
  [5, 1],   // 16
  [4, 1],   // 17
  [3, 1],   // 18
  [2, 1],   // 19

  // Top row: Free Parking at top-left, going right
  [1, 1],   // 20 - Free Parking
  [1, 2],   // 21
  [1, 3],   // 22
  [1, 4],   // 23
  [1, 5],   // 24
  [1, 6],   // 25
  [1, 7],   // 26
  [1, 8],   // 27
  [1, 9],   // 28
  [1, 10],  // 29

  // Top-right corner
  [1, 11],  // 30 - Go to Jail

  // Right column: going down
  [2, 11],  // 31
  [3, 11],  // 32
  [4, 11],  // 33
  [5, 11],  // 34
  [6, 11],  // 35
  [7, 11],  // 36
  [8, 11],  // 37
  [9, 11],  // 38
  [10, 11], // 39
];
