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
        className="modal-container modal-ornament-tl modal-ornament-br relative w-80 overflow-hidden"
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
              className={`font-display text-2xl ${
                isUrgent
                  ? "text-red-400 animate-pulse"
                  : "text-arcane-gold"
              }`}
            >
              {auction.timeRemaining}s
            </span>
            {isUrgent && (
              <div className="mt-1 h-0.5 bg-red-500/50 rounded animate-pulse" />
            )}
          </div>

          <div className="divider-gold" />

          {/* Current bid */}
          <div className="text-center">
            <p className="text-gray-400 text-xs">Current Bid</p>
            <AnimatePresence mode="wait">
              <motion.p
                key={auction.currentBid}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 15 }}
                className="font-display text-xl text-white"
              >
                {"\u265B"}{auction.currentBid}
              </motion.p>
            </AnimatePresence>
            {currentBidder && (
              <p className="text-xs text-gray-400">
                by {TOKEN_EMOJIS[currentBidder.token]} {currentBidder.name}
              </p>
            )}
          </div>

          {/* Bid controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBidAmount(Math.max(auction.currentBid + 1, bidAmount - 10))}
              className="btn-arcane px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
            >
              -10
            </button>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              min={auction.currentBid + 1}
              className="flex-1 px-2 py-1.5 bg-arcane-dark border border-arcane-gold/20 rounded text-white text-center text-sm focus:border-arcane-gold/50 focus:outline-none"
            />
            <button
              onClick={() => setBidAmount(bidAmount + 10)}
              className="btn-arcane px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
            >
              +10
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => send("auction_pass")}
              className="btn-arcane flex-1 py-2 bg-red-800 hover:bg-red-700 text-white font-display text-sm rounded border border-red-500/50 hover:shadow-[0_0_12px_rgba(239,68,68,0.3)]"
            >
              Pass
            </button>
            <button
              onClick={handleBid}
              disabled={bidAmount <= auction.currentBid}
              className="btn-arcane flex-1 py-2 bg-green-700 hover:bg-green-600 text-white font-display text-sm rounded border border-green-500/50 disabled:opacity-50 hover:shadow-[0_0_12px_rgba(34,197,94,0.3)]"
            >
              Bid {"\u265B"}{bidAmount}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
