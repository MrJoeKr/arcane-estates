import { describe, it, expect } from "vitest";
import {
  canBuyProperty,
  buyProperty,
  calculateRent,
  payRent,
  canBuildTower,
  buildTower,
  sellTower,
  mortgageProperty,
  unmortgageProperty,
} from "./property-logic";
import { BOARD_SPACES } from "../data/board-data";
import {
  createTestState,
  assignProperty,
  assignColorSet,
  setTowers,
} from "../__test-utils__/game-state-factory";

// ─── canBuyProperty ───────────────────────────────────────────────

describe("canBuyProperty", () => {
  it("returns true for an unowned property the player can afford", () => {
    const state = createTestState(2);
    const player = state.players.get("player1")!;
    player.position = 1; // Dusty Attic, cost 60
    expect(canBuyProperty(state, "player1", 1)).toBe(true);
  });

  it("returns false if player does not exist", () => {
    const state = createTestState(2);
    expect(canBuyProperty(state, "nonexistent", 1)).toBe(false);
  });

  it("returns false for invalid space index", () => {
    const state = createTestState(2);
    expect(canBuyProperty(state, "player1", 99)).toBe(false);
  });

  it("returns false for non-purchasable spaces (go, jail, tax, etc.)", () => {
    const state = createTestState(2);
    expect(canBuyProperty(state, "player1", 0)).toBe(false);  // GO
    expect(canBuyProperty(state, "player1", 10)).toBe(false); // Jail
    expect(canBuyProperty(state, "player1", 4)).toBe(false);  // Tax
    expect(canBuyProperty(state, "player1", 7)).toBe(false);  // Fate Card
    expect(canBuyProperty(state, "player1", 2)).toBe(false);  // Guild Card
    expect(canBuyProperty(state, "player1", 20)).toBe(false); // Free Parking
    expect(canBuyProperty(state, "player1", 30)).toBe(false); // Go to Jail
  });

  it("returns false if property is already owned", () => {
    const state = createTestState(2);
    assignProperty(state, "player2", 1);
    expect(canBuyProperty(state, "player1", 1)).toBe(false);
  });

  it("returns false if player cannot afford it", () => {
    const state = createTestState(2);
    const player = state.players.get("player1")!;
    player.crowns = 50; // Dusty Attic costs 60
    expect(canBuyProperty(state, "player1", 1)).toBe(false);
  });

  it("returns true for portal stations", () => {
    const state = createTestState(2);
    expect(canBuyProperty(state, "player1", 5)).toBe(true);
  });

  it("returns true for mana wells", () => {
    const state = createTestState(2);
    expect(canBuyProperty(state, "player1", 12)).toBe(true);
  });

  it("returns false if player has exactly 0 crowns less than cost", () => {
    const state = createTestState(2);
    const player = state.players.get("player1")!;
    player.crowns = 59; // Dusty Attic costs 60
    expect(canBuyProperty(state, "player1", 1)).toBe(false);
  });

  it("returns true if player has exactly the cost", () => {
    const state = createTestState(2);
    const player = state.players.get("player1")!;
    player.crowns = 60; // Dusty Attic costs 60
    expect(canBuyProperty(state, "player1", 1)).toBe(true);
  });
});

// ─── buyProperty ──────────────────────────────────────────────────

describe("buyProperty", () => {
  it("deducts the cost from the player's crowns", () => {
    const state = createTestState(2);
    buyProperty(state, "player1", 1);
    const player = state.players.get("player1")!;
    expect(player.crowns).toBe(1500 - 60);
  });

  it("sets the space ownerId to the player", () => {
    const state = createTestState(2);
    buyProperty(state, "player1", 1);
    expect(state.spaces[1].ownerId).toBe("player1");
  });

  it("adds the space index to the player's properties", () => {
    const state = createTestState(2);
    buyProperty(state, "player1", 1);
    const player = state.players.get("player1")!;
    expect(Array.from(player.properties)).toContain(1);
  });

  it("does nothing for an invalid player", () => {
    const state = createTestState(2);
    buyProperty(state, "nonexistent", 1);
    expect(state.spaces[1].ownerId).toBe("");
  });

  it("buying a portal deducts 200 crowns", () => {
    const state = createTestState(2);
    buyProperty(state, "player1", 5);
    const player = state.players.get("player1")!;
    expect(player.crowns).toBe(1500 - 200);
    expect(state.spaces[5].ownerId).toBe("player1");
  });
});

