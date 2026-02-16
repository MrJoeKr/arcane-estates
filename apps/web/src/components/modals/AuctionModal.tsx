import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GameStateSnapshot } from "../../hooks/use-colyseus";
import { BOARD_SPACES } from "../board/board-spaces-data";
import { COLOR_HEX, TOKEN_EMOJIS } from "@arcane-estates/shared";

interface AuctionModalProps {
  gameState: GameStateSnapshot;
  send: (type: string, data?: any) => void;
  onClose: () => void;
}

export function AuctionModal({ gameState, send, onClose }: AuctionModalProps) {
  const { auction } = gameState;
  const [bidAmount, setBidAmount] = useState(auction.currentBid + 10);

  if (!auction.active) return null;

  const space = BOARD_SPACES[auction.spaceIndex];
  const currentBidder = auction.currentBidderId
    ? gameState.players.get(auction.currentBidderId)
    : null;
  const colorHex = space?.color ? COLOR_HEX[space.color] : "#555";
  const isUrgent = auction.timeRemaining <= 5;

  const handleBid = () => {
    if (bidAmount > auction.currentBid) {
      send("auction_bid", { amount: bidAmount });
      setBidAmount(bidAmount + 10);
    }
  };

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="modal-container ornament-corners relative w-80 overflow-hidden"
      >
        {/* Header */}
        <div
          className="p-3 text-center"
          style={{ background: `linear-gradient(135deg, ${colorHex}, ${colorHex}cc)` }}
        >
          <p className="font-display text-white text-sm font-bold drop-shadow">
            AUCTION
          </p>
          <p className="font-display text-white text-lg">
            {space?.name}
          </p>
        </div>

        <div className="p-4 space-y-3">
          {/* Timer */}
          <div className="text-center">
            <span
              className={`font-display text-3xl ${
                isUrgent
                  ? "text-red-400 animate-urgent"
                  : "text-arcane-gold"
              }`}
            >
              {auction.timeRemaining}s
            </span>
            {isUrgent && (
              <div className="mt-1 h-0.5 bg-red-500/50 rounded animate-urgent" />
            )}
          </div>

          <div className="divider-gold" />

          {/* Current bid */}
          <div className="text-center">
            <p className="text-parchment/50 text-xs">Current Bid</p>
            <AnimatePresence mode="wait">
              <motion.p
                key={auction.currentBid}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 15 }}
                className="font-display text-xl text-parchment"
              >
                {"\u265B"}{auction.currentBid}
              </motion.p>
            </AnimatePresence>
            {currentBidder && (
              <p className="text-xs text-parchment/50">
                by {TOKEN_EMOJIS[currentBidder.token]} {currentBidder.name}
              </p>
            )}
          </div>

          {/* Bid controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBidAmount(Math.max(auction.currentBid + 1, bidAmount - 10))}
              className="btn-arcane text-sm px-3 py-1.5 bg-arcane-deep border border-arcane-gold/15 text-parchment/70 rounded hover:bg-arcane-deep/80"
            >
              -10
            </button>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              min={auction.currentBid + 1}
              className="input-arcane text-center text-sm flex-1 px-2 py-1.5"
            />
            <button
              onClick={() => setBidAmount(bidAmount + 10)}
              className="btn-arcane text-sm px-3 py-1.5 bg-arcane-deep border border-arcane-gold/15 text-parchment/70 rounded hover:bg-arcane-deep/80"
            >
              +10
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => send("auction_pass")}
              className="btn-arcane btn-danger flex-1 py-2 rounded-lg text-sm"
            >
              Pass
            </button>
            <button
              onClick={handleBid}
              disabled={bidAmount <= auction.currentBid}
              className="btn-arcane btn-success flex-1 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              Bid {"\u265B"}{bidAmount}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
