import { describe, it, expect } from "vitest";
import { getNextPlayerId, advanceTurn, handleDoubles } from "./turn-manager";
import { createTestState } from "../__test-utils__/game-state-factory";

describe("getNextPlayerId", () => {
  it("returns the next player in order", () => {
    const state = createTestState(3);
    state.currentPlayerId = "player1";
    expect(getNextPlayerId(state)).toBe("player2");
  });

  it("wraps around to the first player", () => {
    const state = createTestState(3);
    state.currentPlayerId = "player3";
    expect(getNextPlayerId(state)).toBe("player1");
  });

  it("skips bankrupt players", () => {
    const state = createTestState(3);
    state.currentPlayerId = "player1";
    state.players.get("player2")!.bankrupt = true;
    expect(getNextPlayerId(state)).toBe("player3");
  });

  it("skips multiple bankrupt players", () => {
    const state = createTestState(4);
    state.currentPlayerId = "player1";
    state.players.get("player2")!.bankrupt = true;
    state.players.get("player3")!.bankrupt = true;
    expect(getNextPlayerId(state)).toBe("player4");
  });

  it("returns current player if all others are bankrupt", () => {
    const state = createTestState(3);
    state.currentPlayerId = "player1";
    state.players.get("player2")!.bankrupt = true;
    state.players.get("player3")!.bankrupt = true;
    // Only player1 is not bankrupt, but the function checks all players
    // Since player1 is also not bankrupt, it will find player1 after wrapping
    expect(getNextPlayerId(state)).toBe("player1");
  });
});

describe("advanceTurn", () => {
  it("sets current player to the next player", () => {
    const state = createTestState(3);
    state.currentPlayerId = "player1";
    advanceTurn(state);
    expect(state.currentPlayerId).toBe("player2");
  });

  it("resets turn phase to roll", () => {
    const state = createTestState(2);
    state.turnPhase = "postRoll";
    advanceTurn(state);
    expect(state.turnPhase).toBe("roll");
  });

  it("resets doubles count to 0", () => {
    const state = createTestState(2);
    state.doublesCount = 2;
    advanceTurn(state);
    expect(state.doublesCount).toBe(0);
  });
});

describe("handleDoubles", () => {
  it("returns false for non-doubles", () => {
    const state = createTestState(2);
    state.dice[0] = 3;
    state.dice[1] = 5;
    const result = handleDoubles(state);
    expect(result).toBe(false);
    expect(state.doublesCount).toBe(0);
  });

  it("increments doubles count and returns true for first doubles", () => {
    const state = createTestState(2);
    state.dice[0] = 4;
    state.dice[1] = 4;
    const result = handleDoubles(state);
    expect(result).toBe(true);
    expect(state.doublesCount).toBe(1);
  });

  it("sends player to jail on 3rd doubles", () => {
    const state = createTestState(2);
    state.doublesCount = 2;
    state.dice[0] = 4;
    state.dice[1] = 4;
    const player = state.players.get("player1")!;
    const result = handleDoubles(state);
    expect(result).toBe(false);
    expect(player.position).toBe(10);
    expect(player.inJail).toBe(true);
    expect(state.doublesCount).toBe(0);
    expect(state.turnPhase).toBe("endTurn");
  });
});