// ─── calculateRent ────────────────────────────────────────────────

describe("calculateRent", () => {
  it("returns 0 for unowned property", () => {
    const state = createTestState(2);
    expect(calculateRent(state, 1, 7)).toBe(0);
  });

  it("returns 0 for mortgaged property", () => {
    const state = createTestState(2);
    assignProperty(state, "player1", 1);
    state.spaces[1].isMortgaged = true;
    expect(calculateRent(state, 1, 7)).toBe(0);
  });

  it("returns base rent for a property without color set", () => {
    const state = createTestState(2);
    assignProperty(state, "player1", 1); // Dusty Attic, rent[0] = 2
    expect(calculateRent(state, 1, 7)).toBe(2);
  });

  it("returns double base rent when owner has full color set", () => {
    const state = createTestState(2);
    assignColorSet(state, "player1", "brown"); // spaces 1, 3
    expect(calculateRent(state, 1, 7)).toBe(4); // 2 * 2
    expect(calculateRent(state, 3, 7)).toBe(8); // 4 * 2
  });

  it("returns rent for 1 tower", () => {
    const state = createTestState(2);
    assignColorSet(state, "player1", "brown");
    setTowers(state, 1, 1);
    expect(calculateRent(state, 1, 7)).toBe(10); // rent[1]
  });

  it("returns rent for 2 towers", () => {
    const state = createTestState(2);
    assignColorSet(state, "player1", "brown");
    setTowers(state, 1, 2);
    expect(calculateRent(state, 1, 7)).toBe(30); // rent[2]
  });

  it("returns rent for 3 towers", () => {
    const state = createTestState(2);
    assignColorSet(state, "player1", "brown");
    setTowers(state, 1, 3);
    expect(calculateRent(state, 1, 7)).toBe(90); // rent[3]
  });

  it("returns rent for 4 towers", () => {
    const state = createTestState(2);
    assignColorSet(state, "player1", "brown");
    setTowers(state, 1, 4);
    expect(calculateRent(state, 1, 7)).toBe(160); // rent[4]
  });

  it("returns fortress rent", () => {
    const state = createTestState(2);
    assignColorSet(state, "player1", "brown");
    setTowers(state, 1, 5); // sets hasFortress=true
    expect(calculateRent(state, 1, 7)).toBe(250); // rent[5]
  });

  // Portal rent tests
  it("returns 25 for 1 portal owned", () => {
    const state = createTestState(2);
    assignProperty(state, "player1", 5);
    expect(calculateRent(state, 5, 7)).toBe(25);
  });

  it("returns 50 for 2 portals owned", () => {
    const state = createTestState(2);
    assignProperty(state, "player1", 5);
    assignProperty(state, "player1", 15);
    expect(calculateRent(state, 5, 7)).toBe(50);
    expect(calculateRent(state, 15, 7)).toBe(50);
  });

  it("returns 100 for 3 portals owned", () => {
    const state = createTestState(2);
    assignProperty(state, "player1", 5);
    assignProperty(state, "player1", 15);
    assignProperty(state, "player1", 25);
    expect(calculateRent(state, 5, 7)).toBe(100);
  });

  it("returns 200 for 4 portals owned", () => {
    const state = createTestState(2);
    assignProperty(state, "player1", 5);
    assignProperty(state, "player1", 15);
    assignProperty(state, "player1", 25);
    assignProperty(state, "player1", 35);
    expect(calculateRent(state, 5, 7)).toBe(200);
  });

  // Mana well rent tests
  it("returns diceTotal * 4 for 1 mana well owned", () => {
    const state = createTestState(2);
    assignProperty(state, "player1", 12);
    expect(calculateRent(state, 12, 7)).toBe(28); // 7 * 4
    expect(calculateRent(state, 12, 10)).toBe(40); // 10 * 4
  });

  it("returns diceTotal * 10 for 2 mana wells owned", () => {
    const state = createTestState(2);
    assignProperty(state, "player1", 12);
    assignProperty(state, "player1", 28);
    expect(calculateRent(state, 12, 7)).toBe(70); // 7 * 10
    expect(calculateRent(state, 28, 7)).toBe(70);
  });

  it("returns 0 for non-property space types", () => {
    const state = createTestState(2);
    expect(calculateRent(state, 0, 7)).toBe(0);  // GO
    expect(calculateRent(state, 10, 7)).toBe(0); // Jail
  });

  it("returns correct rent for dark-blue fortress", () => {
    const state = createTestState(2);
    assignColorSet(state, "player1", "dark-blue");
    setTowers(state, 39, 5); // fortress on Arcanum Throne Room
    expect(calculateRent(state, 39, 7)).toBe(2000); // rent[5]
  });
});

