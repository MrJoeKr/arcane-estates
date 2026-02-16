import { describe, it, expect } from "vitest";
import {
  canBuyProperty,
  buyProperty,
  calculateRent,
  payRent,
  canBuildTower,
  buildTower,
  mortgageProperty,
} from "../property-logic";
import { sendToJail, payJailFine, handleJailTurn } from "../jail-logic";
import { getNextPlayerId, advanceTurn, handleDoubles } from "../turn-manager";
import { startAuction, placeBid, endAuction, handleAuctionPass } from "../auction-logic";
import { proposeTrade, acceptTrade } from "../trade-logic";
import {
  createTestState,
  assignProperty,
  assignColorSet,
  setTowers,
} from "../../__test-utils__/game-state-factory";
import type { TradeOfferData } from "@arcane-estates/shared";

describe("Integration: Full purchase-and-rent cycle", () => {
  it("player buys property, another player lands and pays rent", () => {
    const state = createTestState(2);

    // Player 1 buys Dusty Attic (index 1, cost 60, base rent 2)
    expect(canBuyProperty(state, "player1", 1)).toBe(true);
    buyProperty(state, "player1", 1);
    expect(state.players.get("player1")!.crowns).toBe(1440);
    expect(state.spaces[1].ownerId).toBe("player1");

    // Player 2 lands on it and pays rent
    const rent = calculateRent(state, 1, 7);
    expect(rent).toBe(2);
    payRent(state, "player2", "player1", rent);
    expect(state.players.get("player2")!.crowns).toBe(1498);
    expect(state.players.get("player1")!.crowns).toBe(1442);
  });
});

describe("Integration: Color set doubles rent", () => {
  it("owning both brown properties doubles the base rent", () => {
    const state = createTestState(2);

    buyProperty(state, "player1", 1); // Dusty Attic
    buyProperty(state, "player1", 3); // Candle Corridor

    const rentDustyAttic = calculateRent(state, 1, 7);
    const rentCandleCorridor = calculateRent(state, 3, 7);

    // Base rents: 2, 4 => doubled: 4, 8
    expect(rentDustyAttic).toBe(4);
    expect(rentCandleCorridor).toBe(8);
  });
});

describe("Integration: Build towers and collect tower rent", () => {
  it("builds towers evenly and collects increased rent", () => {
    const state = createTestState(2);
    assignColorSet(state, "player1", "brown");

    // Build 1 tower on each brown property evenly
    expect(canBuildTower(state, "player1", 1)).toBe(true);
    buildTower(state, "player1", 1); // space 1: 1 tower
    expect(canBuildTower(state, "player1", 3)).toBe(true);
    buildTower(state, "player1", 3); // space 3: 1 tower

    // Now build 2nd tower on space 1
    expect(canBuildTower(state, "player1", 1)).toBe(true);
    buildTower(state, "player1", 1); // space 1: 2 towers

    // Rent on space 1 with 2 towers
    const rent = calculateRent(state, 1, 7);
    expect(rent).toBe(30); // rent[2] for Dusty Attic

    // Player cost: 3 towers * 50 = 150
    expect(state.players.get("player1")!.crowns).toBe(1500 - 150);
  });
});

describe("Integration: Bankruptcy triggers property transfer", () => {
  it("bankrupt player's properties and escape card transfer to rent collector", () => {
    const state = createTestState(2);
    assignProperty(state, "player2", 1);
    assignProperty(state, "player2", 3);
    state.players.get("player2")!.hasEscapeCard = true;

    // Give player2 very low crowns
    state.players.get("player2")!.crowns = 10;

    // Player2 must pay rent they can't afford
    payRent(state, "player2", "player1", 500);

    const p2 = state.players.get("player2")!;
    expect(p2.bankrupt).toBe(true);
    expect(p2.crowns).toBe(0);
    expect(p2.hasEscapeCard).toBe(false);
    expect(p2.properties.length).toBe(0);

    // Properties transferred to player1
    expect(state.spaces[1].ownerId).toBe("player1");
    expect(state.spaces[3].ownerId).toBe("player1");
    expect(state.players.get("player1")!.hasEscapeCard).toBe(true);
    expect(state.players.get("player1")!.crowns).toBe(1500 + 10);
  });
});

