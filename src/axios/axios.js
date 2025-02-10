import axios from "axios";
import { io } from "socket.io-client";

// API connection config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Websocket connection config
const websocket = import.meta.env.VITE_WEBSOCKET_URL;
const socket = io.connect(websocket);

export { api, socket, websocket };
