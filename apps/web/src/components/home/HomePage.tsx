import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HomePageProps {
  onCreateGame: (playerName: string) => void;
  onJoinGame: (playerName: string, roomCode: string) => void;
  error: string | null;
}

const menuContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const menuItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function HomePage({ onCreateGame, onJoinGame, error }: HomePageProps) {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [mode, setMode] = useState<"menu" | "create" | "join">("menu");

  return (
    <div className="min-h-screen bg-magical flex items-center justify-center">
      <div className="relative z-10 text-center space-y-8 p-8 max-w-md w-full">
        {/* Title Block */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        >
          <p className="text-arcane-gold/60 text-2xl tracking-widest">&#10022;</p>
          <h1 className="font-title text-5xl md:text-7xl text-arcane-gold text-glow-gold tracking-wider">
            Arcane Estates
          </h1>
          <p className="text-arcane-gold/50 text-xl italic">
            Build Your Magical Empire
          </p>
          <div className="divider-gold-thick mt-6" />
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="bg-arcane-crimson/15 border border-arcane-crimson/30 text-red-300 rounded-lg px-4 py-2"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menu Buttons */}
        <AnimatePresence mode="wait">
          {mode === "menu" && (
            <motion.div
              key="menu"
              className="space-y-4 flex flex-col items-center"
              variants={menuContainerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
            >
              <motion.button
                onClick={() => setMode("create")}
                className="btn-arcane btn-primary px-10 py-4 text-lg rounded-xl w-72 font-display"
                variants={menuItemVariants}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Create Game
              </motion.button>
              <motion.button
                onClick={() => setMode("join")}
                className="btn-arcane btn-ghost px-10 py-4 text-lg rounded-xl w-72 font-display"
                variants={menuItemVariants}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Join Game
              </motion.button>
            </motion.div>
          )}

          {/* Form (create or join) */}
          {(mode === "create" || mode === "join") && (
            <motion.div
              key="form"
              className="glass-panel p-8 max-w-sm mx-auto ornament-corners"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="space-y-4">
                <h2 className="font-display text-xl text-arcane-gold mb-4">
                  {mode === "create" ? "Create a Game" : "Join a Game"}
                </h2>

                <input
                  type="text"
                  placeholder="Your wizard name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={20}
                  className="input-arcane w-full px-4 py-3 text-center"
                />

                {mode === "join" && (
                  <input
                    type="text"
                    placeholder="Room code..."
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    maxLength={20}
                    className="input-arcane w-full px-4 py-3 text-center tracking-widest"
                  />
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setMode("menu")}
                    className="btn-arcane btn-ghost flex-1 py-3 px-6 rounded-lg font-display"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (!name.trim()) return;
                      if (mode === "create") {
                        onCreateGame(name.trim());
                      } else {
                        if (!roomCode.trim()) return;
                        onJoinGame(name.trim(), roomCode.trim());
                      }
                    }}
                    disabled={
                      !name.trim() || (mode === "join" && !roomCode.trim())
                    }
                    className="btn-arcane btn-primary flex-1 py-3 px-6 rounded-lg font-display disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {mode === "create" ? "Create" : "Join"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.p
          className="text-arcane-gold-dim text-sm mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          A game of magical property trading for 2-6 wizards
        </motion.p>
      </div>
    </div>
  );
}