// ─── payRent ──────────────────────────────────────────────────────

describe("payRent", () => {
  it("transfers the exact rent amount between players", () => {
    const state = createTestState(2);
    payRent(state, "player1", "player2", 100);
    expect(state.players.get("player1")!.crowns).toBe(1400);
    expect(state.players.get("player2")!.crowns).toBe(1600);
  });

  it("bankrupts the payer if they cannot afford rent", () => {
    const state = createTestState(2);
    const payer = state.players.get("player1")!;
    payer.crowns = 50;
    payRent(state, "player1", "player2", 100);
    expect(payer.crowns).toBe(0);
    expect(payer.bankrupt).toBe(true);
    expect(state.players.get("player2")!.crowns).toBe(1550); // 1500 + 50
  });

  it("transfers all properties to owner on bankruptcy", () => {
    const state = createTestState(2);
    assignProperty(state, "player1", 1);
    assignProperty(state, "player1", 3);
    const payer = state.players.get("player1")!;
    payer.crowns = 50;
    payRent(state, "player1", "player2", 100);

    expect(state.spaces[1].ownerId).toBe("player2");
    expect(state.spaces[3].ownerId).toBe("player2");
    expect(Array.from(state.players.get("player2")!.properties)).toContain(1);
    expect(Array.from(state.players.get("player2")!.properties)).toContain(3);
    expect(payer.properties.length).toBe(0);
  });

  it("transfers escape card on bankruptcy", () => {
    const state = createTestState(2);
    const payer = state.players.get("player1")!;
    payer.crowns = 0;
    payer.hasEscapeCard = true;
    payRent(state, "player1", "player2", 100);
    expect(payer.hasEscapeCard).toBe(false);
    expect(state.players.get("player2")!.hasEscapeCard).toBe(true);
  });

  it("does not bankrupt if payer has exactly enough", () => {
    const state = createTestState(2);
    const payer = state.players.get("player1")!;
    payer.crowns = 100;
    payRent(state, "player1", "player2", 100);
    expect(payer.crowns).toBe(0);
    expect(payer.bankrupt).toBe(false);
  });

  it("does nothing for invalid player ids", () => {
    const state = createTestState(2);
    payRent(state, "nonexistent", "player2", 100);
    expect(state.players.get("player2")!.crowns).toBe(1500);
  });
});

// ─── canBuildTower ────────────────────────────────────────────────

