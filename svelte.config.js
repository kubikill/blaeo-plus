import { sveltePreprocess } from "svelte-preprocess";

// Shared by vite-plugin-svelte (build) and svelte-check / the Svelte VS Code extension
export default {
  preprocess: sveltePreprocess(),
};
