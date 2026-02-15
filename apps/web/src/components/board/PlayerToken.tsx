import { motion } from "framer-motion";
import { TOKEN_EMOJIS, BOARD_GRID_POSITIONS } from "@arcane-estates/shared";
import type { PlayerSnapshot } from "../../hooks/use-colyseus";

interface PlayerTokenProps {
  player: PlayerSnapshot;
}

export function PlayerToken({ player }: PlayerTokenProps) {
  const [row, col] = BOARD_GRID_POSITIONS[player.position] ?? [1, 1];
  const emoji = TOKEN_EMOJIS[player.token] || "⚪";

  return (
    <motion.div
      className="absolute z-10 text-lg pointer-events-none"
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
