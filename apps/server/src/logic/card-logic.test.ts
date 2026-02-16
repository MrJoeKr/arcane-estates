import { describe, it, expect, vi, afterEach } from "vitest";
import { drawCard, applyCardEffect } from "./card-logic";
import { FATE_CARDS, GUILD_CARDS } from "../data/card-data";
import {
  createTestState,
  assignProperty,
  setTowers,
  assignColorSet,
} from "../__test-utils__/game-state-factory";
import type { CardDefinition } from "@arcane-estates/shared";
import { GO_SALARY } from "@arcane-estates/shared";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("drawCard", () => {
  it("draws a fate card using Math.random", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // first card
    const state = createTestState(2);
    const card = drawCard(state, "player1", "fate");
    expect(card).toEqual(FATE_CARDS[0]);
  });

  it("draws a guild card using Math.random", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const state = createTestState(2);
    const card = drawCard(state, "player1", "guild");
    expect(card).toEqual(GUILD_CARDS[0]);
  });

  it("draws the last card when random returns just under 1", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.999);
    const state = createTestState(2);
    const card = drawCard(state, "player1", "fate");
    expect(card).toEqual(FATE_CARDS[FATE_CARDS.length - 1]);
  });

  it("applies the card effect after drawing", () => {
    // FATE_CARDS[5] is "collect 150" (id: 6)
    vi.spyOn(Math, "random").mockReturnValue(5 / FATE_CARDS.length);
    const state = createTestState(2);
    const card = drawCard(state, "player1", "fate");
    expect(card.action.type).toBe("collect");
    expect(state.players.get("player1")!.crowns).toBe(1500 + 150);
  });
});

