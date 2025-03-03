import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    server: {
      host: true,
      port: env.VITE_SERVER_PORT,
      strictPort: true,
      proxy: {
        "/api": {
          target: env.VITE_SERVER_TARGET,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      host: true,
      port: env.VITE_SERVER_PORT,
      strictPort: true,
      allowedHosts: [
        "kelvinsidhartasie.my.id",
        "*.kelvinsidhartasie.my.id",
        "frontend.kelvinsidhartasie.my.id",
      ],
    },
  };
});
