import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { GameRoom } from "./rooms/GameRoom.js";

const port = Number(process.env.PORT) || 3000;

const server = new Server({
  transport: new WebSocketTransport({}),
});

server.define("game", GameRoom);

server.listen(port).then(() => {
  console.log(`⚡ Arcane Estates server listening on port ${port}`);
});
