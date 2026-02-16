import { motion, AnimatePresence } from "framer-motion";
import type { CardDefinition } from "@arcane-estates/shared";

interface CardRevealProps {
  card: CardDefinition;
  onClose: () => void;
}

export function CardReveal({ card, onClose }: CardRevealProps) {
  const isFate = card.type === "fate";

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 modal-backdrop flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ rotateY: 180, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 15 }}
          className={`modal-ornament-tl modal-ornament-br relative w-72 rounded-xl overflow-hidden shadow-2xl border-2 ${
            isFate
              ? "border-purple-500/60 bg-gradient-to-b from-purple-900 to-arcane-deep"
              : "border-amber-500/60 bg-gradient-to-b from-amber-900 to-arcane-deep"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Card header */}
          <div
            className={`p-3 text-center ${
              isFate ? "bg-purple-800/50" : "bg-amber-800/50"
            }`}
          >
            <span className="text-3xl">{isFate ? "\uD83D\uDD2E" : "\uD83D\uDCDC"}</span>
            <h3 className="font-display text-lg text-white mt-1">
              {isFate ? "Fate Card" : "Guild Card"}
            </h3>
          </div>

          {/* Gradient divider */}
          <div className="divider-gold" />

          {/* Card text with shimmer */}
          <div className="p-6 relative">
            <div className="absolute inset-0 shimmer pointer-events-none" />
            <p className="text-white text-center text-base leading-relaxed italic relative z-10">
              "{card.text}"
            </p>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className={`btn-arcane w-full py-3 font-display text-sm ${
              isFate
                ? "bg-purple-800/30 hover:bg-purple-800/50 text-purple-300"
                : "bg-amber-800/30 hover:bg-amber-800/50 text-amber-300"
            } transition-colors`}
          >
            Continue
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
