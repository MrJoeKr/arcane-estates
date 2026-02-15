import type { CardDefinition } from "@arcane-estates/shared";

export const FATE_CARDS: CardDefinition[] = [
  {
    id: 1, type: "fate",
    text: "A portal malfunction sends you to the Grand Portal. Collect 200 Crowns.",
    action: { type: "move_to", position: 0, collectGo: true },
  },
  {
    id: 2, type: "fate",
    text: "The Arcane Council demands repairs. Pay 25 Crowns per Tower, 100 per Fortress.",
    action: { type: "repair", perTower: 25, perFortress: 100 },
  },
  {
    id: 3, type: "fate",
    text: "You discover an ancient spellbook! Advance to Grand Spellhall.",
    action: { type: "move_to", position: 37, collectGo: true },
  },
  {
    id: 4, type: "fate",
    text: "Dungeon Escape Scroll — keep until needed.",
    action: { type: "get_out_of_jail" },
  },
  {
    id: 5, type: "fate",
    text: "A mischievous spirit moves you back 3 spaces.",
    action: { type: "move_back", spaces: 3 },
  },
  {
    id: 6, type: "fate",
    text: "Your enchantments have been sold! Collect 150 Crowns.",
    action: { type: "collect", amount: 150 },
  },
  {
    id: 7, type: "fate",
    text: "You've won a potion brewing competition! Collect 100 Crowns.",
    action: { type: "collect", amount: 100 },
  },
  {
    id: 8, type: "fate",
    text: "Advance to Southfire Portal. If you pass the Grand Portal, collect 200.",
    action: { type: "move_to", position: 25, collectGo: true },
  },
  {
    id: 9, type: "fate",
    text: "A magical mishap requires repairs. Pay 40 Crowns per Tower, 115 per Fortress.",
    action: { type: "repair", perTower: 40, perFortress: 115 },
  },
  {
    id: 10, type: "fate",
    text: "Bank error in your favor! Collect 200 Crowns.",
    action: { type: "collect", amount: 200 },
  },
  {
    id: 11, type: "fate",
    text: "You are cursed! Pay a curse removal fee of 50 Crowns.",
    action: { type: "pay", amount: 50 },
  },
  {
    id: 12, type: "fate",
    text: "Advance to Frost Garden.",
    action: { type: "move_to", position: 6, collectGo: true },
  },
  {
    id: 13, type: "fate",
    text: "You found a chest of ancient coins! Collect 20 Crowns.",
    action: { type: "collect", amount: 20 },
  },
  {
    id: 14, type: "fate",
    text: "Advance to the nearest Portal Station. Pay owner twice the normal rent.",
    action: { type: "nearest", spaceType: "portal", rentMultiplier: 2 },
  },
  {
    id: 15, type: "fate",
    text: "Advance to the nearest Mana Well. Pay owner twice the normal rent.",
    action: { type: "nearest", spaceType: "mana-well", rentMultiplier: 2 },
  },
  {
    id: 16, type: "fate",
    text: "Your magical investments pay off! Collect 50 Crowns.",
    action: { type: "collect", amount: 50 },
  },
];

export const GUILD_CARDS: CardDefinition[] = [
  {
    id: 1, type: "guild",
    text: "Scholarship award! Collect 200 Crowns.",
    action: { type: "collect", amount: 200 },
  },
  {
    id: 2, type: "guild",
    text: "Academy fees due. Pay 150 Crowns.",
    action: { type: "pay", amount: 150 },
  },
  {
    id: 3, type: "guild",
    text: "Healing potion sale! Collect 50 Crowns from each player.",
    action: { type: "collect_from_each", amount: 50 },
  },
  {
    id: 4, type: "guild",
    text: "You've been caught practicing forbidden magic. Go to the Dungeon.",
    action: { type: "go_to_jail" },
  },
  {
    id: 5, type: "guild",
    text: "Dungeon Escape Scroll — keep until needed.",
    action: { type: "get_out_of_jail" },
  },
  {
    id: 6, type: "guild",
    text: "Receive an apprentice bonus of 25 Crowns.",
    action: { type: "collect", amount: 25 },
  },
  {
    id: 7, type: "guild",
    text: "The Grand Council levies a special tax of 10 Crowns.",
    action: { type: "pay", amount: 10 },
  },
  {
    id: 8, type: "guild",
    text: "Your magical services are in demand! Collect 100 Crowns.",
    action: { type: "collect", amount: 100 },
  },
  {
    id: 9, type: "guild",
    text: "Academy library fine. Pay 20 Crowns.",
    action: { type: "pay", amount: 20 },
  },
  {
    id: 10, type: "guild",
    text: "Inheritance from a distant relative! Collect 100 Crowns.",
    action: { type: "collect", amount: 100 },
  },
  {
    id: 11, type: "guild",
    text: "Pay a guild membership fee of 50 Crowns.",
    action: { type: "pay", amount: 50 },
  },
  {
    id: 12, type: "guild",
    text: "It's your birthday! Collect 10 Crowns from each player.",
    action: { type: "collect_from_each", amount: 10 },
  },
  {
    id: 13, type: "guild",
    text: "You sold your enchanted belongings. Collect 45 Crowns.",
    action: { type: "collect", amount: 45 },
  },
  {
    id: 14, type: "guild",
    text: "Holiday fund matures! Collect 100 Crowns.",
    action: { type: "collect", amount: 100 },
  },
  {
    id: 15, type: "guild",
    text: "Arcane Council repair assessment: Pay 40 Crowns per Tower, 115 per Fortress.",
    action: { type: "repair", perTower: 40, perFortress: 115 },
  },
  {
    id: 16, type: "guild",
    text: "Advance to the Grand Portal. Collect 200 Crowns.",
    action: { type: "move_to", position: 0, collectGo: true },
  },
];
