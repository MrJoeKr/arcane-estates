import { Client } from "colyseus.js";

const WS_URL = import.meta.env.VITE_SERVER_URL || "ws://localhost:3000";

export const colyseusClient = new Client(WS_URL);
