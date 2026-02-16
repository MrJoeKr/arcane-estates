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
    ? `inset 0 0 0 2px ${colorHex || "#888"}40`
    : undefined;

  // Mortgage indicator: diagonal stripe overlay via linear-gradient
  const mortgageOverlay = spaceState?.isMortgaged
    ? "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(128,128,128,0.25) 3px, rgba(128,128,128,0.25) 5px)"
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
      className={`relative border border-arcane-gold/10 cursor-pointer hover:bg-white/10 hover:border-arcane-gold/30 transition-colors overflow-hidden flex flex-col ${
        isCorner ? "p-1" : "p-0.5"
      }`}
      style={{
        gridRow,
        gridColumn: gridCol,
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
              ? "top-0 left-0 right-0 h-[8px]"
              : side === "top"
                ? "bottom-0 left-0 right-0 h-[8px]"
                : side === "left"
                  ? "top-0 right-0 bottom-0 w-[8px]"
                  : "top-0 left-0 bottom-0 w-[8px]"
          } shadow-[inset_0_-1px_2px_rgba(0,0,0,0.3)]`}
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
            isCorner ? "text-[10px]" : "text-[8px]"
          } text-parchment`}
        >
          {space.name}
        </span>

        {/* Price */}
        {space.cost && space.type !== "tax" && (
          <span className="text-[7px] text-arcane-gold/60">
            {"\u265B"}{space.cost}
          </span>
        )}
        {space.type === "tax" && (
          <span className="text-[7px] text-red-400">
            -{space.cost}{"\u265B"}
          </span>
        )}

        {/* Buildings - CSS dots instead of emoji */}
        {spaceState && spaceState.towers > 0 && !spaceState.hasFortress && (
          <div className="flex gap-[2px] mt-[1px]">
            {Array.from({ length: spaceState.towers }).map((_, i) => (
              <div
                key={i}
                className="w-[5px] h-[5px] rounded-full bg-emerald-400"
              />
            ))}
          </div>
        )}
        {spaceState?.hasFortress && (
          <div className="w-[7px] h-[7px] rounded-full bg-red-500 mt-[1px]" />
        )}
      </div>

      {/* Players on this space - dedicated bottom row */}
      {playersOnSpace.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-px px-px py-[1px] bg-black/30">
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
