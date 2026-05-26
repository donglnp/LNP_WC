import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Same name as the Vercel serverless function (api/fd/[...path].js) reads.
  // No VITE_ prefix → never inlined into the client bundle.
  const fdToken = env.FD_TOKEN || env.VITE_FD_TOKEN;

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Dev-only proxy for football-data.org (CORS-restricted).
        // Browser hits /api/fd/...  →  proxied to api.football-data.org/v4/...
        // Token is injected server-side so it never reaches the client.
        "/api/fd": {
          target: "https://api.football-data.org/v4",
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/fd/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              if (fdToken) proxyReq.setHeader("X-Auth-Token", fdToken);
            });
          },
        },
      },
    },
  };
});
