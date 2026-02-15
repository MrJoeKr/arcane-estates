import { GO_SALARY, MAX_DOUBLES } from "@arcane-estates/shared";
import { GameState } from "../state/GameState";

export function getNextPlayerId(state: GameState): string {
  const playerIds = Array.from(state.players.keys());
  const currentIndex = playerIds.indexOf(state.currentPlayerId);

  let nextIndex = (currentIndex + 1) % playerIds.length;
  let iterations = 0;
  const maxIterations = playerIds.length;

  // Skip bankrupt players, wrap around
  while (iterations < maxIterations) {
    const nextId = playerIds[nextIndex];
    const nextPlayer = state.players.get(nextId);

    if (nextPlayer && !nextPlayer.bankrupt) {
      return nextId;
    }

    nextIndex = (nextIndex + 1) % playerIds.length;
    iterations++;
  }

  // If all players are bankrupt, return current player
  return state.currentPlayerId;
}

export function advanceTurn(state: GameState): void {
  state.currentPlayerId = getNextPlayerId(state);
  state.turnPhase = "roll";
  state.doublesCount = 0;
}

export function handleDoubles(state: GameState): boolean {
  const player = state.players.get(state.currentPlayerId);
  if (!player) return false;

  const [die1, die2] = state.dice;
  const isDoubles = die1 === die2;

  if (!isDoubles) {
    return false;
  }

  state.doublesCount++;

  // On 3rd doubles, send to jail
  if (state.doublesCount >= MAX_DOUBLES) {
    player.position = 10;
    player.inJail = true;
    player.jailTurns = 0;
    state.doublesCount = 0;
    state.turnPhase = "endTurn";
    return false;
  }

  // Player should roll again
  return true;
}
