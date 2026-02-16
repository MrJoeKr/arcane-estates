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
      <div
        ref={scrollRef}
        className="w-full max-h-32 overflow-y-auto rounded-lg p-2"
        style={{
          background: "rgba(5, 1, 18, 0.5)",
          border: "1px solid rgba(212, 168, 67, 0.08)",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 12px, black 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 12px, black 100%)",
        }}
      >
        {logs.length === 0 ? (
          <p className="text-arcane-gold-dim/50 text-xs italic">
            Game events will appear here...
          </p>
        ) : (
          <div className="space-y-0.5">
            {logs.slice(-50).map((log, i) => (
              <p
                key={i}
                className={`text-parchment/50 text-xs leading-relaxed ${
                  i % 2 === 1 ? "bg-white/[0.02]" : ""
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
