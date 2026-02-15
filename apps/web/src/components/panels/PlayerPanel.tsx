import type { PlayerSnapshot } from "../../hooks/use-colyseus";
import { TOKEN_EMOJIS } from "@arcane-estates/shared";

interface PlayerPanelProps {
  players: PlayerSnapshot[];
  currentPlayerId: string;
  mySessionId: string;
}

export function PlayerPanel({
  players,
  currentPlayerId,
  mySessionId,
}: PlayerPanelProps) {
  return (
    <div className="space-y-1">
      {players
        .filter((p) => !p.bankrupt)
        .map((player) => {
          const isCurrentTurn = player.id === currentPlayerId;
          const isMe = player.id === mySessionId;

          return (
            <div
              key={player.id}
              className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-all ${
                isCurrentTurn
                  ? "bg-arcane-purple/30 border border-arcane-gold/40"
                  : "bg-arcane-deep/40 border border-transparent"
              } ${isMe ? "ring-1 ring-arcane-gold/30" : ""}`}
            >
              <div className="flex items-center gap-2">
                {isCurrentTurn && (
                  <span className="text-arcane-gold text-xs animate-pulse">
                    ▶
                  </span>
                )}
                <span className="text-sm">
                  {TOKEN_EMOJIS[player.token] || "⚪"}
                </span>
                <span
                  className={`font-display text-xs ${
                    isMe ? "text-arcane-gold" : "text-gray-300"
                  }`}
                >
                  {player.name}
                  {isMe && " (you)"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {player.inJail && (
                  <span className="text-[10px] text-red-400">⛓️</span>
                )}
                <span className="text-arcane-gold font-display text-xs">
                  ♛{player.crowns}
                </span>
                <span className="text-gray-500 text-[10px]">
                  {player.properties.length}🏠
                </span>
              </div>
            </div>
          );
        })}
    </div>
  );
}
