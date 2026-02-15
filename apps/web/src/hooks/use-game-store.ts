import { create } from "zustand";
import type { CardDefinition } from "@arcane-estates/shared";

interface GameUIState {
  // Modals
  showPropertyCard: number | null; // space index or null
  showTradeModal: boolean;
  showAuctionModal: boolean;
  showCardReveal: CardDefinition | null;

  // Actions
  setShowPropertyCard: (index: number | null) => void;
  setShowTradeModal: (show: boolean) => void;
  setShowAuctionModal: (show: boolean) => void;
  setShowCardReveal: (card: CardDefinition | null) => void;

  // Dice animation state
  isDiceRolling: boolean;
  setDiceRolling: (rolling: boolean) => void;

  // Token animation
  animatingPlayerId: string | null;
  setAnimatingPlayerId: (id: string | null) => void;
}

export const useGameStore = create<GameUIState>((set) => ({
  showPropertyCard: null,
  showTradeModal: false,
  showAuctionModal: false,
  showCardReveal: null,

  setShowPropertyCard: (index) => set({ showPropertyCard: index }),
  setShowTradeModal: (show) => set({ showTradeModal: show }),
  setShowAuctionModal: (show) => set({ showAuctionModal: show }),
  setShowCardReveal: (card) => set({ showCardReveal: card }),

  isDiceRolling: false,
  setDiceRolling: (rolling) => set({ isDiceRolling: rolling }),

  animatingPlayerId: null,
  setAnimatingPlayerId: (id) => set({ animatingPlayerId: id }),
}));
