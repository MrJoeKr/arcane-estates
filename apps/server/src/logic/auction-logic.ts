import { GameState } from "../state/GameState";
import { BOARD_SPACES } from "../data/board-data";

// Track which players have passed in the current auction
let auctionPasses = new Set<string>();

export function startAuction(state: GameState, spaceIndex: number): void {
  state.auction.active = true;
  state.auction.spaceIndex = spaceIndex;
  state.auction.currentBid = 0;
  state.auction.currentBidderId = "";
  state.auction.timeRemaining = 30;

  // Reset passes
  auctionPasses = new Set<string>();
}

export function placeBid(state: GameState, playerId: string, amount: number): boolean {
  const player = state.players.get(playerId);
  if (!player) return false;

  // Validate bid is higher than current
  if (amount <= state.auction.currentBid) return false;

  // Validate player has enough crowns
  if (player.crowns < amount) return false;

  // Update auction state
  state.auction.currentBid = amount;
  state.auction.currentBidderId = playerId;

  // Remove player from passes if they were passing before
  auctionPasses.delete(playerId);

  return true;
}

export function handleAuctionPass(state: GameState, playerId: string): void {
  auctionPasses.add(playerId);

  // Get all active (non-bankrupt) players
  const activePlayers = Array.from(state.players.values()).filter(p => !p.bankrupt);

  // If all active players have passed, end auction
  if (auctionPasses.size >= activePlayers.length) {
    endAuction(state);
  }
}

export function endAuction(state: GameState): void {
  // If there's a winning bidder, they buy the property at their bid price
  if (state.auction.currentBidderId && state.auction.currentBid > 0) {
    const winner = state.players.get(state.auction.currentBidderId);
    const space = state.spaces[state.auction.spaceIndex];

    if (winner && space) {
      winner.crowns -= state.auction.currentBid;
      space.ownerId = state.auction.currentBidderId;
      winner.properties.push(state.auction.spaceIndex);
    }
  }

  // Reset auction state
  state.auction.active = false;
  state.auction.spaceIndex = 0;
  state.auction.currentBid = 0;
  state.auction.currentBidderId = "";
  state.auction.timeRemaining = 0;

  // Clear passes
  auctionPasses = new Set<string>();
}
