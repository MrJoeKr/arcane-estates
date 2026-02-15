import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") id: string = "";
  @type("string") name: string = "";
  @type("string") token: string = "";
  @type("int32") position: number = 0;
  @type("int32") crowns: number = 1500;
  @type(["int32"]) properties = new ArraySchema<number>();
  @type("boolean") inJail: boolean = false;
  @type("int32") jailTurns: number = 0;
  @type("boolean") hasEscapeCard: boolean = false;
  @type("boolean") bankrupt: boolean = false;
  @type("boolean") connected: boolean = true;
}

export class Space extends Schema {
  @type("int32") index: number = 0;
  @type("string") ownerId: string = "";
  @type("int32") towers: number = 0;
  @type("boolean") hasFortress: boolean = false;
  @type("boolean") isMortgaged: boolean = false;
}

export class TradeOffer extends Schema {
  @type("string") fromId: string = "";
  @type("string") toId: string = "";
  @type(["int32"]) offerProperties = new ArraySchema<number>();
  @type("int32") offerCrowns: number = 0;
  @type(["int32"]) requestProperties = new ArraySchema<number>();
  @type("int32") requestCrowns: number = 0;
}

export class AuctionState extends Schema {
  @type("boolean") active: boolean = false;
  @type("int32") spaceIndex: number = 0;
  @type("int32") currentBid: number = 0;
  @type("string") currentBidderId: string = "";
  @type("int32") timeRemaining: number = 0;
}

export class GameState extends Schema {
  @type("string") phase: string = "lobby";
  @type({ map: Player }) players = new MapSchema<Player>();
  @type([Space]) spaces = new ArraySchema<Space>();
  @type("string") currentPlayerId: string = "";
  @type("string") turnPhase: string = "roll";
  @type(["int32"]) dice = new ArraySchema<number>(0, 0);
  @type("int32") doublesCount: number = 0;
  @type(AuctionState) auction: AuctionState = new AuctionState();
  @type(TradeOffer) trade: TradeOffer | null = null;
  @type("string") winnerId: string = "";
  @type("string") hostId: string = "";
  @type("string") roomCode: string = "";
}
