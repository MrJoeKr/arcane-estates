import { JAIL_FINE, MAX_JAIL_TURNS } from "@arcane-estates/shared";
import { GameState } from "../state/GameState";

export function sendToJail(state: GameState, playerId: string): void {
  const player = state.players.get(playerId);
  if (!player) return;

  player.position = 10;
  player.inJail = true;
  player.jailTurns = 0;
}

export function payJailFine(state: GameState, playerId: string): boolean {
  const player = state.players.get(playerId);
  if (!player) return false;

  if (player.crowns < JAIL_FINE) {
    return false;
  }

  player.crowns -= JAIL_FINE;
  player.inJail = false;
  player.jailTurns = 0;
  return true;
}

export function useEscapeCard(state: GameState, playerId: string): boolean {
  const player = state.players.get(playerId);
  if (!player) return false;

  if (!player.hasEscapeCard) {
    return false;
  }

  player.hasEscapeCard = false;
  player.inJail = false;
  player.jailTurns = 0;
  return true;
}

export function handleJailTurn(state: GameState, playerId: string, dice: [number, number]): boolean {
  const player = state.players.get(playerId);
  if (!player || !player.inJail) return false;

  const [die1, die2] = dice;
  const isDoubles = die1 === die2;

  // If rolled doubles, release and move
  if (isDoubles) {
    player.inJail = false;
    player.jailTurns = 0;
    return true;
  }

  // Increment jail turns
  player.jailTurns++;

  // If 3rd turn, force pay fine and release
  if (player.jailTurns >= MAX_JAIL_TURNS) {
    if (player.crowns >= JAIL_FINE) {
      player.crowns -= JAIL_FINE;
      player.inJail = false;
      player.jailTurns = 0;
      return true;
    } else {
      // Can't afford fine - bankrupt
      player.crowns = 0;
      player.bankrupt = true;
      player.inJail = false;
      player.jailTurns = 0;
      player.properties.clear();
      return false;
    }
  }

  return false;
}
