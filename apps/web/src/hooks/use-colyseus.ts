import { useState, useCallback, useRef, useEffect } from "react";
import type { Room } from "colyseus.js";
import { colyseusClient } from "../lib/colyseus-client";

export interface GameStateSnapshot {
  phase: string;
  players: Map<string, PlayerSnapshot>;
  currentPlayerId: string;
  turnPhase: string;
  dice: [number, number];
  roomCode: string;
  hostId: string;
  winnerId: string | null;
  spaces: SpaceSnapshot[];
  auction: AuctionSnapshot;
  trade: TradeSnapshot | null;
}

export interface PlayerSnapshot {
  id: string;
  name: string;
  token: string;
  position: number;
  crowns: number;
  properties: number[];
  inJail: boolean;
  jailTurns: number;
  hasEscapeCard: boolean;
  bankrupt: boolean;
  connected: boolean;
}

export interface SpaceSnapshot {
  index: number;
  ownerId: string | null;
  towers: number;
  hasFortress: boolean;
  isMortgaged: boolean;
}

export interface AuctionSnapshot {
  active: boolean;
  spaceIndex: number;
  currentBid: number;
  currentBidderId: string;
  timeRemaining: number;
}

export interface TradeSnapshot {
  fromId: string;
  toId: string;
  offerProperties: number[];
  offerCrowns: number;
  requestProperties: number[];
  requestCrowns: number;
}

function stateToSnapshot(state: any): GameStateSnapshot {
  const players = new Map<string, PlayerSnapshot>();
  if (state.players) {
    state.players.forEach((player: any, key: string) => {
      players.set(key, {
        id: player.id,
        name: player.name,
        token: player.token,
        position: player.position,
        crowns: player.crowns,
        properties: player.properties ? Array.from(player.properties) : [],
        inJail: player.inJail,
        jailTurns: player.jailTurns,
        hasEscapeCard: player.hasEscapeCard,
        bankrupt: player.bankrupt,
        connected: player.connected,
      });
    });
  }

  const spaces: SpaceSnapshot[] = [];
  if (state.spaces) {
    state.spaces.forEach((space: any) => {
      spaces.push({
        index: space.index,
        ownerId: space.ownerId,
        towers: space.towers,
        hasFortress: space.hasFortress,
        isMortgaged: space.isMortgaged,
      });
    });
  }

  return {
    phase: state.phase,
    players,
    currentPlayerId: state.currentPlayerId,
    turnPhase: state.turnPhase,
    dice: [state.dice?.[0] ?? 0, state.dice?.[1] ?? 0],
    roomCode: state.roomCode,
    hostId: state.hostId,
    winnerId: state.winnerId,
    spaces,
    auction: {
      active: state.auction?.active ?? false,
      spaceIndex: state.auction?.spaceIndex ?? 0,
      currentBid: state.auction?.currentBid ?? 0,
      currentBidderId: state.auction?.currentBidderId ?? "",
      timeRemaining: state.auction?.timeRemaining ?? 0,
    },
    trade: state.trade
      ? {
          fromId: state.trade.fromId,
          toId: state.trade.toId,
          offerProperties: Array.from(state.trade.offerProperties || []),
          offerCrowns: state.trade.offerCrowns,
          requestProperties: Array.from(state.trade.requestProperties || []),
          requestCrowns: state.trade.requestCrowns,
        }
      : null,
  };
}

export function useColyseus() {
  const [room, setRoom] = useState<Room | null>(null);
  const [gameState, setGameState] = useState<GameStateSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const roomRef = useRef<Room | null>(null);

  const connect = useCallback(
    async (playerName: string, roomId?: string): Promise<boolean> => {
      try {
        setError(null);
        let joinedRoom: Room;

        if (roomId) {
          joinedRoom = await colyseusClient.joinById(roomId, {
            name: playerName,
          });
        } else {
          joinedRoom = await colyseusClient.create("game", {
            name: playerName,
          });
        }

        roomRef.current = joinedRoom;
        setRoom(joinedRoom);
        setSessionId(joinedRoom.sessionId);

        // Listen for state changes
        joinedRoom.onStateChange((state) => {
          setGameState(stateToSnapshot(state));
        });

        // Listen for log messages
        joinedRoom.onMessage("game_log", (message: { message: string }) => {
          setLogs((prev) => [...prev, message.message]);
        });

        joinedRoom.onMessage("error", (message: { message: string }) => {
          setError(message.message);
        });

        joinedRoom.onLeave((code) => {
          if (code > 1000) {
            setError("Disconnected from server");
          }
        });

        return true;
      } catch (err: any) {
        setError(err.message || "Failed to connect");
        return false;
      }
    },
    []
  );

  const send = useCallback(
    (type: string, data?: any) => {
      if (roomRef.current) {
        roomRef.current.send(type, data);
      }
    },
    []
  );

  const disconnect = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.leave();
      roomRef.current = null;
      setRoom(null);
      setGameState(null);
      setSessionId(null);
    }
  }, []);

  useEffect(() => {
    return () => {
      roomRef.current?.leave();
    };
  }, []);

  return {
    room,
    gameState,
    error,
    sessionId,
    logs,
    connect,
    send,
    disconnect,
  };
}
