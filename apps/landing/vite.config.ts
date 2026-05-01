import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    rollupOptions: {
      input: {
        main:      path.resolve(__dirname, "index.html"),
        about:     path.resolve(__dirname, "about.html"),
        blog:      path.resolve(__dirname, "blog.html"),
        contact:   path.resolve(__dirname, "contact.html"),
        events:    path.resolve(__dirname, "events.html"),
        voltsquad: path.resolve(__dirname, "voltsquad.html"),
      },
    },
  },
});
