import { motion, AnimatePresence } from "framer-motion";
import type { GameStateSnapshot } from "../../hooks/use-colyseus";
import { BOARD_SPACES } from "../board/board-spaces-data";
import { COLOR_HEX, TOKEN_EMOJIS } from "@arcane-estates/shared";

interface PropertyCardProps {
  spaceIndex: number;
  gameState: GameStateSnapshot;
  onClose: () => void;
}

export function PropertyCard({
  spaceIndex,
  gameState,
  onClose,
}: PropertyCardProps) {
  const space = BOARD_SPACES[spaceIndex];
  const spaceState = gameState.spaces[spaceIndex];
  if (!space) return null;

  const colorHex = space.color ? COLOR_HEX[space.color] : "#555";
  const owner = spaceState?.ownerId
    ? gameState.players.get(spaceState.ownerId)
    : null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 modal-backdrop flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="modal-container ornament-corners relative w-80 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Color Header */}
          <div
            className="p-4 text-center"
            style={{
              background: `linear-gradient(145deg, ${colorHex}dd, ${colorHex}88)`,
              boxShadow: "inset 0 -2px 10px rgba(0,0,0,0.3)",
            }}
          >
            <h3 className="font-display text-white text-lg font-bold drop-shadow-md">
              {space.name}
            </h3>
          </div>

          <div className="p-4 space-y-3">
            {/* Property details */}
            {space.type === "property" && space.rent && (
              <>
                <div className="text-center">
                  <span className="text-arcane-gold-light font-display text-xl text-glow-gold-subtle">
                    {"\u265B"}{space.cost}
                  </span>
                </div>

                <div className="divider-gold" />

                <p className="text-center text-parchment/50 text-xs">{"\u265B"} cost</p>

                <table className="w-full text-xs text-parchment/70">
                  <tbody>
                    {[
                      ["Base Rent", space.rent[0]],
                      ["With 1 Tower", space.rent[1]],
                      ["With 2 Towers", space.rent[2]],
                      ["With 3 Towers", space.rent[3]],
                      ["With 4 Towers", space.rent[4]],
                      ["With Fortress", space.rent[5]],
                    ].map(([label, value], i) => (
                      <tr
                        key={i}
                        className={`${i < 5 ? "border-b border-arcane-gold/5" : ""} ${i % 2 === 1 ? "bg-white/[0.03]" : ""}`}
                      >
                        <td className="py-1">{label}</td>
                        <td className="py-1 text-right text-parchment font-display">
                          {"\u265B"}{value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="divider-gold" />

                <div className="text-xs text-parchment/50 space-y-1">
                  <div className="flex justify-between">
                    <span>Tower Cost</span>
                    <span>{"\u265B"}{space.houseCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mortgage Value</span>
                    <span>{"\u265B"}{space.mortgage}</span>
                  </div>
                </div>
              </>
            )}

            {/* Portal station */}
            {space.type === "portal" && (
              <div className="text-xs text-parchment/70 space-y-1">
                <p className="text-center text-arcane-gold-light font-display text-glow-gold-subtle">
                  {"\u265B"}{space.cost}
                </p>
                <p>1 Portal owned: {"\u265B"}25 rent</p>
                <p>2 Portals owned: {"\u265B"}50 rent</p>
                <p>3 Portals owned: {"\u265B"}100 rent</p>
                <p>4 Portals owned: {"\u265B"}200 rent</p>
              </div>
            )}

            {/* Mana Well */}
            {space.type === "mana-well" && (
              <div className="text-xs text-parchment/70 space-y-1">
                <p className="text-center text-arcane-gold-light font-display text-glow-gold-subtle">
                  {"\u265B"}{space.cost}
                </p>
                <p>1 Well owned: 4x dice roll</p>
                <p>2 Wells owned: 10x dice roll</p>
              </div>
            )}

            {/* Owner */}
            {owner && (
              <>
                <div className="divider-gold" />
                <div className="text-center text-xs pt-1">
                  <span className="text-parchment/50">Owned by </span>
                  <span className="text-parchment/80">
                    {TOKEN_EMOJIS[owner.token]} {owner.name}
                  </span>
                </div>
              </>
            )}

            {/* Buildings */}
            {spaceState && (spaceState.towers > 0 || spaceState.hasFortress) && (
              <div className="text-center text-xs">
                {spaceState.hasFortress ? (
                  <span className="text-red-400">{"\uD83C\uDFF0"} Fortress</span>
                ) : (
                  <span className="text-green-400">
                    {"\uD83C\uDFE0".repeat(spaceState.towers)}{" "}
                    {spaceState.towers} Tower{spaceState.towers > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            )}

            {spaceState?.isMortgaged && (
              <div className="text-center text-xs text-red-400">
                MORTGAGED
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 font-display text-sm text-parchment/50 hover:text-parchment/80 hover:bg-white/[0.03] transition-all border-t border-arcane-gold/10"
          >
            Close
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
