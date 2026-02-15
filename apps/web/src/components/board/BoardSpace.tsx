import type { SpaceDefinition } from "@arcane-estates/shared";
import type { SpaceSnapshot, PlayerSnapshot } from "../../hooks/use-colyseus";
import { COLOR_HEX, TOKEN_EMOJIS } from "@arcane-estates/shared";

interface BoardSpaceProps {
  space: SpaceDefinition;
  spaceState?: SpaceSnapshot;
  playersOnSpace: PlayerSnapshot[];
  gridRow: number;
  gridCol: number;
  onClick: () => void;
}

const SPECIAL_ICONS: Record<string, string> = {
  go: "🌀",
  jail: "⛓️",
  "free-parking": "🌿",
  "go-to-jail": "💀",
  "fate-card": "🔮",
  "guild-card": "📜",
  tax: "💰",
  portal: "🚪",
  "mana-well": "💎",
};

export function BoardSpace({
  space,
  spaceState,
  playersOnSpace,
  gridRow,
  gridCol,
  onClick,
}: BoardSpaceProps) {
  const isCorner = [0, 10, 20, 30].includes(space.index);
  const isProperty = space.type === "property";
  const colorHex = space.color ? COLOR_HEX[space.color] : undefined;

  // Determine side for text orientation
  const side =
    gridRow === 11
      ? "bottom"
      : gridRow === 1
        ? "top"
        : gridCol === 1
          ? "left"
          : "right";

  const isVertical = side === "left" || side === "right";

  return (
    <div
      className={`relative border border-arcane-gold/10 cursor-pointer hover:bg-white/5 transition-colors overflow-hidden flex flex-col ${
        isCorner ? "p-1" : "p-0.5"
      }`}
      style={{
        gridRow,
        gridColumn: gridCol,
      }}
      onClick={onClick}
    >
      {/* Color band for properties */}
      {isProperty && colorHex && (
        <div
          className={`absolute ${
            side === "bottom"
              ? "top-0 left-0 right-0 h-[6px]"
              : side === "top"
                ? "bottom-0 left-0 right-0 h-[6px]"
                : side === "left"
                  ? "top-0 right-0 bottom-0 w-[6px]"
                  : "top-0 left-0 bottom-0 w-[6px]"
          }`}
          style={{ backgroundColor: colorHex }}
        />
      )}

      {/* Space content */}
      <div
        className={`flex-1 flex flex-col items-center justify-center ${
          isVertical && !isCorner ? "writing-mode-vertical" : ""
        }`}
      >
        {/* Icon for special spaces */}
        {!isProperty && (
          <span className="text-[10px] leading-none">
            {SPECIAL_ICONS[space.type] || ""}
          </span>
        )}

        {/* Space name */}
        <span
          className={`font-display leading-tight text-center ${
            isCorner ? "text-[9px]" : "text-[7px]"
          } text-gray-300`}
        >
          {space.name}
        </span>

        {/* Price */}
        {space.cost && space.type !== "tax" && (
          <span className="text-[6px] text-arcane-gold/60">
            ♛{space.cost}
          </span>
        )}
        {space.type === "tax" && (
          <span className="text-[6px] text-red-400">
            -{space.cost}♛
          </span>
        )}

        {/* Buildings */}
        {spaceState && spaceState.towers > 0 && !spaceState.hasFortress && (
          <div className="flex gap-px">
            {Array.from({ length: spaceState.towers }).map((_, i) => (
              <span key={i} className="text-[5px] text-green-400">
                🏠
              </span>
            ))}
          </div>
        )}
        {spaceState?.hasFortress && (
          <span className="text-[7px] text-red-400">🏰</span>
        )}

        {/* Mortgage indicator */}
        {spaceState?.isMortgaged && (
          <span className="text-[5px] text-gray-500">M</span>
        )}
      </div>

      {/* Players on this space */}
      {playersOnSpace.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-px p-px flex-wrap">
          {playersOnSpace.map((player) => (
            <span key={player.id} className="text-[8px]" title={player.name}>
              {TOKEN_EMOJIS[player.token] || "⚪"}
            </span>
          ))}
        </div>
      )}

      {/* Owner indicator */}
      {spaceState?.ownerId && (
        <div
          className="absolute top-0 right-0 w-2 h-2 rounded-bl-sm opacity-60"
          style={{
            backgroundColor: colorHex || "#888",
          }}
        />
      )}
    </div>
  );
}
