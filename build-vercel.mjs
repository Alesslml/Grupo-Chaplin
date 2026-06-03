import { execSync } from "child_process";
import { cpSync, mkdirSync, writeFileSync, rmSync } from "fs";

// Build the app
execSync("npx vite build", { stdio: "inherit" });

// Clean and create .vercel/output structure
rmSync(".vercel/output", { recursive: true, force: true });
mkdirSync(".vercel/output/static", { recursive: true });
mkdirSync(".vercel/output/functions/__server.func", { recursive: true });

// Copy static assets
cpSync("dist/client", ".vercel/output/static", { recursive: true });

// Copy server function
cpSync("dist/server", ".vercel/output/functions/__server.func", { recursive: true });

// Write Vercel output config
writeFileSync(".vercel/output/config.json", JSON.stringify({
  version: 3,
  routes: [
    { src: "/assets/(.*)", headers: { "cache-control": "public, max-age=31536000, immutable" }, continue: true },
    { handle: "filesystem" },
    { src: "/(.*)", dest: "/__server" }
  ]
}, null, 2));

console.log("✓ Vercel output structure created");
