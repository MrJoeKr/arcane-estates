import { useState } from "react";
import { motion } from "framer-motion";
import type { Room } from "colyseus.js";
import type { GameStateSnapshot } from "../../hooks/use-colyseus";
import { TOKEN_EMOJIS } from "@arcane-estates/shared";
import { BOARD_SPACES } from "../board/board-spaces-data";

interface TradeModalProps {
  room: Room;
  gameState: GameStateSnapshot;
  send: (type: string, data?: any) => void;
  onClose: () => void;
}

export function TradeModal({
  room,
  gameState,
  send,
  onClose,
}: TradeModalProps) {
  const myPlayer = gameState.players.get(room.sessionId);
  const otherPlayers = Array.from(gameState.players.values()).filter(
    (p) => p.id !== room.sessionId && !p.bankrupt
  );

  const [targetId, setTargetId] = useState(otherPlayers[0]?.id || "");
  const [offerProps, setOfferProps] = useState<number[]>([]);
  const [requestProps, setRequestProps] = useState<number[]>([]);
  const [offerCrowns, setOfferCrowns] = useState(0);
  const [requestCrowns, setRequestCrowns] = useState(0);

  const targetPlayer = gameState.players.get(targetId);

  const toggleProp = (
    list: number[],
    setList: (v: number[]) => void,
    index: number
  ) => {
    setList(
      list.includes(index) ? list.filter((i) => i !== index) : [...list, index]
    );
  };

  const handlePropose = () => {
    send("propose_trade", {
      toId: targetId,
      offerProperties: offerProps,
      offerCrowns,
      requestProperties: requestProps,
      requestCrowns,
    });
    onClose();
  };

  if (!myPlayer) return null;

  // Handle active trade offer (accept/reject)
  if (gameState.trade && gameState.trade.toId === room.sessionId) {
    const fromPlayer = gameState.players.get(gameState.trade.fromId);
    return (
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-arcane-deep border-2 border-arcane-gold/40 rounded-xl w-80 p-4 space-y-3"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="font-display text-arcane-gold text-center">
            Trade Offer from {fromPlayer?.name}
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-gray-400 mb-1">They offer:</p>
              {gameState.trade.offerProperties.map((i) => (
                <p key={i} className="text-white">
                  {BOARD_SPACES[i]?.name}
                </p>
              ))}
              {gameState.trade.offerCrowns > 0 && (
                <p className="text-arcane-gold">
                  ♛{gameState.trade.offerCrowns}
                </p>
              )}
            </div>
            <div>
              <p className="text-gray-400 mb-1">They want:</p>
              {gameState.trade.requestProperties.map((i) => (
                <p key={i} className="text-white">
                  {BOARD_SPACES[i]?.name}
                </p>
              ))}
              {gameState.trade.requestCrowns > 0 && (
                <p className="text-arcane-gold">
                  ♛{gameState.trade.requestCrowns}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                send("accept_trade");
                onClose();
              }}
              className="flex-1 py-2 bg-green-700 hover:bg-green-600 text-white font-display text-sm rounded border border-green-500/50"
            >
              Accept
            </button>
            <button
              onClick={() => {
                send("reject_trade");
                onClose();
              }}
              className="flex-1 py-2 bg-red-800 hover:bg-red-700 text-white font-display text-sm rounded border border-red-500/50"
            >
              Reject
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-arcane-deep border-2 border-arcane-gold/40 rounded-xl w-96 max-h-[80vh] overflow-y-auto p-4 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-arcane-gold text-center text-lg">
          Propose Trade
        </h3>

        {/* Target Selection */}
        <div>
          <label className="text-gray-400 text-xs">Trade with:</label>
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full mt-1 px-2 py-1.5 bg-arcane-dark border border-arcane-gold/20 rounded text-white text-sm"
          >
            {otherPlayers.map((p) => (
              <option key={p.id} value={p.id}>
                {TOKEN_EMOJIS[p.token]} {p.name} (♛{p.crowns})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Your offer */}
          <div>
            <p className="text-gray-400 text-xs mb-1">You offer:</p>
            {myPlayer.properties.map((i) => (
              <label
                key={i}
                className="flex items-center gap-1 text-xs text-white cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={offerProps.includes(i)}
                  onChange={() => toggleProp(offerProps, setOfferProps, i)}
                />
                {BOARD_SPACES[i]?.name}
              </label>
            ))}
            <div className="mt-2">
              <label className="text-gray-400 text-[10px]">Crowns:</label>
              <input
                type="number"
                min={0}
                max={myPlayer.crowns}
                value={offerCrowns}
                onChange={(e) => setOfferCrowns(Number(e.target.value))}
                className="w-full mt-0.5 px-2 py-1 bg-arcane-dark border border-arcane-gold/20 rounded text-white text-xs"
              />
            </div>
          </div>

          {/* You request */}
          <div>
            <p className="text-gray-400 text-xs mb-1">You want:</p>
            {targetPlayer?.properties.map((i) => (
              <label
                key={i}
                className="flex items-center gap-1 text-xs text-white cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={requestProps.includes(i)}
                  onChange={() =>
                    toggleProp(requestProps, setRequestProps, i)
                  }
                />
                {BOARD_SPACES[i]?.name}
              </label>
            ))}
            <div className="mt-2">
              <label className="text-gray-400 text-[10px]">Crowns:</label>
              <input
                type="number"
                min={0}
                max={targetPlayer?.crowns || 0}
                value={requestCrowns}
                onChange={(e) => setRequestCrowns(Number(e.target.value))}
                className="w-full mt-0.5 px-2 py-1 bg-arcane-dark border border-arcane-gold/20 rounded text-white text-xs"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 font-display text-sm rounded"
          >
            Cancel
          </button>
          <button
            onClick={handlePropose}
            className="flex-1 py-2 bg-arcane-purple hover:bg-arcane-purple/80 text-white font-display text-sm rounded border border-arcane-gold/30"
          >
            Propose
          </button>
        </div>
      </motion.div>
    </div>
  );
}
