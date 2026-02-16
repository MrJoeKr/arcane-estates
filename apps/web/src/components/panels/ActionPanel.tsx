import type { Room } from "colyseus.js";
import type { GameStateSnapshot } from "../../hooks/use-colyseus";
import { useGameStore } from "../../hooks/use-game-store";

interface ActionPanelProps {
  room: Room;
  gameState: GameStateSnapshot;
  isMyTurn: boolean;
  send: (type: string, data?: any) => void;
}

export function ActionPanel({
  room,
  gameState,
  isMyTurn,
  send,
}: ActionPanelProps) {
  const { setShowTradeModal } = useGameStore();
  const turnPhase = gameState.turnPhase;
  const player = gameState.players.get(room.sessionId);

  if (!player || player.bankrupt) return null;

  return (
    <div className="flex flex-wrap gap-2 justify-center min-h-[40px] items-center">
      {/* Buy Property */}
      {isMyTurn && turnPhase === "postRoll" && (
        <>
          <button
            onClick={() => send("buy_property")}
            className="btn-arcane px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-display rounded border border-green-500/50 transition-colors hover:shadow-[0_0_12px_rgba(34,197,94,0.3)]"
          >
            Buy Property
          </button>
          <button
            onClick={() => send("decline_property")}
            className="btn-arcane px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-display rounded border border-gray-500/50 transition-colors"
          >
            Decline (Auction)
          </button>
        </>
      )}

      {/* Jail Actions */}
      {isMyTurn && player.inJail && turnPhase === "roll" && (
        <>
          <button
            onClick={() => send("pay_jail_fine")}
            className="btn-arcane px-4 py-2 bg-yellow-700 hover:bg-yellow-600 text-white text-sm font-display rounded border border-yellow-500/50 transition-colors"
          >
            Pay {"\u265B"}50 Fine
          </button>
          {player.hasEscapeCard && (
            <button
              onClick={() => send("use_escape_card")}
              className="btn-arcane px-4 py-2 bg-arcane-purple hover:bg-arcane-purple/80 text-white text-sm font-display rounded border border-arcane-gold/30 transition-colors"
            >
              Use Escape Card
            </button>
          )}
        </>
      )}

      {/* Trade */}
      {isMyTurn && (turnPhase === "action" || turnPhase === "postRoll") && (
        <button
          onClick={() => setShowTradeModal(true)}
          className="btn-arcane px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white text-sm font-display rounded border border-blue-500/50 transition-colors"
        >
          Trade
        </button>
      )}

      {/* End Turn */}
      {isMyTurn &&
        (turnPhase === "action" || turnPhase === "endTurn") && (
          <button
            onClick={() => send("end_turn")}
            className="btn-arcane px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-sm font-display rounded border border-red-500/50 transition-colors hover:shadow-[0_0_12px_rgba(239,68,68,0.3)]"
          >
            End Turn
          </button>
        )}
    </div>
  );
}
