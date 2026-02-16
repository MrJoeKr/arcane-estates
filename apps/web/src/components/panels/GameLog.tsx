import { useEffect, useRef } from "react";

interface GameLogProps {
  logs: string[];
}

export function GameLog({ logs }: GameLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="relative w-full">
      {/* Top fade gradient for scroll indication */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-arcane-dark/80 to-transparent z-10 pointer-events-none rounded-t" />
      <div
        ref={scrollRef}
        className="w-full max-h-32 overflow-y-auto bg-arcane-dark/60 border border-arcane-gold/10 rounded p-2"
      >
        {logs.length === 0 ? (
          <p className="text-gray-600 text-xs italic">
            Game events will appear here...
          </p>
        ) : (
          <div className="space-y-0.5">
            {logs.slice(-50).map((log, i) => (
              <p
                key={i}
                className={`text-gray-400 text-xs leading-tight ${
                  i % 2 === 1 ? "bg-white/5" : ""
                } px-1 rounded-sm`}
              >
                {log}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
