import type { SpaceDefinition } from "@arcane-estates/shared";

// Client-side copy of board space data for rendering
export const BOARD_SPACES: SpaceDefinition[] = [
  // Position 0 - GO
  { index: 0, name: "The Grand Portal", type: "go" },
  // Position 1 - Brown
  { index: 1, name: "Dusty Attic", type: "property", color: "brown", cost: 60, rent: [2, 10, 30, 90, 160, 250], houseCost: 50, mortgage: 30 },
  // Position 2 - Guild Card
  { index: 2, name: "Guild Card", type: "guild-card" },
  // Position 3 - Brown
  { index: 3, name: "Candle Corridor", type: "property", color: "brown", cost: 60, rent: [4, 20, 60, 180, 320, 450], houseCost: 50, mortgage: 30 },
  // Position 4 - Tax
  { index: 4, name: "Wizard's Tithe", type: "tax", cost: 200 },
  // Position 5 - Portal Station
  { index: 5, name: "Northgate Portal", type: "portal", cost: 200, mortgage: 100 },
  // Position 6 - Light Blue
  { index: 6, name: "Frost Garden", type: "property", color: "light-blue", cost: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, mortgage: 50 },
  // Position 7 - Fate Card
  { index: 7, name: "Fate Card", type: "fate-card" },
  // Position 8 - Light Blue
  { index: 8, name: "Moonwell Plaza", type: "property", color: "light-blue", cost: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, mortgage: 50 },
  // Position 9 - Light Blue
  { index: 9, name: "Silver Brook", type: "property", color: "light-blue", cost: 120, rent: [8, 40, 100, 300, 450, 600], houseCost: 50, mortgage: 60 },
  // Position 10 - Jail
  { index: 10, name: "The Dungeon", type: "jail" },
  // Position 11 - Pink
  { index: 11, name: "Potion Cellar", type: "property", color: "pink", cost: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, mortgage: 70 },
  // Position 12 - Mana Well
  { index: 12, name: "Water Mana Well", type: "mana-well", cost: 150, mortgage: 75 },
  // Position 13 - Pink
  { index: 13, name: "Herb Greenhouse", type: "property", color: "pink", cost: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, mortgage: 70 },
  // Position 14 - Pink
  { index: 14, name: "Crystal Lab", type: "property", color: "pink", cost: 160, rent: [12, 60, 180, 500, 700, 900], houseCost: 100, mortgage: 80 },
  // Position 15 - Portal Station
  { index: 15, name: "Eastwind Portal", type: "portal", cost: 200, mortgage: 100 },
  // Position 16 - Orange
  { index: 16, name: "Rune Library", type: "property", color: "orange", cost: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, mortgage: 90 },
  // Position 17 - Guild Card
  { index: 17, name: "Guild Card", type: "guild-card" },
  // Position 18 - Orange
  { index: 18, name: "Scroll Archive", type: "property", color: "orange", cost: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, mortgage: 90 },
  // Position 19 - Orange
  { index: 19, name: "Prophecy Hall", type: "property", color: "orange", cost: 200, rent: [16, 80, 220, 600, 800, 1000], houseCost: 100, mortgage: 100 },
  // Position 20 - Free Parking
  { index: 20, name: "Enchanted Garden", type: "free-parking" },
  // Position 21 - Red
  { index: 21, name: "Dragon Roost", type: "property", color: "red", cost: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, mortgage: 110 },
  // Position 22 - Fate Card
  { index: 22, name: "Fate Card", type: "fate-card" },
  // Position 23 - Red
  { index: 23, name: "Phoenix Aviary", type: "property", color: "red", cost: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, mortgage: 110 },
  // Position 24 - Red
  { index: 24, name: "Griffin Stable", type: "property", color: "red", cost: 240, rent: [20, 100, 300, 750, 925, 1100], houseCost: 150, mortgage: 120 },
  // Position 25 - Portal Station
  { index: 25, name: "Southfire Portal", type: "portal", cost: 200, mortgage: 100 },
  // Position 26 - Yellow
  { index: 26, name: "Starlight Tower", type: "property", color: "yellow", cost: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, mortgage: 130 },
  // Position 27 - Yellow
  { index: 27, name: "Astral Observatory", type: "property", color: "yellow", cost: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, mortgage: 130 },
  // Position 28 - Mana Well
  { index: 28, name: "Lightning Mana Well", type: "mana-well", cost: 150, mortgage: 75 },
  // Position 29 - Yellow
  { index: 29, name: "Eclipse Chamber", type: "property", color: "yellow", cost: 280, rent: [24, 120, 360, 850, 1025, 1200], houseCost: 150, mortgage: 140 },
  // Position 30 - Go to Jail
  { index: 30, name: "Banished!", type: "go-to-jail" },
  // Position 31 - Green
  { index: 31, name: "Enchanted Forge", type: "property", color: "green", cost: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, mortgage: 150 },
  // Position 32 - Green
  { index: 32, name: "Arcane Armory", type: "property", color: "green", cost: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, mortgage: 150 },
  // Position 33 - Guild Card
  { index: 33, name: "Guild Card", type: "guild-card" },
  // Position 34 - Green
  { index: 34, name: "Mythril Vault", type: "property", color: "green", cost: 320, rent: [28, 150, 450, 1000, 1200, 1400], houseCost: 200, mortgage: 160 },
  // Position 35 - Portal Station
  { index: 35, name: "Westmist Portal", type: "portal", cost: 200, mortgage: 100 },
  // Position 36 - Fate Card
  { index: 36, name: "Fate Card", type: "fate-card" },
  // Position 37 - Dark Blue
  { index: 37, name: "Grand Spellhall", type: "property", color: "dark-blue", cost: 350, rent: [35, 175, 500, 1100, 1300, 1500], houseCost: 200, mortgage: 175 },
  // Position 38 - Luxury Tax
  { index: 38, name: "Enchantment Fee", type: "tax", cost: 100 },
  // Position 39 - Dark Blue
  { index: 39, name: "Arcanum Throne Room", type: "property", color: "dark-blue", cost: 400, rent: [50, 200, 600, 1400, 1700, 2000], houseCost: 200, mortgage: 200 },
];
