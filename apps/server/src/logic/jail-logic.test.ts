import { describe, it, expect } from "vitest";
import {
  sendToJail,
  payJailFine,
  useEscapeCard,
  handleJailTurn,
} from "./jail-logic";
import { createTestState } from "../__test-utils__/game-state-factory";
import { JAIL_FINE } from "@arcane-estates/shared";

describe("sendToJail", () => {
  it("sets player position to 10 and marks as jailed", () => {
    const state = createTestState(2);
    const player = state.players.get("player1")!;
    player.position = 25;
    sendToJail(state, "player1");
    expect(player.position).toBe(10);
    expect(player.inJail).toBe(true);
    expect(player.jailTurns).toBe(0);
  });

  it("does nothing for invalid player", () => {
    const state = createTestState(2);
    sendToJail(state, "nonexistent"); // should not throw
  });

  it("resets jail turns to 0", () => {
    const state = createTestState(2);
    const player = state.players.get("player1")!;
    player.jailTurns = 2;
    sendToJail(state, "player1");
    expect(player.jailTurns).toBe(0);
  });
});

describe("payJailFine", () => {
  it("deducts JAIL_FINE and releases from jail", () => {
    const state = createTestState(2);
    const player = state.players.get("player1")!;
    player.inJail = true;
    player.jailTurns = 1;
    const result = payJailFine(state, "player1");
    expect(result).toBe(true);
    expect(player.crowns).toBe(1500 - JAIL_FINE);
    expect(player.inJail).toBe(false);
    expect(player.jailTurns).toBe(0);
  });

  it("returns false if player cannot afford fine", () => {
    const state = createTestState(2);
    const player = state.players.get("player1")!;
    player.inJail = true;
    player.crowns = JAIL_FINE - 1;
    const result = payJailFine(state, "player1");
    expect(result).toBe(false);
    expect(player.inJail).toBe(true);
  });

  it("returns false for invalid player", () => {
    const state = createTestState(2);
    expect(payJailFine(state, "nonexistent")).toBe(false);
  });
});

describe("useEscapeCard", () => {
  it("releases from jail and removes escape card", () => {
    const state = createTestState(2);
    const player = state.players.get("player1")!;
    player.inJail = true;
    player.hasEscapeCard = true;
    player.jailTurns = 2;
    const result = useEscapeCard(state, "player1");
    expect(result).toBe(true);
    expect(player.hasEscapeCard).toBe(false);
    expect(player.inJail).toBe(false);
    expect(player.jailTurns).toBe(0);
  });

  it("returns false if player has no escape card", () => {
    const state = createTestState(2);
    const player = state.players.get("player1")!;
    player.inJail = true;
    player.hasEscapeCard = false;
    const result = useEscapeCard(state, "player1");
    expect(result).toBe(false);
    expect(player.inJail).toBe(true);
  });

  it("returns false for invalid player", () => {
    const state = createTestState(2);
    expect(useEscapeCard(state, "nonexistent")).toBe(false);
  });
});

describe("handleJailTurn", () => {
  it("releases player on doubles", () => {
    const state = createTestState(2);
    const player = state.players.get("player1")!;
    player.inJail = true;
    const result = handleJailTurn(state, "player1", [3, 3]);
    expect(result).toBe(true);
    expect(player.inJail).toBe(false);
    expect(player.jailTurns).toBe(0);
  });

  it("increments jail turns on non-doubles", () => {
    const state = createTestState(2);
    const player = state.players.get("player1")!;
    player.inJail = true;
    const result = handleJailTurn(state, "player1", [2, 5]);
    expect(result).toBe(false);
    expect(player.inJail).toBe(true);
    expect(player.jailTurns).toBe(1);
  });

  it("auto-releases and charges fine on 3rd non-doubles turn", () => {
    const state = createTestState(2);
    const player = state.players.get("player1")!;
    player.inJail = true;
    player.jailTurns = 2; // already had 2 turns
    const result = handleJailTurn(state, "player1", [2, 5]);
    expect(result).toBe(true);
    expect(player.inJail).toBe(false);
    expect(player.crowns).toBe(1500 - JAIL_FINE);
  });

  it("bankrupts player on 3rd turn if they cannot afford fine", () => {
    const state = createTestState(2);
    const player = state.players.get("player1")!;
    player.inJail = true;
    player.jailTurns = 2;
    player.crowns = 10;
    const result = handleJailTurn(state, "player1", [2, 5]);
    expect(result).toBe(false);
    expect(player.bankrupt).toBe(true);
    expect(player.crowns).toBe(0);
    expect(player.inJail).toBe(false);
  });

  it("returns false if player is not in jail", () => {
    const state = createTestState(2);
    const result = handleJailTurn(state, "player1", [3, 3]);
    expect(result).toBe(false);
  });
});
