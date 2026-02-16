import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../hooks/use-game-store";

interface DiceRollProps {
  dice: [number, number];
  onRoll: () => void;
  canRoll: boolean;
}

const DICE_FACES: Record<number, string> = {
  1: "\u2680",
  2: "\u2681",
  3: "\u2682",
  4: "\u2683",
  5: "\u2684",
  6: "\u2685",
};

export function DiceRoll({ dice, onRoll, canRoll }: DiceRollProps) {
  const { isDiceRolling, setDiceRolling } = useGameStore();

  const handleRoll = () => {
    if (!canRoll || isDiceRolling) return;
    setDiceRolling(true);
    onRoll();
    // Animation will be stopped when state updates with new dice values
    setTimeout(() => setDiceRolling(false), 1000);
  };

  const isDoubles = dice[0] === dice[1] && dice[0] > 0;
  const hasRolled = dice[0] > 0 && !isDiceRolling;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-3">
        <div className="relative">
          <motion.div
            className="w-12 h-12 bg-parchment rounded-lg flex items-center justify-center text-3xl shadow-lg border-2 border-parchment-dark"
            animate={
              isDiceRolling
                ? {
                    rotateX: [0, 360, 720],
                    rotateY: [0, 360, 720],
                    scale: [1, 1.2, 1],
                  }
                : {}
            }
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="text-arcane-dark">
              {dice[0] > 0 ? DICE_FACES[dice[0]] : "?"}
            </span>
          </motion.div>
          {/* Gold pulse ring after roll */}
          <AnimatePresence>
            {hasRolled && (
              <motion.div
                className="absolute inset-0 rounded-lg border-2 border-arcane-gold/60"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            )}
          </AnimatePresence>
        </div>
        <div className="relative">
          <motion.div
            className="w-12 h-12 bg-parchment rounded-lg flex items-center justify-center text-3xl shadow-lg border-2 border-parchment-dark"
            animate={
              isDiceRolling
                ? {
                    rotateX: [0, -360, -720],
                    rotateY: [0, 360, 720],
                    scale: [1, 1.2, 1],
                  }
                : {}
            }
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          >
            <span className="text-arcane-dark">
              {dice[1] > 0 ? DICE_FACES[dice[1]] : "?"}
            </span>
          </motion.div>
          {/* Gold pulse ring after roll */}
          <AnimatePresence>
            {hasRolled && (
              <motion.div
                className="absolute inset-0 rounded-lg border-2 border-arcane-gold/60"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {dice[0] > 0 && (
        <div className="text-center">
          <span className="text-white font-display text-sm">
            {dice[0] + dice[1]}
          </span>
          {isDoubles && (
            <span className="ml-2 text-arcane-gold text-sm font-display font-bold text-glow-gold">
              DOUBLES!
            </span>
          )}
        </div>
      )}

      {canRoll && (
        <motion.button
          onClick={handleRoll}
          disabled={isDiceRolling}
          className="btn-arcane px-6 py-2 bg-arcane-purple hover:bg-arcane-purple/80 text-white font-display rounded-lg border border-arcane-gold/30 hover:border-arcane-gold transition-all hover:shadow-[0_0_15px_rgba(212,168,67,0.3)] disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Roll Dice
        </motion.button>
      )}
    </div>
  );
}
