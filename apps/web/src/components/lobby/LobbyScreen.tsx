import { motion } from "framer-motion";
import type { Room } from "colyseus.js";
import type { GameStateSnapshot } from "../../hooks/use-colyseus";
import { PLAYER_TOKENS, TOKEN_EMOJIS } from "@arcane-estates/shared";

interface LobbyScreenProps {
  room: Room;
  gameState: GameStateSnapshot;
}

const playerListVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const playerItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

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
      <div className="relative z-10 text-center space-y-8 p-8 max-w-lg w-full">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <h1 className="font-display text-3xl text-arcane-gold text-glow-gold-subtle tracking-wide">
            The Registry
          </h1>
          <div className="divider-gold mt-3" />
        </motion.div>

        {/* Room Code Card */}
        <motion.div
          className="glass-panel p-6 ornament-corners relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div className="absolute inset-0 shimmer pointer-events-none" />
          <p className="text-arcane-gold-dim text-sm uppercase tracking-widest relative z-10">
            Room Code
          </p>
          <p className="font-display text-3xl tracking-[0.4em] text-arcane-gold-light text-glow-gold mt-2 relative z-10">
            {room.roomId}
          </p>
          <p className="text-arcane-gold-dim/60 text-xs mt-3 relative z-10">
            Share this code with other wizards
          </p>
        </motion.div>

        {/* Token Selection */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-parchment/60 text-sm uppercase tracking-wider">
            Choose your token
          </p>
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
                  className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all ${
                    isSelected
                      ? "bg-arcane-purple/40 border border-arcane-gold shadow-[0_0_20px_rgba(212,168,67,0.25)]"
                      : isTaken
                        ? "bg-arcane-deep/60 border border-arcane-gold/15 opacity-30 grayscale cursor-not-allowed"
                        : "bg-arcane-deep/60 border border-arcane-gold/15 hover:border-arcane-gold/40 hover:bg-arcane-purple/20"
                  }`}
                  title={token}
                  whileHover={!isTaken ? { scale: 1.1, y: -2 } : undefined}
                  whileTap={!isTaken ? { scale: 0.9 } : undefined}
                >
                  {TOKEN_EMOJIS[token]}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Player List */}
        <motion.div
          className="glass-panel p-4 space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-parchment/60 text-sm uppercase tracking-wider">
              Wizards
            </p>
            <p className="text-arcane-gold-dim text-sm">
              {players.length}/6
            </p>
          </div>

          <motion.div
            className="space-y-2"
            variants={playerListVariants}
            initial="hidden"
            animate="visible"
          >
            {players.map((player) => (
              <motion.div
                key={player.id}
                className="flex items-center justify-between bg-arcane-deep/60 border border-arcane-gold/15 rounded-lg px-4 py-3"
                variants={playerItemVariants}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {TOKEN_EMOJIS[player.token] || "\u2753"}
                  </span>
                  <span className="text-white font-display">{player.name}</span>
                </div>
                {player.id === gameState.hostId && (
                  <span className="text-[10px] uppercase tracking-widest text-arcane-gold border border-arcane-gold/30 px-2 py-0.5 rounded">
                    HOST
                  </span>
                )}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Start Button (host only) */}
        {isHost && (
          <motion.button
            onClick={handleStart}
            disabled={!canStart}
            className={`btn-arcane btn-primary w-full rounded-xl py-4 text-lg font-display disabled:opacity-50 disabled:cursor-not-allowed ${
              canStart ? "animate-breathe" : ""
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={canStart ? { scale: 1.02 } : undefined}
            whileTap={canStart ? { scale: 0.98 } : undefined}
          >
            {canStart
              ? "Begin the Game"
              : `Waiting for wizards... (${players.length}/2)`}
          </motion.button>
        )}

        {/* Waiting Text (non-host) */}
        {!isHost && (
          <motion.p
            className="text-arcane-gold/50 italic text-glow-gold-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Waiting for the host to start the game...
          </motion.p>
        )}
      </div>
    </div>
  );
}
