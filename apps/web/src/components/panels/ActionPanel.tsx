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
    <div className="flex flex-wrap gap-2 justify-center min-h-[44px] items-center">
      {/* Buy Property */}
      {isMyTurn && turnPhase === "postRoll" && (
        <>
          <button
            onClick={() => send("buy_property")}
            className="btn-arcane btn-success px-5 py-2 rounded-lg text-sm"
          >
            Buy Property
          </button>
          <button
            onClick={() => send("decline_property")}
            className="btn-arcane btn-ghost px-5 py-2 rounded-lg text-sm"
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
            className="btn-arcane px-5 py-2 rounded-lg text-sm bg-amber-800/80 border border-amber-500/30 text-white hover:bg-amber-700"
          >
            Pay {"\u265B"}50 Fine
          </button>
          {player.hasEscapeCard && (
            <button
              onClick={() => send("use_escape_card")}
              className="btn-arcane btn-primary px-5 py-2 rounded-lg text-sm"
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
          className="btn-arcane px-5 py-2 rounded-lg text-sm bg-arcane-teal/20 border border-arcane-teal/30 text-arcane-teal hover:bg-arcane-teal/30"
        >
          Trade
        </button>
      )}

      {/* End Turn */}
      {isMyTurn &&
        (turnPhase === "action" || turnPhase === "endTurn") && (
          <button
            onClick={() => send("end_turn")}
            className="btn-arcane btn-danger px-5 py-2 rounded-lg text-sm"
          >
            End Turn
          </button>
        )}
    </div>
  );
}