describe("Integration: Auction after decline", () => {
  it("property goes to auction, winning bidder gets it", () => {
    const state = createTestState(3);

    // Player 1 declines to buy, auction starts
    startAuction(state, 1); // Dusty Attic
    expect(state.auction.active).toBe(true);

    // Player 2 bids 50
    placeBid(state, "player2", 50);
    expect(state.auction.currentBid).toBe(50);

    // Player 3 bids 80
    placeBid(state, "player3", 80);
    expect(state.auction.currentBid).toBe(80);

    // Player 2 passes
    handleAuctionPass(state, "player2");
    // Player 1 passes
    handleAuctionPass(state, "player1");
    // Player 3 passes (already the highest bidder)
    handleAuctionPass(state, "player3");

    // All passed, auction should have ended via handleAuctionPass
    expect(state.auction.active).toBe(false);
    expect(state.spaces[1].ownerId).toBe("player3");
    expect(state.players.get("player3")!.crowns).toBe(1500 - 80);
  });
});

describe("Integration: Trade with properties and crowns", () => {
  it("two players exchange properties and crowns", () => {
    const state = createTestState(2);
    assignProperty(state, "player1", 1);
    assignProperty(state, "player1", 3);
    assignProperty(state, "player2", 6);

    const offer: TradeOfferData = {
      toId: "player2",
      offerProperties: [1, 3],
      offerCrowns: 50,
      requestProperties: [6],
      requestCrowns: 200,
    };

    expect(proposeTrade(state, "player1", offer)).toBe(true);
    acceptTrade(state);

    const p1 = state.players.get("player1")!;
    const p2 = state.players.get("player2")!;

    // Player1: gave props 1,3 and 50 crowns; received prop 6 and 200 crowns
    expect(p1.crowns).toBe(1500 - 50 + 200);
    expect(Array.from(p1.properties)).toEqual([6]);
    expect(state.spaces[1].ownerId).toBe("player2");
    expect(state.spaces[3].ownerId).toBe("player2");
    expect(state.spaces[6].ownerId).toBe("player1");

    // Player2: received props 1,3 and 50 crowns; gave prop 6 and 200 crowns
    expect(p2.crowns).toBe(1500 + 50 - 200);
    expect(Array.from(p2.properties)).toContain(1);
    expect(Array.from(p2.properties)).toContain(3);
    expect(Array.from(p2.properties)).not.toContain(6);
  });
});

describe("Integration: Jail escape sequence (3 turns)", () => {
  it("player stays in jail for 3 turns, auto-released on 3rd", () => {
    const state = createTestState(2);
    sendToJail(state, "player1");
    const player = state.players.get("player1")!;
    expect(player.inJail).toBe(true);
    expect(player.position).toBe(10);

    // Turn 1: no doubles
    let result = handleJailTurn(state, "player1", [2, 5]);
    expect(result).toBe(false);
    expect(player.inJail).toBe(true);
    expect(player.jailTurns).toBe(1);

    // Turn 2: no doubles
    result = handleJailTurn(state, "player1", [3, 6]);
    expect(result).toBe(false);
    expect(player.inJail).toBe(true);
    expect(player.jailTurns).toBe(2);

    // Turn 3: no doubles, auto-release with fine
    result = handleJailTurn(state, "player1", [1, 4]);
    expect(result).toBe(true);
    expect(player.inJail).toBe(false);
    expect(player.jailTurns).toBe(0);
    expect(player.crowns).toBe(1500 - 50); // JAIL_FINE = 50
  });
});

describe("Integration: Turn rotation with bankruptcies", () => {
  it("skips bankrupt players in turn order", () => {
    const state = createTestState(4);
    state.currentPlayerId = "player1";

    // Bankrupt players 2 and 3
    state.players.get("player2")!.bankrupt = true;
    state.players.get("player3")!.bankrupt = true;

    advanceTurn(state);
    expect(state.currentPlayerId).toBe("player4");

    advanceTurn(state);
    expect(state.currentPlayerId).toBe("player1");

    // Now bankrupt player4 too
    state.players.get("player4")!.bankrupt = true;

    advanceTurn(state);
    // Only player1 is not bankrupt, should come back to player1
    expect(state.currentPlayerId).toBe("player1");
  });

  it("handles doubles sending to jail then advancing turn", () => {
    const state = createTestState(2);
    state.currentPlayerId = "player1";
    state.doublesCount = 2;
    state.dice[0] = 4;
    state.dice[1] = 4;

    // 3rd doubles: send to jail
    const rollAgain = handleDoubles(state);
    expect(rollAgain).toBe(false);
    expect(state.players.get("player1")!.inJail).toBe(true);
    expect(state.turnPhase).toBe("endTurn");

    // Advance turn to player 2
    advanceTurn(state);
    expect(state.currentPlayerId).toBe("player2");
    expect(state.turnPhase).toBe("roll");
    expect(state.doublesCount).toBe(0);
  });
});
