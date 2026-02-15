import { GameState } from "../state/GameState";
import { BOARD_SPACES } from "../data/board-data";
import type { ColorGroup } from "@arcane-estates/shared";
import { ArraySchema } from "@colyseus/schema";

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

const PORTAL_POSITIONS = [5, 15, 25, 35];
const MANA_WELL_POSITIONS = [12, 28];

export function canBuyProperty(state: GameState, playerId: string, spaceIndex: number): boolean {
  const player = state.players.get(playerId);
  if (!player) return false;

  const spaceDef = BOARD_SPACES[spaceIndex];
  if (!spaceDef) return false;

  // Must be a purchasable space
  const isPurchasable = spaceDef.type === "property" || spaceDef.type === "portal" || spaceDef.type === "mana-well";
  if (!isPurchasable) return false;

  // Must not be owned
  const space = state.spaces[spaceIndex];
  if (space && space.ownerId) return false;

  // Player must have enough crowns
  const cost = spaceDef.cost || 0;
  if (player.crowns < cost) return false;

  return true;
}

export function buyProperty(state: GameState, playerId: string, spaceIndex: number): void {
  const player = state.players.get(playerId);
  const spaceDef = BOARD_SPACES[spaceIndex];
  const space = state.spaces[spaceIndex];

  if (!player || !spaceDef || !space) return;

  const cost = spaceDef.cost || 0;
  player.crowns -= cost;
  space.ownerId = playerId;
  player.properties.push(spaceIndex);
}

export function calculateRent(state: GameState, spaceIndex: number, diceTotal: number): number {
  const space = state.spaces[spaceIndex];
  if (!space || !space.ownerId || space.isMortgaged) return 0;

  const spaceDef = BOARD_SPACES[spaceIndex];
  if (!spaceDef) return 0;

  const owner = state.players.get(space.ownerId);
  if (!owner) return 0;

  // Handle property rent
  if (spaceDef.type === "property") {
    if (!spaceDef.rent) return 0;

    if (space.hasFortress) {
      // Fortress rent is at index 5
      return spaceDef.rent[5];
    } else if (space.towers > 0) {
      // Tower rent is at index 1-4 (for 1-4 towers)
      return spaceDef.rent[space.towers];
    } else {
      // Base rent - check if owner has full color set
      const baseRent = spaceDef.rent[0];
      if (spaceDef.color && ownsFullColorSet(state, space.ownerId, spaceDef.color)) {
        return baseRent * 2;
      }
      return baseRent;
    }
  }

  // Handle portal rent
  if (spaceDef.type === "portal") {
    const portalsOwned = PORTAL_POSITIONS.filter(pos => {
      const portalSpace = state.spaces[pos];
      return portalSpace && portalSpace.ownerId === space.ownerId;
    }).length;

    const portalRents = [25, 50, 100, 200];
    return portalRents[portalsOwned - 1] || 0;
  }

  // Handle mana well rent
  if (spaceDef.type === "mana-well") {
    const manaWellsOwned = MANA_WELL_POSITIONS.filter(pos => {
      const wellSpace = state.spaces[pos];
      return wellSpace && wellSpace.ownerId === space.ownerId;
    }).length;

    if (manaWellsOwned === 2) {
      return diceTotal * 10;
    } else {
      return diceTotal * 4;
    }
  }

  return 0;
}

function ownsFullColorSet(state: GameState, ownerId: string, color: ColorGroup): boolean {
  const propertyIndices = COLOR_GROUPS[color];
  if (!propertyIndices) return false;

  return propertyIndices.every(index => {
    const space = state.spaces[index];
    return space && space.ownerId === ownerId;
  });
}

