import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/clamotag3ddemo/" : "/",
  plugins: [react(), tailwindcss()],
  server: {
    // Allow the sandboxed preview host (and any other host) in dev.
    allowedHosts: true,
  },
});
