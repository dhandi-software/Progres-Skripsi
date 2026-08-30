import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://localhost:5002",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    sourcemap: false, // Disable sourcemap to suppress sourcemap warnings
    cssCodeSplit: true,
    minify: 'esbuild',
    target: 'es2020',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress "Module level directives cause errors when bundled" warnings
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        // Suppress unused import warnings (they're caught by tree-shaking anyway)
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
        // Suppress sourcemap warnings
        if (warning.message.includes('sourcemap')) return;
        warn(warning);
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) return 'vendor-charts';
            if (id.includes('jspdf') || id.includes('html2canvas')) return 'vendor-pdf';
            if (id.includes('pdfjs-dist') || id.includes('react-pdf')) return 'vendor-pdfviewer';
          }
        }
      }
    },
  },
  ssr: {
    noExternal: ["react-pdf-highlighter", "pdfjs-dist"],
  },
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
});
