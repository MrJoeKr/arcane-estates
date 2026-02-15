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
    <div
      ref={scrollRef}
      className="w-full max-h-24 overflow-y-auto bg-arcane-dark/60 border border-arcane-gold/10 rounded p-2"
    >
      {logs.length === 0 ? (
        <p className="text-gray-600 text-[10px] italic">
          Game events will appear here...
        </p>
      ) : (
        <div className="space-y-0.5">
          {logs.slice(-50).map((log, i) => (
            <p key={i} className="text-gray-400 text-[10px] leading-tight">
              {log}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