describe("canBuildTower", () => {
  it("returns true when all conditions are met", () => {
    const state = createTestState(2);
    assignColorSet(state, "player1", "brown");
    expect(canBuildTower(state, "player1", 1)).toBe(true);
  });

  it("returns false if player doesn't own the property", () => {
    const state = createTestState(2);
    assignColorSet(state, "player2", "brown");
    expect(canBuildTower(state, "player1", 1)).toBe(false);
  });

  it("returns false if property is mortgaged", () => {
    const state = createTestState(2);
    assignColorSet(state, "player1", "brown");
    state.spaces[1].isMortgaged = true;
    expect(canBuildTower(state, "player1", 1)).toBe(false);
  });

  it("returns false without full color set", () => {
    const state = createTestState(2);
    assignProperty(state, "player1", 1); // only one brown
    expect(canBuildTower(state, "player1", 1)).toBe(false);
  });

  it("returns false if property already has a fortress", () => {
    const state = createTestState(2);
    assignColorSet(state, "player1", "brown");
    setTowers(state, 1, 5); // fortress
    expect(canBuildTower(state, "player1", 1)).toBe(false);
  });

  it("returns false if property already has 4 towers", () => {
    const state = createTestState(2);
    assignColorSet(state, "player1", "brown");
    setTowers(state, 1, 4);
    // But the even-build rule should prevent building on 1 when 3 has 0 towers
    // Actually with 4 towers, space.towers >= 4 returns false directly
    expect(canBuildTower(state, "player1", 1)).toBe(false);
  });

  it("returns false if player cannot afford the house cost", () => {
    const state = createTestState(2);
    assignColorSet(state, "player1", "brown");
    const player = state.players.get("player1")!;
    player.crowns = 10; // houseCost = 50
    expect(canBuildTower(state, "player1", 1)).toBe(false);
  });

  it("enforces even-build rule: cannot build if this property has more towers than min in group", () => {
    const state = createTestState(2);
    assignColorSet(state, "player1", "brown");
    setTowers(state, 1, 1); // space 1 has 1 tower
    // space 3 still has 0 towers
    // space 1 has towers(1) > minTowers(0), so cannot build
    expect(canBuildTower(state, "player1", 1)).toBe(false);
    // But we CAN build on space 3 (0 towers, min is 0)
    expect(canBuildTower(state, "player1", 3)).toBe(true);
  });

  it("returns false for non-property spaces", () => {
    const state = createTestState(2);
    expect(canBuildTower(state, "player1", 5)).toBe(false); // portal
    expect(canBuildTower(state, "player1", 12)).toBe(false); // mana well
  });
});

// ─── buildTower ───────────────────────────────────────────────────

describe("buildTower", () => {
  it("increments tower count and deducts cost", () => {
    const state = createTestState(2);
    assignColorSet(state, "player1", "brown");
    buildTower(state, "player1", 1);
    expect(state.spaces[1].towers).toBe(1);
    expect(state.players.get("player1")!.crowns).toBe(1500 - 50);
  });

  it("converts 4 towers to fortress", () => {
    const state = createTestState(2);
    assignColorSet(state, "player1", "brown");
    setTowers(state, 1, 4);
    buildTower(state, "player1", 1);
    expect(state.spaces[1].towers).toBe(0);
    expect(state.spaces[1].hasFortress).toBe(true);
  });

  it("deducts the correct house cost per property group", () => {
    const state = createTestState(2);
    assignColorSet(state, "player1", "red");
    buildTower(state, "player1", 21); // houseCost = 150
    expect(state.players.get("player1")!.crowns).toBe(1500 - 150);
  });
});

// ─── sellTower ────────────────────────────────────────────────────

