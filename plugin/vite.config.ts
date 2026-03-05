import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import { resolve } from "path";

// Figma plugin sandbox requires classic scripts — remove type="module" and crossorigin.
// vite-plugin-singlefile uses writeBundle to write output, so we must patch in closeBundle.
function removeModuleType(): Plugin {
  return {
    name: "remove-module-type",
    enforce: "post",
    closeBundle() {
      const fs = require("fs");
      const outFile = resolve(__dirname, "dist/ui.html");
      if (!fs.existsSync(outFile)) return;
      let html = fs.readFileSync(outFile, "utf-8");
      html = html.replace(/ type="module"/g, "").replace(/ crossorigin/g, "");
      fs.writeFileSync(outFile, html);
    },
  };
}

export default defineConfig({
  root: resolve(__dirname, "src"),
  plugins: [react(), viteSingleFile(), removeModuleType()],
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: false,
    modulePreload: { polyfill: false },
    rollupOptions: {
      input: resolve(__dirname, "src/ui.html"),
    },
  },
});
