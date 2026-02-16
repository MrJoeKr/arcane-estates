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
      <p className="font-display text-arcane-gold text-glow-gold-subtle text-xs uppercase tracking-widest text-center mb-2">
        Wizards
      </p>
      {players
        .filter((p) => !p.bankrupt)
        .map((player) => {
          const isCurrentTurn = player.id === currentPlayerId;
          const isMe = player.id === mySessionId;

          return (
            <div
              key={player.id}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                isCurrentTurn
                  ? "bg-arcane-purple/20 border-l-2 border-l-arcane-gold border border-arcane-gold/15"
                  : "border border-transparent hover:bg-white/[0.03]"
              } ${isMe ? "ring-1 ring-arcane-gold/20" : ""}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {TOKEN_EMOJIS[player.token] || "\u26AA"}
                </span>
                <span
                  className={`font-display text-sm ${
                    isMe ? "text-arcane-gold" : "text-parchment/80"
                  }`}
                >
                  {player.name}
                  {isMe && " (you)"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {player.inJail && (
                  <span className="text-[10px] text-red-400/80">{"\u26D3\uFE0F"}</span>
                )}
                <span className="text-arcane-gold-light font-display text-sm">
                  {"\u265B"}{player.crowns}
                </span>
                <span className="text-parchment/40 text-xs">
                  {player.properties.length}{"\uD83C\uDFE0"}
                </span>
              </div>
            </div>
          );
        })}
    </div>
  );
}
