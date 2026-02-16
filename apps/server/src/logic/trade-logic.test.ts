import { describe, it, expect } from "vitest";
import { proposeTrade, acceptTrade, rejectTrade } from "./trade-logic";
import {
  createTestState,
  assignProperty,
} from "../__test-utils__/game-state-factory";
import type { TradeOfferData } from "@arcane-estates/shared";

describe("proposeTrade", () => {
  it("creates a trade offer with valid data", () => {
    const state = createTestState(2);
    assignProperty(state, "player1", 1);
    assignProperty(state, "player2", 3);
    const offer: TradeOfferData = {
      toId: "player2",
      offerProperties: [1],
      offerCrowns: 100,
      requestProperties: [3],
      requestCrowns: 50,
    };
    const result = proposeTrade(state, "player1", offer);
    expect(result).toBe(true);
    expect(state.trade).not.toBeNull();
    expect(state.trade!.fromId).toBe("player1");
    expect(state.trade!.toId).toBe("player2");
    expect(state.trade!.offerCrowns).toBe(100);
    expect(state.trade!.requestCrowns).toBe(50);
  });

  it("rejects if offered property is not owned by proposer", () => {
    const state = createTestState(2);
    assignProperty(state, "player2", 1); // player2 owns it, not player1
    const offer: TradeOfferData = {
      toId: "player2",
      offerProperties: [1],
      offerCrowns: 0,
      requestProperties: [],
      requestCrowns: 0,
    };
    const result = proposeTrade(state, "player1", offer);
    expect(result).toBe(false);
    expect(state.trade).toBeNull();
  });

  it("rejects if requested property is not owned by target", () => {
    const state = createTestState(2);
    assignProperty(state, "player1", 1); // player1 owns it, not player2
    const offer: TradeOfferData = {
      toId: "player2",
      offerProperties: [],
      offerCrowns: 0,
      requestProperties: [1],
      requestCrowns: 0,
    };
    const result = proposeTrade(state, "player1", offer);
    expect(result).toBe(false);
  });

  it("rejects if proposer doesn't have enough crowns", () => {
    const state = createTestState(2);
    state.players.get("player1")!.crowns = 50;
    const offer: TradeOfferData = {
      toId: "player2",
      offerProperties: [],
      offerCrowns: 100,
      requestProperties: [],
      requestCrowns: 0,
    };
    const result = proposeTrade(state, "player1", offer);
    expect(result).toBe(false);
  });

  it("rejects if target doesn't have enough crowns for requested amount", () => {
    const state = createTestState(2);
    state.players.get("player2")!.crowns = 50;
    const offer: TradeOfferData = {
      toId: "player2",
      offerProperties: [],
      offerCrowns: 0,
      requestProperties: [],
      requestCrowns: 100,
    };
    const result = proposeTrade(state, "player1", offer);
    expect(result).toBe(false);
  });

  it("rejects for invalid player ids", () => {
    const state = createTestState(2);
    const offer: TradeOfferData = {
      toId: "nonexistent",
      offerProperties: [],
      offerCrowns: 0,
      requestProperties: [],
      requestCrowns: 0,
    };
    const result = proposeTrade(state, "player1", offer);
    expect(result).toBe(false);
  });
});

describe("acceptTrade", () => {
  it("transfers properties and crowns both ways", () => {
    const state = createTestState(2);
    assignProperty(state, "player1", 1);
    assignProperty(state, "player2", 3);
    const offer: TradeOfferData = {
      toId: "player2",
      offerProperties: [1],
      offerCrowns: 100,
      requestProperties: [3],
      requestCrowns: 50,
    };
    proposeTrade(state, "player1", offer);
    acceptTrade(state);

    const p1 = state.players.get("player1")!;
    const p2 = state.players.get("player2")!;

    // Crowns: player1 paid 100, received 50 -> net -50
    expect(p1.crowns).toBe(1500 - 100 + 50);
    // Crowns: player2 received 100, paid 50 -> net +50
    expect(p2.crowns).toBe(1500 + 100 - 50);

    // Properties: 1 went from player1 to player2
    expect(state.spaces[1].ownerId).toBe("player2");
    expect(Array.from(p2.properties)).toContain(1);
    expect(Array.from(p1.properties)).not.toContain(1);

    // Properties: 3 went from player2 to player1
    expect(state.spaces[3].ownerId).toBe("player1");
    expect(Array.from(p1.properties)).toContain(3);
    expect(Array.from(p2.properties)).not.toContain(3);

    // Trade cleared
    expect(state.trade).toBeNull();
  });

  it("does nothing if no trade is active", () => {
    const state = createTestState(2);
    acceptTrade(state); // should not throw
    expect(state.players.get("player1")!.crowns).toBe(1500);
  });

  it("handles crowns-only trade (no properties)", () => {
    const state = createTestState(2);
    const offer: TradeOfferData = {
      toId: "player2",
      offerProperties: [],
      offerCrowns: 200,
      requestProperties: [],
      requestCrowns: 0,
    };
    proposeTrade(state, "player1", offer);
    acceptTrade(state);

    expect(state.players.get("player1")!.crowns).toBe(1300);
    expect(state.players.get("player2")!.crowns).toBe(1700);
  });

  it("handles property-only trade (no crowns)", () => {
    const state = createTestState(2);
    assignProperty(state, "player1", 1);
    assignProperty(state, "player2", 3);
    const offer: TradeOfferData = {
      toId: "player2",
      offerProperties: [1],
      offerCrowns: 0,
      requestProperties: [3],
      requestCrowns: 0,
    };
    proposeTrade(state, "player1", offer);
    acceptTrade(state);

    expect(state.spaces[1].ownerId).toBe("player2");
    expect(state.spaces[3].ownerId).toBe("player1");
    expect(state.players.get("player1")!.crowns).toBe(1500);
    expect(state.players.get("player2")!.crowns).toBe(1500);
  });
});

describe("rejectTrade", () => {
  it("clears the trade state", () => {
    const state = createTestState(2);
    assignProperty(state, "player1", 1);
    const offer: TradeOfferData = {
      toId: "player2",
      offerProperties: [1],
      offerCrowns: 0,
      requestProperties: [],
      requestCrowns: 0,
    };
    proposeTrade(state, "player1", offer);
    expect(state.trade).not.toBeNull();
    rejectTrade(state);
    expect(state.trade).toBeNull();
  });

  it("does nothing if no trade is active", () => {
    const state = createTestState(2);
    rejectTrade(state); // should not throw
    expect(state.trade).toBeNull();
  });
});
