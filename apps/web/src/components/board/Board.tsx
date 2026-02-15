import type { Room } from "colyseus.js";
import type { GameStateSnapshot } from "../../hooks/use-colyseus";
import { BoardSpace } from "./BoardSpace";
import { PlayerToken } from "./PlayerToken";
import { DiceRoll } from "./DiceRoll";
import { PlayerPanel } from "../panels/PlayerPanel";
import { ActionPanel } from "../panels/ActionPanel";
import { GameLog } from "../panels/GameLog";
import { PropertyCard } from "../modals/PropertyCard";
import { TradeModal } from "../modals/TradeModal";
import { AuctionModal } from "../modals/AuctionModal";
import { CardReveal } from "../modals/CardReveal";
import { useGameStore } from "../../hooks/use-game-store";
import { BOARD_GRID_POSITIONS } from "@arcane-estates/shared";
import { BOARD_SPACES } from "./board-spaces-data";

interface BoardProps {
  room: Room;
  gameState: GameStateSnapshot;
  send: (type: string, data?: any) => void;
  logs: string[];
}

export function Board({ room, gameState, send, logs }: BoardProps) {
  const {
    showPropertyCard,
    showTradeModal,
    showAuctionModal,
    showCardReveal,
    setShowPropertyCard,
    setShowTradeModal,
    setShowAuctionModal,
    setShowCardReveal,
  } = useGameStore();

  const players = Array.from(gameState.players.values());
  const currentPlayer = gameState.players.get(room.sessionId);
  const isMyTurn = gameState.currentPlayerId === room.sessionId;

  return (
    <div className="min-h-screen bg-magical p-4">
      <div className="max-w-[1200px] mx-auto">
        {/* Board Grid */}
        <div
          className="grid gap-0 border-2 border-arcane-gold/40 rounded-lg overflow-hidden bg-arcane-deep/80"
          style={{
            gridTemplateColumns: "1.4fr repeat(9, 1fr) 1.4fr",
            gridTemplateRows: "1.4fr repeat(9, 1fr) 1.4fr",
            aspectRatio: "1",
          }}
        >
          {/* Render all 40 board spaces */}
          {BOARD_SPACES.map((space, index) => {
            const [row, col] = BOARD_GRID_POSITIONS[index];
            const spaceState = gameState.spaces[index];
            const playersOnSpace = players.filter(
              (p) => p.position === index && !p.bankrupt
            );

            return (
              <BoardSpace
                key={index}
                space={space}
                spaceState={spaceState}
                playersOnSpace={playersOnSpace}
                gridRow={row}
                gridCol={col}
                onClick={() => setShowPropertyCard(index)}
              />
            );
          })}

          {/* Center area */}
          <div
            className="flex flex-col items-center justify-center gap-3 p-4"
            style={{
              gridRow: "2 / 11",
              gridColumn: "2 / 11",
            }}
          >
            <h2 className="font-display text-2xl text-arcane-gold text-glow-gold">
              Arcane Estates
            </h2>

            <DiceRoll
              dice={gameState.dice}
              onRoll={() => send("roll_dice")}
              canRoll={isMyTurn && gameState.turnPhase === "roll"}
            />

            <ActionPanel
              room={room}
              gameState={gameState}
              isMyTurn={isMyTurn}
              send={send}
            />

            <div className="w-full max-w-sm">
              <PlayerPanel
                players={players}
                currentPlayerId={gameState.currentPlayerId}
                mySessionId={room.sessionId}
              />
            </div>

            <GameLog logs={logs} />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPropertyCard !== null && (
        <PropertyCard
          spaceIndex={showPropertyCard}
          gameState={gameState}
          onClose={() => setShowPropertyCard(null)}
        />
      )}
      {showTradeModal && (
        <TradeModal
          room={room}
          gameState={gameState}
          send={send}
          onClose={() => setShowTradeModal(false)}
        />
      )}
      {showAuctionModal && (
        <AuctionModal
          gameState={gameState}
          send={send}
          onClose={() => setShowAuctionModal(false)}
        />
      )}
      {showCardReveal && (
        <CardReveal
          card={showCardReveal}
          onClose={() => setShowCardReveal(null)}
        />
      )}
    </div>
  );
}
