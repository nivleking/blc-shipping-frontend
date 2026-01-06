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
  withXSRFToken: true,  
});

// Get CSRF cookie from Laravel Sanctum
export const getCsrfToken = async () => {
  await axios.get('http://blc.petra.ac.id/sanctum/csrf-cookie', {
    withCredentials: true,
  });
};
// Websocket connection config
const websocket = import.meta.env.VITE_WEBSOCKET_URL;
let socket = null;
const getSocket = () => {
  if (!socket) {
    socket = io(websocket, {
      autoConnect: false,
      withCredentials: true,
      transports: ["websocket"],
      upgrade: false,
      reconnectionAttempts: 5,
      timeout: 10000,
    });
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      socket.disconnect();
    });
    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });
  }
  return socket;
};
export { api, getSocket, websocket };