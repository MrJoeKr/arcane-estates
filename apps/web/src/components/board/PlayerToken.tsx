import { motion } from "framer-motion";
import { TOKEN_EMOJIS, BOARD_GRID_POSITIONS } from "@arcane-estates/shared";
import type { PlayerSnapshot } from "../../hooks/use-colyseus";

interface PlayerTokenProps {
  player: PlayerSnapshot;
}

export function PlayerToken({ player }: PlayerTokenProps) {
  const [row, col] = BOARD_GRID_POSITIONS[player.position] ?? [1, 1];
  const emoji = TOKEN_EMOJIS[player.token] || "\u26AA";

  return (
    <motion.div
      className="absolute z-10 text-xl pointer-events-none drop-shadow-[0_0_4px_rgba(212,168,67,0.4)]"
      animate={{
        gridRow: row,
        gridColumn: col,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
    >
      <span title={player.name}>{emoji}</span>
    </motion.div>
  );
}
