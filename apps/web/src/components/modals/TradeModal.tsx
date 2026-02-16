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
        className="fixed inset-0 modal-backdrop flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="modal-container ornament-corners shimmer relative w-80 p-5"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="font-display text-arcane-gold text-glow-gold-subtle text-center">
            Trade Offer from {fromPlayer?.name}
          </h3>

          <div className="divider-gold my-3" />

          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 text-xs">
            <div>
              <p className="text-parchment/50 mb-1">They offer:</p>
              {gameState.trade.offerProperties.map((i) => (
                <p key={i} className="text-parchment">
                  {BOARD_SPACES[i]?.name}
                </p>
              ))}
              {gameState.trade.offerCrowns > 0 && (
                <p className="text-arcane-gold">
                  {"\u265B"}{gameState.trade.offerCrowns}
                </p>
              )}
            </div>
            <div className="w-px bg-arcane-gold/15 self-stretch" />
            <div>
              <p className="text-parchment/50 mb-1">They want:</p>
              {gameState.trade.requestProperties.map((i) => (
                <p key={i} className="text-parchment">
                  {BOARD_SPACES[i]?.name}
                </p>
              ))}
              {gameState.trade.requestCrowns > 0 && (
                <p className="text-arcane-gold">
                  {"\u265B"}{gameState.trade.requestCrowns}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
                send("accept_trade");
                onClose();
              }}
              className="btn-arcane btn-success flex-1 py-2 rounded-lg text-sm"
            >
              Accept
            </button>
            <button
              onClick={() => {
                send("reject_trade");
                onClose();
              }}
              className="btn-arcane btn-danger flex-1 py-2 rounded-lg text-sm"
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
      className="fixed inset-0 modal-backdrop flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="modal-container ornament-corners relative w-96 max-h-[80vh] overflow-y-auto p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-arcane-gold text-glow-gold-subtle text-center text-lg">
          Propose Trade
        </h3>

        <div className="divider-gold my-3" />

        {/* Target Selection */}
        <div className="mb-3">
          <label className="text-parchment/50 text-xs">Trade with:</label>
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="input-arcane w-full text-sm mt-1"
          >
            {otherPlayers.map((p) => (
              <option key={p.id} value={p.id}>
                {TOKEN_EMOJIS[p.token]} {p.name} ({"\u265B"}{p.crowns})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-3">
          {/* Your offer */}
          <div>
            <p className="text-parchment/50 text-xs mb-1">You offer:</p>
            {myPlayer.properties.map((i) => (
              <label
                key={i}
                className="flex items-center gap-1.5 text-xs text-parchment cursor-pointer py-0.5"
              >
                <input
                  type="checkbox"
                  checked={offerProps.includes(i)}
                  onChange={() => toggleProp(offerProps, setOfferProps, i)}
                  className="accent-arcane-gold"
                />
                {BOARD_SPACES[i]?.name}
              </label>
            ))}
            <div className="mt-2">
              <label className="text-parchment/40 text-[10px]">Crowns:</label>
              <input
                type="number"
                min={0}
                max={myPlayer.crowns}
                value={offerCrowns}
                onChange={(e) => setOfferCrowns(Number(e.target.value))}
                className="input-arcane text-xs w-full mt-0.5"
              />
            </div>
          </div>

          {/* Visual divider */}
          <div className="w-px bg-arcane-gold/15 self-stretch" />

          {/* You request */}
          <div>
            <p className="text-parchment/50 text-xs mb-1">You want:</p>
            {targetPlayer?.properties.map((i) => (
              <label
                key={i}
                className="flex items-center gap-1.5 text-xs text-parchment cursor-pointer py-0.5"
              >
                <input
                  type="checkbox"
                  checked={requestProps.includes(i)}
                  onChange={() =>
                    toggleProp(requestProps, setRequestProps, i)
                  }
                  className="accent-arcane-gold"
                />
                {BOARD_SPACES[i]?.name}
              </label>
            ))}
            <div className="mt-2">
              <label className="text-parchment/40 text-[10px]">Crowns:</label>
              <input
                type="number"
                min={0}
                max={targetPlayer?.crowns || 0}
                value={requestCrowns}
                onChange={(e) => setRequestCrowns(Number(e.target.value))}
                className="input-arcane text-xs w-full mt-0.5"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="btn-arcane btn-ghost flex-1 py-2 rounded-lg text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handlePropose}
            className="btn-arcane btn-primary flex-1 py-2 rounded-lg text-sm"
          >
            Propose
          </button>
        </div>
      </motion.div>
    </div>
  );
}
