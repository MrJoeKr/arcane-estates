import type { TradeOfferData } from "@arcane-estates/shared";
import { GameState, TradeOffer } from "../state/GameState";
import { ArraySchema } from "@colyseus/schema";

export function proposeTrade(state: GameState, fromId: string, offer: TradeOfferData): boolean {
  const fromPlayer = state.players.get(fromId);
  const toPlayer = state.players.get(offer.toId);

  if (!fromPlayer || !toPlayer) return false;

  // Validate: all offered properties owned by fromId
  for (const propIndex of offer.offerProperties) {
    const space = state.spaces[propIndex];
    if (!space || space.ownerId !== fromId) return false;
  }

  // Validate: all requested properties owned by toId
  for (const propIndex of offer.requestProperties) {
    const space = state.spaces[propIndex];
    if (!space || space.ownerId !== offer.toId) return false;
  }

  // Validate: enough crowns on both sides
  if (fromPlayer.crowns < offer.offerCrowns) return false;
  if (toPlayer.crowns < offer.requestCrowns) return false;

  // Create trade offer
  const tradeOffer = new TradeOffer();
  tradeOffer.fromId = fromId;
  tradeOffer.toId = offer.toId;
  tradeOffer.offerCrowns = offer.offerCrowns;
  tradeOffer.requestCrowns = offer.requestCrowns;

  // Copy property arrays
  offer.offerProperties.forEach(prop => tradeOffer.offerProperties.push(prop));
  offer.requestProperties.forEach(prop => tradeOffer.requestProperties.push(prop));

  state.trade = tradeOffer;
  return true;
}

export function acceptTrade(state: GameState): void {
  if (!state.trade) return;

  const fromPlayer = state.players.get(state.trade.fromId);
  const toPlayer = state.players.get(state.trade.toId);

  if (!fromPlayer || !toPlayer) {
    state.trade = null;
    return;
  }

  // Transfer crowns
  fromPlayer.crowns -= state.trade.offerCrowns;
  toPlayer.crowns += state.trade.offerCrowns;

  toPlayer.crowns -= state.trade.requestCrowns;
  fromPlayer.crowns += state.trade.requestCrowns;

  // Transfer offered properties from fromPlayer to toPlayer
  state.trade.offerProperties.forEach(propIndex => {
    const space = state.spaces[propIndex];
    if (space && space.ownerId === state.trade?.fromId) {
      space.ownerId = state.trade.toId;

      // Remove from fromPlayer's properties
      const fromIndex = fromPlayer.properties.findIndex(p => p === propIndex);
      if (fromIndex >= 0) {
        fromPlayer.properties.splice(fromIndex, 1);
      }

      // Add to toPlayer's properties
      toPlayer.properties.push(propIndex);
    }
  });

  // Transfer requested properties from toPlayer to fromPlayer
  state.trade.requestProperties.forEach(propIndex => {
    const space = state.spaces[propIndex];
    if (space && space.ownerId === state.trade?.toId) {
      space.ownerId = state.trade.fromId;

      // Remove from toPlayer's properties
      const toIndex = toPlayer.properties.findIndex(p => p === propIndex);
      if (toIndex >= 0) {
        toPlayer.properties.splice(toIndex, 1);
      }

      // Add to fromPlayer's properties
      fromPlayer.properties.push(propIndex);
    }
  });

  // Clear trade
  state.trade = null;
}

export function rejectTrade(state: GameState): void {
  state.trade = null;
}
