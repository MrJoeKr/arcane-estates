import { describe, it, expect, beforeEach } from "vitest";
import {
  startAuction,
  placeBid,
  handleAuctionPass,
  endAuction,
} from "./auction-logic";
import { createTestState, assignProperty } from "../__test-utils__/game-state-factory";

describe("startAuction", () => {
  it("initializes auction state correctly", () => {
    const state = createTestState(2);
    startAuction(state, 1);
    expect(state.auction.active).toBe(true);
    expect(state.auction.spaceIndex).toBe(1);
    expect(state.auction.currentBid).toBe(0);
    expect(state.auction.currentBidderId).toBe("");
    expect(state.auction.timeRemaining).toBe(30);
  });

  it("can start auction on any purchasable space", () => {
    const state = createTestState(2);
    startAuction(state, 5); // portal
    expect(state.auction.spaceIndex).toBe(5);
    expect(state.auction.active).toBe(true);
  });
});

describe("placeBid", () => {
  it("accepts a valid bid higher than current", () => {
    const state = createTestState(2);
    startAuction(state, 1);
    const result = placeBid(state, "player1", 50);
    expect(result).toBe(true);
    expect(state.auction.currentBid).toBe(50);
    expect(state.auction.currentBidderId).toBe("player1");
  });

  it("rejects a bid equal to current bid", () => {
    const state = createTestState(2);
    startAuction(state, 1);
    placeBid(state, "player1", 50);
    const result = placeBid(state, "player2", 50);
    expect(result).toBe(false);
    expect(state.auction.currentBidderId).toBe("player1");
  });

  it("rejects a bid lower than current bid", () => {
    const state = createTestState(2);
    startAuction(state, 1);
    placeBid(state, "player1", 50);
    const result = placeBid(state, "player2", 30);
    expect(result).toBe(false);
  });

  it("rejects a bid that exceeds player's crowns", () => {
    const state = createTestState(2);
    startAuction(state, 1);
    state.players.get("player1")!.crowns = 40;
    const result = placeBid(state, "player1", 50);
    expect(result).toBe(false);
  });

  it("rejects a bid from nonexistent player", () => {
    const state = createTestState(2);
    startAuction(state, 1);
    const result = placeBid(state, "nonexistent", 50);
    expect(result).toBe(false);
  });

  it("allows overbidding the previous bidder", () => {
    const state = createTestState(2);
    startAuction(state, 1);
    placeBid(state, "player1", 50);
    const result = placeBid(state, "player2", 60);
    expect(result).toBe(true);
    expect(state.auction.currentBid).toBe(60);
    expect(state.auction.currentBidderId).toBe("player2");
  });
});

describe("handleAuctionPass", () => {
  it("ends auction when all active players pass", () => {
    const state = createTestState(2);
    startAuction(state, 1);
    handleAuctionPass(state, "player1");
    handleAuctionPass(state, "player2");
    expect(state.auction.active).toBe(false);
  });

  it("does not end auction if not all active players have passed", () => {
    const state = createTestState(3);
    startAuction(state, 1);
    handleAuctionPass(state, "player1");
    expect(state.auction.active).toBe(true);
  });

  it("skips bankrupt players when counting active players", () => {
    const state = createTestState(3);
    state.players.get("player3")!.bankrupt = true;
    startAuction(state, 1);
    handleAuctionPass(state, "player1");
    handleAuctionPass(state, "player2");
    // Only 2 active players, both passed
    expect(state.auction.active).toBe(false);
  });
});

describe("endAuction", () => {
  it("awards property to winning bidder and deducts crowns", () => {
    const state = createTestState(2);
    startAuction(state, 1);
    placeBid(state, "player1", 100);
    endAuction(state);

    const player = state.players.get("player1")!;
    expect(player.crowns).toBe(1400);
    expect(state.spaces[1].ownerId).toBe("player1");
    expect(Array.from(player.properties)).toContain(1);
    expect(state.auction.active).toBe(false);
  });

  it("does not assign property when no one bid", () => {
    const state = createTestState(2);
    startAuction(state, 1);
    endAuction(state);

    expect(state.spaces[1].ownerId).toBe("");
    expect(state.auction.active).toBe(false);
  });

  it("resets all auction state fields", () => {
    const state = createTestState(2);
    startAuction(state, 1);
    placeBid(state, "player1", 100);
    endAuction(state);

    expect(state.auction.active).toBe(false);
    expect(state.auction.spaceIndex).toBe(0);
    expect(state.auction.currentBid).toBe(0);
    expect(state.auction.currentBidderId).toBe("");
    expect(state.auction.timeRemaining).toBe(0);
  });
});
