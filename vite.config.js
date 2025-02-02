import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  preview: {
    host: "0.0.0.0", // Changed from true to "0.0.0.0"
    port: 5173,
  },
  server: {
    host: "0.0.0.0", // Added this line
    proxy: {
      "/api": {
        target: "http://147.93.108.193host:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
