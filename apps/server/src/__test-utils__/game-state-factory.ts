import { GameState, Player, Space } from "../state/GameState";
import { BOARD_SPACES } from "../data/board-data";
import type { ColorGroup } from "@arcane-estates/shared";

const COLOR_GROUPS: Record<ColorGroup, number[]> = {
  brown: [1, 3],
  "light-blue": [6, 8, 9],
  pink: [11, 13, 14],
  orange: [16, 18, 19],
  red: [21, 23, 24],
  yellow: [26, 27, 29],
  green: [31, 32, 34],
  "dark-blue": [37, 39],
};

export function createTestState(playerCount: number): GameState {
  const state = new GameState();

  // Initialize all 40 spaces from board data
  for (let i = 0; i < BOARD_SPACES.length; i++) {
    const space = new Space();
    space.index = i;
    state.spaces.push(space);
  }

  // Add players
  for (let i = 0; i < playerCount; i++) {
    const player = new Player();
    player.id = `player${i + 1}`;
    player.name = `Player ${i + 1}`;
    player.crowns = 1500;
    player.position = 0;
    state.players.set(player.id, player);
  }

  // Set the first player as current
  state.currentPlayerId = "player1";

  return state;
}

export function assignProperty(state: GameState, playerId: string, spaceIndex: number): void {
  const player = state.players.get(playerId);
  const space = state.spaces[spaceIndex];

  if (!player || !space) return;

  space.ownerId = playerId;
  player.properties.push(spaceIndex);
}

export function assignColorSet(state: GameState, playerId: string, color: ColorGroup): void {
  const indices = COLOR_GROUPS[color];
  if (!indices) return;

  for (const index of indices) {
    assignProperty(state, playerId, index);
  }
}

export function setTowers(state: GameState, spaceIndex: number, count: number): void {
  const space = state.spaces[spaceIndex];
  if (!space) return;

  if (count === 5) {
    space.towers = 0;
    space.hasFortress = true;
  } else {
    space.towers = count;
    space.hasFortress = false;
  }
}