describe("sellTower", () => {
  it("decrements tower count and refunds half cost", () => {
    const state = createTestState(2);
    assignColorSet(state, "player1", "brown");
    setTowers(state, 1, 2);
    sellTower(state, "player1", 1);
    expect(state.spaces[1].towers).toBe(1);
    expect(state.players.get("player1")!.crowns).toBe(1500 + 25); // half of 50
  });

  it("converts fortress back to 4 towers", () => {
    const state = createTestState(2);
    assignColorSet(state, "player1", "brown");
    setTowers(state, 1, 5); // fortress
    sellTower(state, "player1", 1);
    expect(state.spaces[1].hasFortress).toBe(false);
    expect(state.spaces[1].towers).toBe(4);
    expect(state.players.get("player1")!.crowns).toBe(1500 + 25);
  });

  it("does nothing when towers are 0", () => {
    const state = createTestState(2);
    assignColorSet(state, "player1", "brown");
    sellTower(state, "player1", 1);
    expect(state.spaces[1].towers).toBe(0);
    expect(state.players.get("player1")!.crowns).toBe(1500);
  });
});

// ─── mortgageProperty ─────────────────────────────────────────────

describe("mortgageProperty", () => {
  it("mortgages an owned property and gives mortgage value", () => {
    const state = createTestState(2);
    assignProperty(state, "player1", 1); // mortgage = 30
    mortgageProperty(state, "player1", 1);
    expect(state.spaces[1].isMortgaged).toBe(true);
    expect(state.players.get("player1")!.crowns).toBe(1500 + 30);
  });

  it("does nothing if player doesn't own the property", () => {
    const state = createTestState(2);
    assignProperty(state, "player2", 1);
    mortgageProperty(state, "player1", 1);
    expect(state.spaces[1].isMortgaged).toBe(false);
  });

  it("does nothing if already mortgaged", () => {
    const state = createTestState(2);
    assignProperty(state, "player1", 1);
    state.spaces[1].isMortgaged = true;
    const crownsBefore = state.players.get("player1")!.crowns;
    mortgageProperty(state, "player1", 1);
    expect(state.players.get("player1")!.crowns).toBe(crownsBefore);
  });

  it("cannot mortgage if there are towers", () => {
    const state = createTestState(2);
    assignColorSet(state, "player1", "brown");
    setTowers(state, 1, 1);
    mortgageProperty(state, "player1", 1);
    expect(state.spaces[1].isMortgaged).toBe(false);
  });

  it("cannot mortgage if there is a fortress", () => {
    const state = createTestState(2);
    assignColorSet(state, "player1", "brown");
    setTowers(state, 1, 5);
    mortgageProperty(state, "player1", 1);
    expect(state.spaces[1].isMortgaged).toBe(false);
  });
});

// ─── unmortgageProperty ───────────────────────────────────────────

describe("unmortgageProperty", () => {
  it("unmortgages and deducts 110% of mortgage value", () => {
    const state = createTestState(2);
    assignProperty(state, "player1", 1); // mortgage = 30
    state.spaces[1].isMortgaged = true;
    unmortgageProperty(state, "player1", 1);
    expect(state.spaces[1].isMortgaged).toBe(false);
    // cost = floor(30 * 1.1) = 33
    expect(state.players.get("player1")!.crowns).toBe(1500 - 33);
  });

  it("does nothing if not mortgaged", () => {
    const state = createTestState(2);
    assignProperty(state, "player1", 1);
    unmortgageProperty(state, "player1", 1);
    expect(state.players.get("player1")!.crowns).toBe(1500);
  });

  it("does nothing if player doesn't own the property", () => {
    const state = createTestState(2);
    assignProperty(state, "player2", 1);
    state.spaces[1].isMortgaged = true;
    unmortgageProperty(state, "player1", 1);
    expect(state.spaces[1].isMortgaged).toBe(true);
  });

  it("does nothing if player cannot afford the unmortgage cost", () => {
    const state = createTestState(2);
    assignProperty(state, "player1", 1); // mortgage = 30, cost = 33
    state.spaces[1].isMortgaged = true;
    state.players.get("player1")!.crowns = 30;
    unmortgageProperty(state, "player1", 1);
    expect(state.spaces[1].isMortgaged).toBe(true);
    expect(state.players.get("player1")!.crowns).toBe(30);
  });
});
