import { motion } from "framer-motion";
import type { Room } from "colyseus.js";
import type { GameStateSnapshot } from "../../hooks/use-colyseus";
import { PLAYER_TOKENS, TOKEN_EMOJIS } from "@arcane-estates/shared";

interface LobbyScreenProps {
  room: Room;
  gameState: GameStateSnapshot;
}

export function LobbyScreen({ room, gameState }: LobbyScreenProps) {
  const players = Array.from(gameState.players.values());
  const isHost = room.sessionId === gameState.hostId;
  const canStart = players.length >= 2;

  const handleStart = () => {
    room.send("start_game");
  };

  const handleSelectToken = (token: string) => {
    room.send("select_token", { token });
  };

  // Get taken tokens
  const takenTokens = new Set(players.map((p) => p.token));
  const myPlayer = gameState.players.get(room.sessionId);

  return (
    <div className="min-h-screen bg-magical flex items-center justify-center">
      <div className="text-center space-y-8 p-8 max-w-lg w-full">
        <motion.h1
          className="font-display text-4xl font-bold text-arcane-gold text-glow-gold-pulse"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Arcane Estates
        </motion.h1>

        {/* Room Code */}
        <motion.div
          className="bg-arcane-deep/80 border border-arcane-gold/30 rounded-lg p-6 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="absolute inset-0 shimmer pointer-events-none" />
          <p className="text-gray-400 text-sm mb-1 relative z-10">Room Code</p>
          <p className="font-display text-3xl tracking-[0.3em] text-arcane-gold font-bold relative z-10">
            {room.roomId}
          </p>
          <p className="text-gray-500 text-xs mt-2 relative z-10">
            Share this code with other wizards
          </p>
        </motion.div>

        {/* Token Selection */}
        <div className="space-y-3">
          <p className="text-gray-400 text-sm">Choose your token</p>
          <div className="flex justify-center gap-3 flex-wrap">
            {PLAYER_TOKENS.map((token: string) => {
              const isTaken =
                takenTokens.has(token) && myPlayer?.token !== token;
              const isSelected = myPlayer?.token === token;
              return (
                <motion.button
                  key={token}
                  onClick={() => handleSelectToken(token)}
                  disabled={isTaken}
                  className={`w-14 h-14 rounded-lg flex items-center justify-center text-2xl transition-all ${
                    isSelected
                      ? "bg-arcane-purple border-2 border-arcane-gold shadow-[0_0_15px_rgba(212,168,67,0.4)]"
                      : isTaken
                        ? "bg-gray-800 border border-gray-700 opacity-40 cursor-not-allowed"
                        : "bg-arcane-deep border border-arcane-gold/20 hover:border-arcane-gold/60 hover:bg-arcane-purple/30"
                  }`}
                  title={token}
                  whileHover={!isTaken ? { scale: 1.1 } : undefined}
                  whileTap={!isTaken ? { scale: 0.95 } : undefined}
                >
                  {TOKEN_EMOJIS[token]}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Player List */}
        <div className="space-y-2">
          <p className="text-gray-400 text-sm">
            Wizards ({players.length}/6)
          </p>
          {players.map((player, index) => (
            <motion.div
              key={player.id}
              className="flex items-center justify-between bg-arcane-deep/60 border border-arcane-gold/10 rounded-lg px-4 py-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {TOKEN_EMOJIS[player.token] || "\u2753"}
                </span>
                <span className="text-white font-display">{player.name}</span>
              </div>
              {player.id === gameState.hostId && (
                <span className="text-arcane-gold text-xs font-display border border-arcane-gold/30 px-2 py-1 rounded">
                  HOST
                </span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Start Button (host only) */}
        {isHost && (
          <motion.button
            onClick={handleStart}
            disabled={!canStart}
            className="btn-arcane w-full py-4 px-8 bg-arcane-purple hover:bg-arcane-purple/80 text-white font-display text-xl rounded-lg border border-arcane-gold/30 hover:border-arcane-gold transition-all hover:shadow-[0_0_20px_rgba(212,168,67,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={canStart ? { scale: 1.02 } : undefined}
            whileTap={canStart ? { scale: 0.98 } : undefined}
          >
            {canStart
              ? "Begin the Game"
              : `Waiting for wizards... (${players.length}/2)`}
          </motion.button>
        )}

        {!isHost && (
          <p className="text-arcane-gold/60 italic text-glow-gold-pulse">
            Waiting for the host to start the game...
          </p>
        )}
      </div>
    </div>
  );
}
