import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, "src/ui.html"),
      output: {
        entryFileNames: "ui.js",
        inlineDynamicImports: true,
      },
    },
  },
});
