import { useState } from "react";

interface HomePageProps {
  onCreateGame: (playerName: string) => void;
  onJoinGame: (playerName: string, roomCode: string) => void;
  error: string | null;
}

export function HomePage({ onCreateGame, onJoinGame, error }: HomePageProps) {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [mode, setMode] = useState<"menu" | "create" | "join">("menu");

  return (
    <div className="min-h-screen bg-magical flex items-center justify-center">
      <div className="text-center space-y-8 p-8">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="font-display text-6xl font-black text-arcane-gold text-glow-gold tracking-wider">
            Arcane Estates
          </h1>
          <p className="text-arcane-gold/60 text-xl italic">
            Build Your Magical Empire
          </p>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-4">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-arcane-gold/50" />
          <span className="text-arcane-gold text-2xl">♛</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-arcane-gold/50" />
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        {mode === "menu" && (
          <div className="space-y-4">
            <button
              onClick={() => setMode("create")}
              className="block w-64 mx-auto py-4 px-8 bg-arcane-purple hover:bg-arcane-purple/80 text-white font-display text-lg rounded-lg border border-arcane-gold/30 hover:border-arcane-gold transition-all hover:shadow-[0_0_20px_rgba(212,168,67,0.3)]"
            >
              Create Game
            </button>
            <button
              onClick={() => setMode("join")}
              className="block w-64 mx-auto py-4 px-8 bg-arcane-deep hover:bg-arcane-purple/40 text-arcane-gold font-display text-lg rounded-lg border border-arcane-gold/30 hover:border-arcane-gold transition-all"
            >
              Join Game
            </button>
          </div>
        )}

        {(mode === "create" || mode === "join") && (
          <div className="space-y-4 max-w-sm mx-auto">
            <input
              type="text"
              placeholder="Your wizard name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              className="w-full px-4 py-3 bg-arcane-deep/80 border border-arcane-gold/30 rounded-lg text-white placeholder-gray-500 focus:border-arcane-gold focus:outline-none font-display text-center"
            />

            {mode === "join" && (
              <input
                type="text"
                placeholder="Room code..."
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                maxLength={20}
                className="w-full px-4 py-3 bg-arcane-deep/80 border border-arcane-gold/30 rounded-lg text-white placeholder-gray-500 focus:border-arcane-gold focus:outline-none font-display text-center tracking-widest"
              />
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setMode("menu")}
                className="flex-1 py-3 px-6 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-600 transition-colors"
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
                disabled={!name.trim() || (mode === "join" && !roomCode.trim())}
                className="flex-1 py-3 px-6 bg-arcane-purple hover:bg-arcane-purple/80 text-white font-display rounded-lg border border-arcane-gold/30 hover:border-arcane-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mode === "create" ? "Create" : "Join"}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-gray-600 text-sm mt-12">
          A game of magical property trading for 2-6 wizards
        </p>
      </div>
    </div>
  );
}
