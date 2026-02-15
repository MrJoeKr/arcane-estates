import { GO_SALARY } from "@arcane-estates/shared";
import type { CardDefinition } from "@arcane-estates/shared";
import { GameState } from "../state/GameState";
import { FATE_CARDS, GUILD_CARDS } from "../data/card-data";
import { BOARD_SPACES } from "../data/board-data";

export function drawCard(state: GameState, playerId: string, type: "fate" | "guild"): CardDefinition {
  const deck = type === "fate" ? FATE_CARDS : GUILD_CARDS;
  const randomIndex = Math.floor(Math.random() * deck.length);
  const card = deck[randomIndex];

  applyCardEffect(state, playerId, card);
  return card;
}

export function applyCardEffect(state: GameState, playerId: string, card: CardDefinition): void {
  const player = state.players.get(playerId);
  if (!player) return;

  const action = card.action;

  switch (action.type) {
    case "collect":
      player.crowns += action.amount;
      break;

    case "pay":
      if (player.crowns >= action.amount) {
        player.crowns -= action.amount;
      } else {
        player.crowns = 0;
        player.bankrupt = true;
        player.properties.clear();
      }
      break;

    case "move_to": {
      const oldPosition = player.position;
      player.position = action.position;
      if (action.collectGo && (action.position === 0 || action.position < oldPosition)) {
        player.crowns += GO_SALARY;
      }
      break;
    }

    case "move_back":
      player.position = Math.max(0, player.position - action.spaces);
      break;

    case "go_to_jail":
      player.position = 10;
      player.inJail = true;
      player.jailTurns = 0;
      break;

    case "get_out_of_jail":
      player.hasEscapeCard = true;
      break;

    case "collect_from_each": {
      const others = Array.from(state.players.values()).filter(
        (p) => p.id !== playerId && !p.bankrupt
      );
      others.forEach((other) => {
        const payment = Math.min(other.crowns, action.amount);
        other.crowns -= payment;
        player.crowns += payment;
        if (other.crowns === 0 && payment < action.amount) {
          other.bankrupt = true;
          other.properties.clear();
        }
      });
      break;
    }

    case "pay_each": {
      const others = Array.from(state.players.values()).filter(
        (p) => p.id !== playerId && !p.bankrupt
      );
      const totalPayment = action.amount * others.length;
      if (player.crowns >= totalPayment) {
        others.forEach((other) => {
          player.crowns -= action.amount;
          other.crowns += action.amount;
        });
      } else {
        const perPlayer = Math.floor(player.crowns / others.length);
        others.forEach((other) => {
          other.crowns += perPlayer;
        });
        player.crowns = 0;
        player.bankrupt = true;
        player.properties.clear();
      }
      break;
    }

    case "repair": {
      let totalCost = 0;
      player.properties.forEach((propIndex) => {
        const space = state.spaces[propIndex];
        if (space) {
          if (space.hasFortress) {
            totalCost += action.perFortress;
          } else if (space.towers > 0) {
            totalCost += space.towers * action.perTower;
          }
        }
      });
      if (player.crowns >= totalCost) {
        player.crowns -= totalCost;
      } else {
        player.crowns = 0;
        player.bankrupt = true;
        player.properties.clear();
      }
      break;
    }

    case "nearest": {
      const currentPos = player.position;
      let nearestPos = -1;

      if (action.spaceType === "portal") {
        const portals = [5, 15, 25, 35];
        nearestPos = portals.find((pos) => pos > currentPos) ?? portals[0];
      } else if (action.spaceType === "mana-well") {
        const wells = [12, 28];
        nearestPos = wells.find((pos) => pos > currentPos) ?? wells[0];
      }

      if (nearestPos >= 0) {
        const oldPosition = player.position;
        player.position = nearestPos;

        if (nearestPos < oldPosition) {
          player.crowns += GO_SALARY;
        }

        const space = state.spaces[nearestPos];
        if (space && space.ownerId && space.ownerId !== playerId) {
          const spaceDef = BOARD_SPACES[nearestPos];
          let rent = 0;

          if (spaceDef?.type === "portal") {
            const portalsOwned = [5, 15, 25, 35].filter((pos) => {
              const s = state.spaces[pos];
              return s && s.ownerId === space.ownerId;
            }).length;
            const portalRents = [25, 50, 100, 200];
            rent = portalRents[portalsOwned - 1] || 0;
          } else if (spaceDef?.type === "mana-well") {
            const manaWellsOwned = [12, 28].filter((pos) => {
              const s = state.spaces[pos];
              return s && s.ownerId === space.ownerId;
            }).length;
            rent = manaWellsOwned === 2 ? 70 : 28;
          }

          if (action.rentMultiplier) {
            rent *= action.rentMultiplier;
          }

          if (rent > 0) {
            const owner = state.players.get(space.ownerId);
            if (owner) {
              if (player.crowns >= rent) {
                player.crowns -= rent;
                owner.crowns += rent;
              } else {
                owner.crowns += player.crowns;
                player.crowns = 0;
                player.bankrupt = true;
                player.properties.forEach((propIndex) => {
                  const propSpace = state.spaces[propIndex];
                  if (propSpace) {
                    propSpace.ownerId = space.ownerId;
                    owner.properties.push(propIndex);
                  }
                });
                player.properties.clear();
              }
            }
          }
        }
      }
      break;
    }
  }
}
