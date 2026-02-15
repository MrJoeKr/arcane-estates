import { Room, type Client } from "colyseus";
import { GameState, Player, Space } from "../state/GameState.js";
import { BOARD_SPACES } from "../data/board-data.js";
import {
  STARTING_MONEY,
  GO_SALARY,
  PLAYER_TOKENS,
  MAX_PLAYERS,
  MIN_PLAYERS,
} from "@arcane-estates/shared";
import {
  canBuyProperty,
  buyProperty,
  calculateRent,
  payRent,
  canBuildTower,
  buildTower,
  sellTower,
  mortgageProperty,
  unmortgageProperty,
} from "../logic/property-logic.js";
import { drawCard, applyCardEffect } from "../logic/card-logic.js";
import { startAuction, placeBid, handleAuctionPass, endAuction } from "../logic/auction-logic.js";
import { proposeTrade, acceptTrade, rejectTrade } from "../logic/trade-logic.js";
import { sendToJail, payJailFine, useEscapeCard, handleJailTurn } from "../logic/jail-logic.js";
import { getNextPlayerId, advanceTurn } from "../logic/turn-manager.js";

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export class GameRoom extends Room<GameState> {
  private turnOrder: string[] = [];
  private auctionTimer: ReturnType<typeof setInterval> | null = null;
  private auctionPassedPlayers: Set<string> = new Set();

  onCreate(options: any) {
    this.setState(new GameState());
    const roomCode = generateRoomCode();
    this.state.roomCode = roomCode;
    this.state.phase = "lobby";
    this.maxClients = MAX_PLAYERS;

    // Expose roomCode in metadata so clients can find this room by code
    this.setMetadata({ roomCode });

    // Initialize all 40 spaces
    for (let i = 0; i < 40; i++) {
      const space = new Space();
      space.index = i;
      this.state.spaces.push(space);
    }

    this.registerMessageHandlers();
  }

  onJoin(client: Client, options: any) {
    const player = new Player();
    player.id = client.sessionId;
    player.name = options?.name || `Wizard ${this.state.players.size + 1}`;
    player.crowns = STARTING_MONEY;
    player.connected = true;

    // Auto-assign first available token
    const takenTokens = new Set<string>();
    this.state.players.forEach((p) => takenTokens.add(p.token));
    const availableToken = PLAYER_TOKENS.find((t) => !takenTokens.has(t));
    player.token = availableToken || "wizard-hat";

    this.state.players.set(client.sessionId, player);

    // First player is host
    if (this.state.players.size === 1) {
      this.state.hostId = client.sessionId;
    }

    this.broadcastLog(`${player.name} has joined the game.`);
  }

  onLeave(client: Client, consented: boolean) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    if (this.state.phase === "lobby") {
      this.state.players.delete(client.sessionId);
      // Reassign host
      if (this.state.hostId === client.sessionId && this.state.players.size > 0) {
        const firstKey = Array.from(this.state.players.keys())[0];
        this.state.hostId = firstKey;
      }
    } else {
      player.connected = false;
      this.broadcastLog(`${player.name} has disconnected.`);

      // If it's their turn, auto-end it
      if (this.state.currentPlayerId === client.sessionId) {
        advanceTurn(this.state);
      }
    }
  }

  onDispose() {
    if (this.auctionTimer) {
      clearInterval(this.auctionTimer);
    }
  }

  private registerMessageHandlers() {
    // Token selection (lobby)
    this.onMessage("select_token", (client, data: { token: string }) => {
      if (this.state.phase !== "lobby") return;
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      // Check if token is already taken by another player
      let taken = false;
      this.state.players.forEach((p) => {
        if (p.id !== client.sessionId && p.token === data.token) {
          taken = true;
        }
      });
      if (!taken) {
        player.token = data.token;
      }
    });

    // Start game (host only)
    this.onMessage("start_game", (client) => {
      if (this.state.phase !== "lobby") return;
      if (client.sessionId !== this.state.hostId) return;
      if (this.state.players.size < MIN_PLAYERS) return;

      this.startGame();
    });

    // Roll dice
    this.onMessage("roll_dice", (client) => {
      if (this.state.phase !== "playing") return;
      if (client.sessionId !== this.state.currentPlayerId) return;
      if (this.state.turnPhase !== "roll") return;

      this.handleRollDice(client.sessionId);
    });

    // Buy property
    this.onMessage("buy_property", (client) => {
      if (client.sessionId !== this.state.currentPlayerId) return;
      if (this.state.turnPhase !== "postRoll") return;

      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      if (canBuyProperty(this.state, client.sessionId, player.position)) {
        buyProperty(this.state, client.sessionId, player.position);
        const spaceName = BOARD_SPACES[player.position]?.name || "property";
        this.broadcastLog(`${player.name} bought ${spaceName}!`);
        this.state.turnPhase = "action";
      }
    });

    // Decline property (triggers auction)
    this.onMessage("decline_property", (client) => {
      if (client.sessionId !== this.state.currentPlayerId) return;
      if (this.state.turnPhase !== "postRoll") return;

      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      this.broadcastLog(`${player.name} declined the property. Auction begins!`);
      this.startAuctionForSpace(player.position);
    });

    // Build tower
    this.onMessage("build_tower", (client, data: { spaceIndex: number }) => {
      if (client.sessionId !== this.state.currentPlayerId) return;
      if (this.state.turnPhase !== "action" && this.state.turnPhase !== "postRoll") return;

      if (canBuildTower(this.state, client.sessionId, data.spaceIndex)) {
        buildTower(this.state, client.sessionId, data.spaceIndex);
        const spaceName = BOARD_SPACES[data.spaceIndex]?.name || "property";
        const player = this.state.players.get(client.sessionId);
        this.broadcastLog(`${player?.name} built a tower on ${spaceName}.`);
      }
    });

    // Sell tower
    this.onMessage("sell_tower", (client, data: { spaceIndex: number }) => {
      if (client.sessionId !== this.state.currentPlayerId) return;
      sellTower(this.state, client.sessionId, data.spaceIndex);
    });

    // Mortgage
    this.onMessage("mortgage", (client, data: { spaceIndex: number }) => {
      if (client.sessionId !== this.state.currentPlayerId) return;
      mortgageProperty(this.state, client.sessionId, data.spaceIndex);
    });

    // Unmortgage
    this.onMessage("unmortgage", (client, data: { spaceIndex: number }) => {
      if (client.sessionId !== this.state.currentPlayerId) return;
      unmortgageProperty(this.state, client.sessionId, data.spaceIndex);
    });

    // Trade
    this.onMessage("propose_trade", (client, data: any) => {
      if (client.sessionId !== this.state.currentPlayerId) return;
      const success = proposeTrade(this.state, client.sessionId, data);
      if (success) {
        const player = this.state.players.get(client.sessionId);
        const target = this.state.players.get(data.toId);
        this.broadcastLog(`${player?.name} proposed a trade to ${target?.name}.`);
      }
    });

    this.onMessage("accept_trade", (client) => {
      if (!this.state.trade || this.state.trade.toId !== client.sessionId) return;
      acceptTrade(this.state);
      this.broadcastLog("Trade accepted!");
    });

    this.onMessage("reject_trade", (client) => {
      if (!this.state.trade || this.state.trade.toId !== client.sessionId) return;
      rejectTrade(this.state);
      this.broadcastLog("Trade rejected.");
    });

    // Auction
    this.onMessage("auction_bid", (client, data: { amount: number }) => {
      if (!this.state.auction.active) return;
      const player = this.state.players.get(client.sessionId);
      if (!player || player.bankrupt) return;

      if (placeBid(this.state, client.sessionId, data.amount)) {
        this.auctionPassedPlayers.clear(); // Reset passes on new bid
        this.broadcastLog(`${player.name} bids ♛${data.amount}!`);
      }
    });

    this.onMessage("auction_pass", (client) => {
      if (!this.state.auction.active) return;
      const player = this.state.players.get(client.sessionId);
      if (!player || player.bankrupt) return;

      this.auctionPassedPlayers.add(client.sessionId);
      this.broadcastLog(`${player.name} passes.`);

      // Check if all active players have passed
      const activePlayers = Array.from(this.state.players.values()).filter(
        (p) => !p.bankrupt && p.connected
      );
      if (this.auctionPassedPlayers.size >= activePlayers.length) {
        this.endCurrentAuction();
      }
    });

    // Jail
    this.onMessage("pay_jail_fine", (client) => {
      if (client.sessionId !== this.state.currentPlayerId) return;
      if (payJailFine(this.state, client.sessionId)) {
        const player = this.state.players.get(client.sessionId);
        this.broadcastLog(`${player?.name} paid ♛50 to escape the Dungeon.`);
        this.state.turnPhase = "roll";
      }
    });

    this.onMessage("use_escape_card", (client) => {
      if (client.sessionId !== this.state.currentPlayerId) return;
      if (useEscapeCard(this.state, client.sessionId)) {
        const player = this.state.players.get(client.sessionId);
        this.broadcastLog(`${player?.name} used an Escape Scroll!`);
        this.state.turnPhase = "roll";
      }
    });

    // End turn
    this.onMessage("end_turn", (client) => {
      if (client.sessionId !== this.state.currentPlayerId) return;
      if (this.state.turnPhase !== "action" && this.state.turnPhase !== "endTurn") return;

      this.checkBankruptcy();
      advanceTurn(this.state);
      this.broadcastCurrentTurn();
    });
  }

  private startGame() {
    this.state.phase = "playing";

    // Set random turn order
    this.turnOrder = Array.from(this.state.players.keys());
    for (let i = this.turnOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.turnOrder[i], this.turnOrder[j]] = [this.turnOrder[j], this.turnOrder[i]];
    }

    this.state.currentPlayerId = this.turnOrder[0];
    this.state.turnPhase = "roll";
    this.lock();

    this.broadcastLog("The game has begun! May the best wizard win!");
    this.broadcastCurrentTurn();
  }

  private handleRollDice(playerId: string) {
    const player = this.state.players.get(playerId);
    if (!player) return;

    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const total = die1 + die2;
    const isDoubles = die1 === die2;

    this.state.dice[0] = die1;
    this.state.dice[1] = die2;

    this.broadcastLog(`${player.name} rolled ${die1} + ${die2} = ${total}${isDoubles ? " (DOUBLES!)" : ""}`);

    // Handle jail
    if (player.inJail) {
      const dice: [number, number] = [die1, die2];
      if (handleJailTurn(this.state, playerId, dice)) {
        this.broadcastLog(`${player.name} escaped the Dungeon!`);
        this.movePlayer(playerId, total);
      } else {
        this.state.turnPhase = "endTurn";
      }
      return;
    }

    // Check for triple doubles
    if (isDoubles) {
      this.state.doublesCount++;
      if (this.state.doublesCount >= 3) {
        this.broadcastLog(`${player.name} rolled 3 doubles! Go to the Dungeon!`);
        sendToJail(this.state, playerId);
        this.state.turnPhase = "endTurn";
        this.state.doublesCount = 0;
        return;
      }
    } else {
      this.state.doublesCount = 0;
    }

    this.movePlayer(playerId, total);
  }

  private movePlayer(playerId: string, spaces: number) {
    const player = this.state.players.get(playerId);
    if (!player) return;

    const oldPosition = player.position;
    const newPosition = (oldPosition + spaces) % 40;

    // Check if passed GO
    if (newPosition < oldPosition && newPosition !== 0) {
      player.crowns += GO_SALARY;
      this.broadcastLog(`${player.name} passed the Grand Portal and collected ♛${GO_SALARY}!`);
    }

    player.position = newPosition;
    this.handleLanding(playerId);
  }

  private handleLanding(playerId: string) {
    const player = this.state.players.get(playerId);
    if (!player) return;

    const spaceDef = BOARD_SPACES[player.position];
    if (!spaceDef) return;

    switch (spaceDef.type) {
      case "go":
        // Landing on GO gives extra 200
        player.crowns += GO_SALARY;
        this.broadcastLog(`${player.name} landed on the Grand Portal! Collect ♛${GO_SALARY}!`);
        this.state.turnPhase = "action";
        break;

      case "property":
      case "portal":
      case "mana-well": {
        const space = this.state.spaces[player.position];
        if (!space.ownerId) {
          // Unowned — offer to buy
          this.state.turnPhase = "postRoll";
        } else if (space.ownerId !== playerId && !space.isMortgaged) {
          // Pay rent
          const diceTotal = (this.state.dice[0] || 0) + (this.state.dice[1] || 0);
          const rent = calculateRent(this.state, player.position, diceTotal);
          if (rent > 0) {
            payRent(this.state, playerId, space.ownerId, rent);
            const owner = this.state.players.get(space.ownerId);
            this.broadcastLog(`${player.name} pays ♛${rent} rent to ${owner?.name}.`);
          }
          this.state.turnPhase = "action";
        } else {
          this.state.turnPhase = "action";
        }
        break;
      }

      case "tax": {
        const taxAmount = spaceDef.cost || 0;
        player.crowns -= taxAmount;
        this.broadcastLog(`${player.name} pays ♛${taxAmount} ${spaceDef.name}.`);
        if (player.crowns < 0) player.crowns = 0;
        this.state.turnPhase = "action";
        break;
      }

      case "fate-card":
      case "guild-card": {
        const cardType = spaceDef.type === "fate-card" ? "fate" : "guild";
        const card = drawCard(this.state, playerId, cardType);
        this.broadcastLog(`${player.name} drew a ${cardType === "fate" ? "Fate" : "Guild"} Card: "${card.text}"`);
        // Broadcast card to clients for the reveal animation
        this.broadcast("card_drawn", { card });
        this.state.turnPhase = "action";
        break;
      }

      case "go-to-jail":
        this.broadcastLog(`${player.name} has been Banished to the Dungeon!`);
        sendToJail(this.state, playerId);
        this.state.turnPhase = "endTurn";
        break;

      case "jail":
        // Just visiting
        this.broadcastLog(`${player.name} is just visiting the Dungeon.`);
        this.state.turnPhase = "action";
        break;

      case "free-parking":
        this.broadcastLog(`${player.name} rests in the Enchanted Garden.`);
        this.state.turnPhase = "action";
        break;

      default:
        this.state.turnPhase = "action";
        break;
    }

    // If doubles were rolled and we're not in jail, allow rolling again
    if (
      this.state.doublesCount > 0 &&
      !player.inJail &&
      this.state.turnPhase === "action"
    ) {
      this.state.turnPhase = "roll";
      this.broadcastLog(`${player.name} rolled doubles and gets to roll again!`);
    }
  }

  private startAuctionForSpace(spaceIndex: number) {
    startAuction(this.state, spaceIndex);
    this.auctionPassedPlayers.clear();

    // Start auction timer
    this.auctionTimer = setInterval(() => {
      if (this.state.auction.active) {
        this.state.auction.timeRemaining--;
        if (this.state.auction.timeRemaining <= 0) {
          this.endCurrentAuction();
        }
      }
    }, 1000);
  }

  private endCurrentAuction() {
    if (this.auctionTimer) {
      clearInterval(this.auctionTimer);
      this.auctionTimer = null;
    }

    if (this.state.auction.currentBidderId) {
      const winner = this.state.players.get(this.state.auction.currentBidderId);
      const spaceName = BOARD_SPACES[this.state.auction.spaceIndex]?.name || "property";
      this.broadcastLog(
        `${winner?.name} wins the auction for ${spaceName} at ♛${this.state.auction.currentBid}!`
      );
    } else {
      this.broadcastLog("No one bid. The property remains unowned.");
    }

    endAuction(this.state);
    this.state.turnPhase = "action";
  }

  private checkBankruptcy() {
    let activePlayers = 0;
    let lastActiveId = "";

    this.state.players.forEach((player) => {
      if (!player.bankrupt) {
        activePlayers++;
        lastActiveId = player.id;
      }
    });

    if (activePlayers <= 1 && lastActiveId) {
      this.state.phase = "finished";
      this.state.winnerId = lastActiveId;
      const winner = this.state.players.get(lastActiveId);
      this.broadcastLog(`🎉 ${winner?.name} wins the game! All hail the Arcane Estate master!`);
    }
  }

  private broadcastCurrentTurn() {
    const player = this.state.players.get(this.state.currentPlayerId);
    if (player) {
      this.broadcastLog(`It's ${player.name}'s turn.`);
    }
  }

  private broadcastLog(message: string) {
    this.broadcast("game_log", { message });
  }
}
