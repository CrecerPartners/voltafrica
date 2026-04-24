import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
    // Custom middleware for dev server rewrites
    fs: {
      allow: [".."],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        app: path.resolve(__dirname, "app.html"),
        about: path.resolve(__dirname, "about.html"),
        blog: path.resolve(__dirname, "blog.html"),
        contact: path.resolve(__dirname, "contact.html"),
        events: path.resolve(__dirname, "events.html"),
      },
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    {
      name: "rewrite-middleware",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || "";
          if (
            url.startsWith("/dashboard") ||
            url.startsWith("/login") ||
            url.startsWith("/join-now") ||
            url.startsWith("/admin") ||
            url.startsWith("/onboarding")
          ) {
            req.url = "/app.html";
          } else if (url === "/about") {
            req.url = "/about.html";
          } else if (url === "/blog") {
            req.url = "/blog.html";
          } else if (url === "/contact") {
            req.url = "/contact.html";
          } else if (url === "/events") {
            req.url = "/events.html";
          }
          next();
        });
      },
    },
  ].filter(Boolean),
}));
