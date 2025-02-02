import axios from "axios";
import { io } from "socket.io-client";

// API connection config
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Websocket connection config
const websocket = "http://localhost:6001";
const socket = io.connect(websocket);

// Export all as named exports
export { api, socket, websocket };
