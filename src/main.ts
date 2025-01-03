import "@/app.scss";
import { optionsStore } from "./lib/store";
import { BP_VERSION, addedComponents, getUserName } from "@/globals";
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
import { linuxLastUpdate, syncLinux } from "./lib/linuxService";
import { cleanupProtonDb, initProtonDb } from "./modules/games/protonDb";
import { cleanupDeckVerified, initDeckVerified } from "./modules/games/deckVerified";
import type { SvelteComponent } from "svelte";
import initBlacklist, { cleanupBlacklist } from "./modules/users/blacklist";
import { get } from "svelte/store";
import initListQuickRearrange from "./modules/list/quickRearrange";
import initUpdateNotifier from "./modules/changelog/updateNotifier";
import { GM_setValue } from "vite-plugin-monkey/dist/client";
import initAutomaticList from "./modules/list/automaticHltbList";
import { addMissingGamesShortcut, cleanupMissingShortcuts } from "./modules/header/missingGamesShortcut";
import { addUncategorizedGamesShortcut, cleanupUncategorizedGamesShortcut } from "./modules/header/uncategorizedGamesShortcut";
import { cleanupOldListBackups } from "./lib/cleanupOldListBackups";
import { initBulkRemoveGames } from "./modules/games/bulkRemoveGames/bulkRemoveGames";
import { initFullWidthTable } from "./modules/games/fullWidthTable";
import { initSteamTags } from "./modules/games/steamTags";
import { steamspyLastUpdate, syncSteamspy } from "./lib/steamspyService";

let options = get(optionsStore) as Options;
optionsStore.subscribe((value) => {
  options = value;
});

function checkIfProgressPage(url: string): boolean {
  return url.includes("games/wont-play") || url.includes("games/never-played") || url.includes("games/unfinished") || url.includes("games/beaten") || url.includes("games/completed");
}

function cleanup(): void {
  addedComponents.forEach((component: SvelteComponent) => {
    component.$destroy();
  });

  cleanupMobileMessageIcon();
  cleanupHeaderShortcuts();
  cleanupMissingShortcuts();
  cleanupUncategorizedGamesShortcut();
  cleanupOptionsMenu();
  cleanupCommentPreview();
  cleanupHltbTimes();
  cleanupProtonDb();
  cleanupDeckVerified();
  cleanupBlacklist();
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
      syncLinux();
    }
  }

  if (steamspyLastUpdate.getTime() < Date.now() - 86400) {
    // if last sync was at least 1 day ago
    syncSteamspy();
  }

  getUserName();

  cleanupOldListBackups();
}
function initEachPage(): void {
  if (document.body.dataset.blaeoPlusInitialized === "true") {
    return;
  }

  document.body.dataset.blaeoPlusInitialized = "true";

  cleanup();

  const currentUrl = window.location.href;
  initOptionsMenu();

  if (options.modules.users.blacklist.enabled) {
    initBlacklist();
  }

  if (options.modules.header.shortcuts) {
    addHeaderShortcuts();
  }

  if (options.modules.header.uncategorizedGamesShortcut) {
    addUncategorizedGamesShortcut();
  }

  if (options.modules.header.missingGamesShortcut) {
    addMissingGamesShortcut();
  }

  if (options.modules.header.mobileMessageBadge) {
    initMobileMessageIcon();
  }

  if (options.modules.games.steamStoreIntegration.enabled) {
    initSteamTags();
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

  if (options.modules.games.filters.progress || options.modules.games.filters.tags || options.modules.games.filters.steamTags || (options.modules.games.filters.modes && options.modules.games.hltbIntegration.enabled)) {
    initFilter(checkIfProgressPage(currentUrl));
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

  if (options.modules.games.lists.quickRearrange) {
    initListQuickRearrange();
  }

  if (options.modules.games.lists.automaticHltb) {
    initAutomaticList();
  }

  if (options.modules.games.other.bulkRemoveMissingGames) {
    initBulkRemoveGames();
  }

  if (options.modules.games.other.fullWidthTable) {
    initFullWidthTable();
  }

  if (options.modules.misc.updateNotifier) {
    initUpdateNotifier();
  } else {
    GM_setValue("bp-last-version", BP_VERSION);
  }
}

init();
initEachPage();

document.addEventListener("turbolinks:visit", () => {
  document.body.dataset.blaeoPlusInitialized = "false";
});
document.addEventListener("turbolinks:load", initEachPage);

console.log("BLAEO+ successfully loaded");
