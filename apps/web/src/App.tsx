import { useState } from "react";
import { HomePage } from "./components/home/HomePage";
import { LobbyScreen } from "./components/lobby/LobbyScreen";
import { Board } from "./components/board/Board";
import { useColyseus } from "./hooks/use-colyseus";

type Screen = "home" | "lobby" | "game";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const { room, gameState, connect, error, send, logs } = useColyseus();

  const handleCreate = async (playerName: string) => {
    await connect(playerName, undefined);
    setScreen("lobby");
  };

  const handleJoin = async (playerName: string, roomCode: string) => {
    await connect(playerName, roomCode);
    setScreen("lobby");
  };

  // Auto-transition to game when phase changes
  if (gameState?.phase === "playing" && screen === "lobby") {
    setScreen("game");
  }

  if (gameState?.phase === "finished" && screen !== "home") {
    // Could show victory screen here
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {screen === "home" && (
        <HomePage
          onCreateGame={handleCreate}
          onJoinGame={handleJoin}
          error={error}
        />
      )}
      {screen === "lobby" && room && gameState && (
        <LobbyScreen room={room} gameState={gameState} />
      )}
      {screen === "game" && room && gameState && (
        <Board room={room} gameState={gameState} send={send} logs={logs} />
      )}
    </div>
  );
}
