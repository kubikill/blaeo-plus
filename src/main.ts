import "@/app.scss";
import { addedComponents, options } from "@/globals";
import { addHeaderShortcuts, cleanupHeaderShortcuts } from "@/modules/header/shortcuts";
import { initMobileMessageIcon, cleanupMobileMessageIcon } from "@/modules/header/mobileMessageIcon";
import { cleanupOptionsMenu, initOptionsMenu } from "@/modules/options/menu";
import { initFilter } from "@/modules/games/filter";
import { cleanupHltbTimes, initHltbTimes } from "@/modules/games/hltbTimes";
import { addCommentPreview, cleanupCommentPreview } from "./modules/comments/commentPreview";
import { initSaveLoad } from "./modules/newPost/saveLoad";
import { hltbLastUpdate, syncHltb } from "./lib/hltbService";
import initMobilePostLayout from "./modules/posts/mobileLayout";
import initMobileCommentLayout from "./modules/comments/mobileLayout";
import { linuxLastUpdate, syncLinux, syncLinuxGames } from "./lib/linuxService";
import { cleanupProtonDb, initProtonDb } from "./modules/games/protonDb";
import { initDeckVerified } from "./modules/games/deckVerified";
import type { SvelteComponent } from "svelte";

function checkIfProgressPage(url: string): boolean {
  return url.includes("games/wont-play") || url.includes("games/never-played") || url.includes("games/unfinished") || url.includes("games/beaten") || url.includes("games/completed");
}

function cleanup(): void {
  addedComponents.forEach((component: SvelteComponent) => {
    component.$destroy();
  });

  cleanupMobileMessageIcon();
  cleanupHeaderShortcuts();
  cleanupOptionsMenu();
  cleanupCommentPreview();
  cleanupHltbTimes();
  cleanupProtonDb();
}

function init(): void {
  if (options.modules.games.hltbIntegration.enabled) {
    if (hltbLastUpdate.getTime() < Date.now() - 86400) {
      // if last sync was at least 1 day ago
      syncHltb();
    }
  }

  if (options.modules.games.protonDbIntegration.enabled || options.modules.games.deckVerifiedIntegration.enabled) {
    if (linuxLastUpdate.getTime() < Date.now() - 86400) {
      // if last sync was at least 1 day ago
      syncLinuxGames();
    }
  }
}
function initEachPage(): void {
  if (document.body.dataset.blaeoPlusInitialized === "true") {
    return;
  }

  document.body.dataset.blaeoPlusInitialized = "true";

  cleanup();

  const currentUrl = window.location.href;
  initOptionsMenu();

  if (options.modules.header.shortcuts) {
    addHeaderShortcuts();
  }

  if (options.modules.header.mobileMessageBadge) {
    initMobileMessageIcon();
  }

  if (options.modules.games.filters.progress || options.modules.games.filters.tags || (options.modules.games.filters.modes && options.modules.games.hltbIntegration.enabled)) {
    initFilter(checkIfProgressPage(currentUrl));
  }

  if (options.modules.games.hltbIntegration.enabled) {
    initHltbTimes();
  }

  if (options.modules.games.protonDbIntegration.enabled) {
    initProtonDb();
  }

  if (options.modules.games.deckVerifiedIntegration.enabled) {
    initDeckVerified();
  }

  if (options.modules.posts.mobileLayout) {
    initMobilePostLayout();
  }

  if (options.modules.comments.mobileLayout) {
    initMobileCommentLayout();
  }

  if (options.modules.newPosts.saving) {
    initSaveLoad();
  }

  if (options.modules.comments.previews) {
    addCommentPreview();
  }
}

init();
initEachPage();

document.addEventListener("turbolinks:visit", () => {
  document.body.dataset.blaeoPlusInitialized = "false";
});
document.addEventListener("turbolinks:load", initEachPage);

console.log("BLAEO+ successfully loaded");
