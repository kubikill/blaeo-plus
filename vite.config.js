import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import monkey from "vite-plugin-monkey";
import preprocess from "svelte-preprocess";
import path from "path";
import packageJson from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    extensions: [".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json", ".svelte"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  plugins: [
    svelte({
      preprocess: preprocess(),
    }),
    monkey({
      build: {
        metaFileName: true,
      },
      entry: "src/main.ts",
      userscript: {
        name: "BLAEO+",
        version: packageJson.version,
        namespace: "blaeo-plus",
        match: [
          "https://www.backlog-assassins.net/",
          "https://www.backlog-assassins.net/*",
          "https://backlog-assassins.net/",
          "https://backlog-assassins.net/*",
        ],
        connect: ["blaeoplus.kubikill.tk", "backlog-assassins.net"],
        sandbox: "DOM",
        "inject-into": "content",
        "run-at": "document-end",
        icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 256 256"><defs><linearGradient id="a"><stop offset="0" stop-color="%236b7aab"></stop><stop offset=".42" stop-color="%236673a1"></stop><stop offset=".54" stop-color="%235d6c98"></stop><stop offset=".75" stop-color="%234b5983"></stop><stop offset="1" stop-color="%233b476a"></stop></linearGradient><linearGradient xlink:href="%23a" id="b" x1="195.4" x2="138.23" y1="48.65" y2="205.18" gradientUnits="userSpaceOnUse"></linearGradient></defs><path fill="url(%23b)" d="M30.4 195.93c2.45 2.44 2.98 9.4 8 9 6.24-2.46 6.87-12.54 11.07-17.92 3.01-6.6 7.41-12.71 9.18-19.82 7.66-3.26 13.85 6.02 22.73 3.75 14.82 3.7 16.88 22.27 24.01 33.99h13c-2.19-11.13-9.84-20.6-14-31 16.17.59 34.57-.3 45-12-7.3-.6-15.54-1.11-21-5-4.9-1.1-13.95-3.23-16.54-9.22-8.61-2.89-12-17.37-9.46-26.78 3.72 3.05 8.73 6.56 12 11 0 .07-4.73.2-4.73.2-1.26 3.4.06 6.88.06 6.88l7.45.14c4.32 3.1 9.33 5.1 13.22.78 1.42 3.88-1.66 11.12 5 12v-9c2.94-.76 4.11 1.86 5 4l41.61.2v40.92h10v-41.12c28.99-.32 37.33-1.64 51.5-8.8 0 0-72.06-.2-108.1-.2l-.02-2.81 108.01-.08c-14.2-7.88-23.97-8.84-51.39-9.11V85h-10v40.92h-41.6c-.07 2.4-2.68 4.87-5 5v-12c-6.23-.74-4.73 11.27-4.73 11.27-5.8 1.66-12-6.36-16.53-12.01-8.56-5.81-13.36-16.8-8.08-26.58-2.2-36.46.11-25.14.33-37.67-9.12-3.38-22.16-10.22-29.25 1.75-8.02 6.1-13.15 19.1-3.75 26.25-11.7 5.92-20.67 19.1-30.75 28.25-9.67 9.9-21.04 19.4-29.25 29.75 11.77 4.7 22.75 13.38 33.67 20.33-2.13 12.6-10.82 24.38-16.67 35.67z"></path></svg>',
        author: packageJson.author.name,
        homepage: packageJson.homepage,
        website: packageJson.homepage,
        source: packageJson.homepage,
        updateURL: "https://github.com/kubikill/blaeo-plus/releases/latest/download/blaeo-plus.meta.js",
        downloadURL: "https://github.com/kubikill/blaeo-plus/releases/latest/download/blaeo-plus.user.js",
        supportURL: packageJson.bugs.url,
      },
    }),
  ],
  build: {
    target: "es2015",
  },
  define: {
    APP_VERSION: JSON.stringify(packageJson.version),
  },
});
