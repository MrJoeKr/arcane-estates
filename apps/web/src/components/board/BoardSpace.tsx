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
  go: "\u{1F300}",
  jail: "\u{26D3}\u{FE0F}",
  "free-parking": "\u{1F33F}",
  "go-to-jail": "\u{1F480}",
  "fate-card": "\u{1F52E}",
  "guild-card": "\u{1F4DC}",
  tax: "\u{1F4B0}",
  portal: "\u{1F6AA}",
  "mana-well": "\u{1F48E}",
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

  // Owner indicator: inset colored border via boxShadow
  const ownerShadow = spaceState?.ownerId
    ? `inset 0 0 0 1.5px ${colorHex || "#888"}50`
    : undefined;

  // Mortgage indicator: diagonal stripe overlay via linear-gradient
  const mortgageOverlay = spaceState?.isMortgaged
    ? "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(120,120,120,0.15) 3px, rgba(120,120,120,0.15) 5px)"
    : undefined;

  // Tooltip content
  const tooltipText = space.cost
    ? `${space.name} — ${space.cost} crowns`
    : space.name;

  // Visible tokens (max 3, then +N)
  const visibleTokens = playersOnSpace.slice(0, 3);
  const overflowCount = playersOnSpace.length - 3;

  return (
    <div
      className={`relative cursor-pointer transition-all duration-150 overflow-hidden flex flex-col hover:bg-white/[0.06] ${
        isCorner ? "p-1" : "p-0.5"
      }`}
      style={{
        gridRow,
        gridColumn: gridCol,
        background: "rgba(13, 5, 32, 0.4)",
        borderRight: "0.5px solid rgba(212, 168, 67, 0.08)",
        borderBottom: "0.5px solid rgba(212, 168, 67, 0.08)",
        boxShadow: ownerShadow,
        backgroundImage: mortgageOverlay,
      }}
      onClick={onClick}
      data-tooltip={tooltipText}
    >
      {/* Color band for properties */}
      {isProperty && colorHex && (
        <div
          className={`absolute ${
            side === "bottom"
              ? "top-0 left-0 right-0 h-[10px]"
              : side === "top"
                ? "bottom-0 left-0 right-0 h-[10px]"
                : side === "left"
                  ? "top-0 right-0 bottom-0 w-[10px]"
                  : "top-0 left-0 bottom-0 w-[10px]"
          }`}
          style={{
            backgroundColor: colorHex,
            boxShadow: "inset 0 0 6px rgba(255,255,255,0.15)",
          }}
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
          <span className="text-[10px] leading-none opacity-80">
            {SPECIAL_ICONS[space.type] || ""}
          </span>
        )}

        {/* Space name */}
        <span
          className={`font-display leading-tight text-center ${
            isCorner ? "text-[10px]" : "text-[8px]"
          } text-parchment/90`}
        >
          {space.name}
        </span>

        {/* Price */}
        {space.cost && space.type !== "tax" && (
          <span className="text-[7px] text-arcane-gold/50 font-display">
            {"\u265B"}{space.cost}
          </span>
        )}
        {space.type === "tax" && (
          <span className="text-[7px] text-red-400/80">
            -{space.cost}{"\u265B"}
          </span>
        )}

        {/* Buildings - gem-like dots */}
        {spaceState && spaceState.towers > 0 && !spaceState.hasFortress && (
          <div className="flex gap-[2px] mt-[1px]">
            {Array.from({ length: spaceState.towers }).map((_, i) => (
              <div
                key={i}
                className="w-[5px] h-[5px] rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.5)]"
              />
            ))}
          </div>
        )}
        {spaceState?.hasFortress && (
          <div className="w-[7px] h-[7px] rounded-sm bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)] mt-[1px]" />
        )}
      </div>

      {/* Players on this space - dedicated bottom row */}
      {playersOnSpace.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-px px-px py-[1px] bg-black/40">
          {visibleTokens.map((player) => (
            <span key={player.id} className="text-[10px] leading-none" title={player.name}>
              {TOKEN_EMOJIS[player.token] || "\u26AA"}
            </span>
          ))}
          {overflowCount > 0 && (
            <span className="text-[7px] text-arcane-gold font-bold leading-none">
              +{overflowCount}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