export function payRent(state: GameState, payerId: string, ownerId: string, amount: number): void {
  const payer = state.players.get(payerId);
  const owner = state.players.get(ownerId);

  if (!payer || !owner) return;

  if (payer.crowns >= amount) {
    payer.crowns -= amount;
    owner.crowns += amount;
  } else {
    // Bankrupt - transfer all assets
    owner.crowns += payer.crowns;
    payer.crowns = 0;
    payer.bankrupt = true;

    // Transfer all properties
    payer.properties.forEach(propIndex => {
      const space = state.spaces[propIndex];
      if (space) {
        space.ownerId = ownerId;
        owner.properties.push(propIndex);
      }
    });
    payer.properties.clear();

    // Transfer escape card if any
    if (payer.hasEscapeCard) {
      payer.hasEscapeCard = false;
      owner.hasEscapeCard = true;
    }
  }
}

export function canBuildTower(state: GameState, playerId: string, spaceIndex: number): boolean {
  const player = state.players.get(playerId);
  const space = state.spaces[spaceIndex];
  const spaceDef = BOARD_SPACES[spaceIndex];

  if (!player || !space || !spaceDef || spaceDef.type !== "property") return false;

  // Must own the property
  if (space.ownerId !== playerId) return false;

  // Must not be mortgaged
  if (space.isMortgaged) return false;

  // Must own full color set
  if (!spaceDef.color || !ownsFullColorSet(state, playerId, spaceDef.color)) return false;

  // Cannot build on fortress
  if (space.hasFortress) return false;

  // Max 4 towers
  if (space.towers >= 4) return false;

  // Must have enough crowns
  const houseCost = spaceDef.houseCost || 0;
  if (player.crowns < houseCost) return false;

  // Must build evenly (no more than 1 tower difference)
  if (spaceDef.color) {
    const groupIndices = COLOR_GROUPS[spaceDef.color];
    const minTowers = Math.min(...groupIndices.map(idx => {
      const s = state.spaces[idx];
      return s ? (s.hasFortress ? 5 : s.towers) : 0;
    }));

    if (space.towers > minTowers) return false;
  }

  return true;
}

export function buildTower(state: GameState, playerId: string, spaceIndex: number): void {
  const player = state.players.get(playerId);
  const space = state.spaces[spaceIndex];
  const spaceDef = BOARD_SPACES[spaceIndex];

  if (!player || !space || !spaceDef) return;

  const houseCost = spaceDef.houseCost || 0;
  player.crowns -= houseCost;

  if (space.towers === 4) {
    // Convert 4 towers to fortress
    space.towers = 0;
    space.hasFortress = true;
  } else {
    space.towers++;
  }
}

export function sellTower(state: GameState, playerId: string, spaceIndex: number): void {
  const player = state.players.get(playerId);
  const space = state.spaces[spaceIndex];
  const spaceDef = BOARD_SPACES[spaceIndex];

  if (!player || !space || !spaceDef) return;

  const houseCost = spaceDef.houseCost || 0;
  const refund = Math.floor(houseCost / 2);

  if (space.hasFortress) {
    // Sell fortress, convert back to 4 towers
    space.hasFortress = false;
    space.towers = 4;
    player.crowns += refund;
  } else if (space.towers > 0) {
    space.towers--;
    player.crowns += refund;
  }
}

export function mortgageProperty(state: GameState, playerId: string, spaceIndex: number): void {
  const player = state.players.get(playerId);
  const space = state.spaces[spaceIndex];
  const spaceDef = BOARD_SPACES[spaceIndex];

  if (!player || !space || !spaceDef) return;
  if (space.ownerId !== playerId) return;
  if (space.isMortgaged) return;

  // Cannot mortgage if there are buildings
  if (space.towers > 0 || space.hasFortress) return;

  const mortgageValue = spaceDef.mortgage || 0;
  space.isMortgaged = true;
  player.crowns += mortgageValue;
}

export function unmortgageProperty(state: GameState, playerId: string, spaceIndex: number): void {
  const player = state.players.get(playerId);
  const space = state.spaces[spaceIndex];
  const spaceDef = BOARD_SPACES[spaceIndex];

  if (!player || !space || !spaceDef) return;
  if (space.ownerId !== playerId) return;
  if (!space.isMortgaged) return;

  const mortgageValue = spaceDef.mortgage || 0;
  const cost = Math.floor(mortgageValue * 1.1);

  if (player.crowns < cost) return;

  player.crowns -= cost;
  space.isMortgaged = false;
}
