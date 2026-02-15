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
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="bg-arcane-deep border-2 border-arcane-gold/40 rounded-xl w-72 overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Color Header */}
          <div
            className="p-4 text-center"
            style={{ backgroundColor: colorHex }}
          >
            <h3 className="font-display text-white text-lg font-bold drop-shadow-lg">
              {space.name}
            </h3>
          </div>

          <div className="p-4 space-y-3">
            {/* Property details */}
            {space.type === "property" && space.rent && (
              <>
                <div className="text-center">
                  <span className="text-arcane-gold font-display text-xl">
                    ♛{space.cost}
                  </span>
                </div>

                <table className="w-full text-xs text-gray-300">
                  <tbody>
                    <tr className="border-b border-gray-700/50">
                      <td className="py-1">Base Rent</td>
                      <td className="py-1 text-right text-white">
                        ♛{space.rent[0]}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-700/50">
                      <td className="py-1">With 1 Tower</td>
                      <td className="py-1 text-right text-white">
                        ♛{space.rent[1]}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-700/50">
                      <td className="py-1">With 2 Towers</td>
                      <td className="py-1 text-right text-white">
                        ♛{space.rent[2]}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-700/50">
                      <td className="py-1">With 3 Towers</td>
                      <td className="py-1 text-right text-white">
                        ♛{space.rent[3]}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-700/50">
                      <td className="py-1">With 4 Towers</td>
                      <td className="py-1 text-right text-white">
                        ♛{space.rent[4]}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1">With Fortress</td>
                      <td className="py-1 text-right text-white">
                        ♛{space.rent[5]}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="text-xs text-gray-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Tower Cost</span>
                    <span>♛{space.houseCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mortgage Value</span>
                    <span>♛{space.mortgage}</span>
                  </div>
                </div>
              </>
            )}

            {/* Portal station */}
            {space.type === "portal" && (
              <div className="text-xs text-gray-300 space-y-1">
                <p className="text-center text-arcane-gold font-display">
                  ♛{space.cost}
                </p>
                <p>1 Portal owned: ♛25 rent</p>
                <p>2 Portals owned: ♛50 rent</p>
                <p>3 Portals owned: ♛100 rent</p>
                <p>4 Portals owned: ♛200 rent</p>
              </div>
            )}

            {/* Mana Well */}
            {space.type === "mana-well" && (
              <div className="text-xs text-gray-300 space-y-1">
                <p className="text-center text-arcane-gold font-display">
                  ♛{space.cost}
                </p>
                <p>1 Well owned: 4x dice roll</p>
                <p>2 Wells owned: 10x dice roll</p>
              </div>
            )}

            {/* Owner */}
            {owner && (
              <div className="text-center text-xs border-t border-gray-700/50 pt-2">
                <span className="text-gray-400">Owned by </span>
                <span className="text-white">
                  {TOKEN_EMOJIS[owner.token]} {owner.name}
                </span>
              </div>
            )}

            {/* Buildings */}
            {spaceState && (spaceState.towers > 0 || spaceState.hasFortress) && (
              <div className="text-center text-xs">
                {spaceState.hasFortress ? (
                  <span className="text-red-400">🏰 Fortress</span>
                ) : (
                  <span className="text-green-400">
                    {"🏠".repeat(spaceState.towers)}{" "}
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
            className="w-full py-2 bg-arcane-dark hover:bg-gray-800 text-gray-400 text-xs font-display border-t border-arcane-gold/20 transition-colors"
          >
            Close
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