describe("applyCardEffect", () => {
  it("handles collect: adds amount to player crowns", () => {
    const state = createTestState(2);
    const card: CardDefinition = {
      id: 99, type: "fate", text: "test",
      action: { type: "collect", amount: 100 },
    };
    applyCardEffect(state, "player1", card);
    expect(state.players.get("player1")!.crowns).toBe(1600);
  });

  it("handles pay: deducts amount from player crowns", () => {
    const state = createTestState(2);
    const card: CardDefinition = {
      id: 99, type: "fate", text: "test",
      action: { type: "pay", amount: 50 },
    };
    applyCardEffect(state, "player1", card);
    expect(state.players.get("player1")!.crowns).toBe(1450);
  });

  it("handles pay: bankrupts player if not enough crowns", () => {
    const state = createTestState(2);
    state.players.get("player1")!.crowns = 30;
    assignProperty(state, "player1", 1);
    const card: CardDefinition = {
      id: 99, type: "fate", text: "test",
      action: { type: "pay", amount: 50 },
    };
    applyCardEffect(state, "player1", card);
    const player = state.players.get("player1")!;
    expect(player.crowns).toBe(0);
    expect(player.bankrupt).toBe(true);
    expect(player.properties.length).toBe(0);
  });

  it("handles move_to: moves player and collects GO salary when passing GO", () => {
    const state = createTestState(2);
    const player = state.players.get("player1")!;
    player.position = 30;
    const card: CardDefinition = {
      id: 99, type: "fate", text: "test",
      action: { type: "move_to", position: 6, collectGo: true },
    };
    applyCardEffect(state, "player1", card);
    expect(player.position).toBe(6);
    expect(player.crowns).toBe(1500 + GO_SALARY);
  });

  it("handles move_to: does not collect GO salary when collectGo is false", () => {
    const state = createTestState(2);
    const player = state.players.get("player1")!;
    player.position = 30;
    const card: CardDefinition = {
      id: 99, type: "fate", text: "test",
      action: { type: "move_to", position: 6, collectGo: false },
    };
    applyCardEffect(state, "player1", card);
    expect(player.position).toBe(6);
    expect(player.crowns).toBe(1500);
  });

  it("handles move_to: position 0 (GO) with collectGo", () => {
    const state = createTestState(2);
    const player = state.players.get("player1")!;
    player.position = 30;
    const card: CardDefinition = {
      id: 99, type: "fate", text: "test",
      action: { type: "move_to", position: 0, collectGo: true },
    };
    applyCardEffect(state, "player1", card);
    expect(player.position).toBe(0);
    expect(player.crowns).toBe(1500 + GO_SALARY);
  });

  it("handles move_back: moves player back by spaces", () => {
    const state = createTestState(2);
    const player = state.players.get("player1")!;
    player.position = 10;
    const card: CardDefinition = {
      id: 99, type: "fate", text: "test",
      action: { type: "move_back", spaces: 3 },
    };
    applyCardEffect(state, "player1", card);
    expect(player.position).toBe(7);
  });

  it("handles move_back: clamps to 0", () => {
    const state = createTestState(2);
    const player = state.players.get("player1")!;
    player.position = 1;
    const card: CardDefinition = {
      id: 99, type: "fate", text: "test",
      action: { type: "move_back", spaces: 5 },
    };
    applyCardEffect(state, "player1", card);
    expect(player.position).toBe(0);
  });

  it("handles go_to_jail: sends player to jail", () => {
    const state = createTestState(2);
    const card: CardDefinition = {
      id: 99, type: "fate", text: "test",
      action: { type: "go_to_jail" },
    };
    applyCardEffect(state, "player1", card);
    const player = state.players.get("player1")!;
    expect(player.position).toBe(10);
    expect(player.inJail).toBe(true);
    expect(player.jailTurns).toBe(0);
  });

  it("handles get_out_of_jail: gives escape card", () => {
    const state = createTestState(2);
    const card: CardDefinition = {
      id: 99, type: "fate", text: "test",
      action: { type: "get_out_of_jail" },
    };
    applyCardEffect(state, "player1", card);
    expect(state.players.get("player1")!.hasEscapeCard).toBe(true);
  });

  it("handles collect_from_each: collects from all non-bankrupt others", () => {
    const state = createTestState(3);
    const card: CardDefinition = {
      id: 99, type: "guild", text: "test",
      action: { type: "collect_from_each", amount: 50 },
    };
    applyCardEffect(state, "player1", card);
    expect(state.players.get("player1")!.crowns).toBe(1500 + 100); // 50 from 2 others
    expect(state.players.get("player2")!.crowns).toBe(1450);
    expect(state.players.get("player3")!.crowns).toBe(1450);
  });

  it("handles collect_from_each: skips bankrupt players", () => {
    const state = createTestState(3);
    state.players.get("player3")!.bankrupt = true;
    const card: CardDefinition = {
      id: 99, type: "guild", text: "test",
      action: { type: "collect_from_each", amount: 50 },
    };
    applyCardEffect(state, "player1", card);
    expect(state.players.get("player1")!.crowns).toBe(1550); // only from player2
  });

  it("handles pay_each: pays each non-bankrupt other", () => {
    const state = createTestState(3);
    const card: CardDefinition = {
      id: 99, type: "guild", text: "test",
      action: { type: "pay_each", amount: 50 },
    };
    applyCardEffect(state, "player1", card);
    expect(state.players.get("player1")!.crowns).toBe(1400); // paid 50 * 2
    expect(state.players.get("player2")!.crowns).toBe(1550);
    expect(state.players.get("player3")!.crowns).toBe(1550);
  });

  it("handles pay_each: bankrupts if not enough crowns", () => {
    const state = createTestState(3);
    state.players.get("player1")!.crowns = 60;
    const card: CardDefinition = {
      id: 99, type: "guild", text: "test",
      action: { type: "pay_each", amount: 50 },
    };
    applyCardEffect(state, "player1", card);
    const player1 = state.players.get("player1")!;
    expect(player1.crowns).toBe(0);
    expect(player1.bankrupt).toBe(true);
    // Each other player gets floor(60/2) = 30
    expect(state.players.get("player2")!.crowns).toBe(1530);
    expect(state.players.get("player3")!.crowns).toBe(1530);
  });

  it("handles repair: charges per tower and per fortress", () => {
    const state = createTestState(2);
    assignColorSet(state, "player1", "brown");
    setTowers(state, 1, 2); // 2 towers
    setTowers(state, 3, 5); // fortress
    const card: CardDefinition = {
      id: 99, type: "fate", text: "test",
      action: { type: "repair", perTower: 25, perFortress: 100 },
    };
    applyCardEffect(state, "player1", card);
    // Cost: 2 * 25 + 100 = 150
    expect(state.players.get("player1")!.crowns).toBe(1500 - 150);
  });

  it("handles repair: bankrupts if cannot afford", () => {
    const state = createTestState(2);
    assignColorSet(state, "player1", "brown");
    setTowers(state, 1, 4); // 4 towers
    setTowers(state, 3, 5); // fortress
    state.players.get("player1")!.crowns = 50;
    const card: CardDefinition = {
      id: 99, type: "fate", text: "test",
      action: { type: "repair", perTower: 25, perFortress: 100 },
    };
    applyCardEffect(state, "player1", card);
    // Cost: 4 * 25 + 100 = 200, can't afford
    const player = state.players.get("player1")!;
    expect(player.crowns).toBe(0);
    expect(player.bankrupt).toBe(true);
  });

  it("handles nearest portal: moves to nearest portal ahead", () => {
    const state = createTestState(2);
    const player = state.players.get("player1")!;
    player.position = 10;
    const card: CardDefinition = {
      id: 99, type: "fate", text: "test",
      action: { type: "nearest", spaceType: "portal" },
    };
    applyCardEffect(state, "player1", card);
    expect(player.position).toBe(15); // next portal after position 10
  });

  it("handles nearest portal: wraps around and collects GO", () => {
    const state = createTestState(2);
    const player = state.players.get("player1")!;
    player.position = 36; // past last portal (35)
    const card: CardDefinition = {
      id: 99, type: "fate", text: "test",
      action: { type: "nearest", spaceType: "portal" },
    };
    applyCardEffect(state, "player1", card);
    expect(player.position).toBe(5); // wraps to first portal
    expect(player.crowns).toBe(1500 + GO_SALARY);
  });

  it("handles nearest mana-well: moves to nearest mana well", () => {
    const state = createTestState(2);
    const player = state.players.get("player1")!;
    player.position = 10;
    const card: CardDefinition = {
      id: 99, type: "fate", text: "test",
      action: { type: "nearest", spaceType: "mana-well" },
    };
    applyCardEffect(state, "player1", card);
    expect(player.position).toBe(12); // next mana well
  });
});
