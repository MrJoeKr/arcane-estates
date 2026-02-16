import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HomePage } from "./components/home/HomePage";
import { LobbyScreen } from "./components/lobby/LobbyScreen";
import { Board } from "./components/board/Board";
import { useColyseus } from "./hooks/use-colyseus";

type Screen = "home" | "lobby" | "game";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const { room, gameState, connect, error, send, logs } = useColyseus();

  const handleCreate = async (playerName: string) => {
    const ok = await connect(playerName, undefined);
    if (ok) setScreen("lobby");
  };

  const handleJoin = async (playerName: string, roomId: string) => {
    const ok = await connect(playerName, roomId);
    if (ok) setScreen("lobby");
  };

  // Auto-transition to game when phase changes
  if (gameState?.phase === "playing" && screen === "lobby") {
    setScreen("game");
  }

  if (gameState?.phase === "finished" && screen !== "home") {
    // Could show victory screen here
  }

  return (
    <div className="min-h-screen bg-arcane-void text-white">
      <AnimatePresence mode="wait">
        {screen === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <HomePage
              onCreateGame={handleCreate}
              onJoinGame={handleJoin}
              error={error}
            />
          </motion.div>
        )}
        {screen === "lobby" && room && gameState && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <LobbyScreen room={room} gameState={gameState} />
          </motion.div>
        )}
        {screen === "game" && room && gameState && (
          <motion.div
            key="game"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <Board room={room} gameState={gameState} send={send} logs={logs} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
