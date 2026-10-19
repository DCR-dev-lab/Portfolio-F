import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSeoPlugin } from "./seo-routes.js";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSeoPlugin()],
  server: {
    host: true, // Listens on all local IPs (127.0.0.1 and ::1) to prevent Screaming Frog connection refused errors
    port: 5173,
    headers: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' http://localhost:* ws://localhost:* http://127.0.0.1:* ws://127.0.0.1:* https:;",
    },
    allowedHosts: ["resonant-helpful-gerbil.ngrok-free.dev"],
  },
});
