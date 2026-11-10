import "@/app.scss";
import { cacheUpdates, lastChangelogVersion, lastVersion, options } from "./lib/store.svelte";
import { BP_VERSION, getUserName, unmountAll } from "@/globals";
import { addHeaderShortcuts, cleanupHeaderShortcuts } from "@/modules/header/shortcuts";
import { initMobileMessageIcon, cleanupMobileMessageIcon } from "@/modules/header/mobileMessageIcon";
import { cleanupOptionsMenu, initOptionsMenu } from "@/modules/options/menu";
import { cleanupFilter, initFilter } from "@/modules/games/filter";
import { cleanupHltbTimes, initHltbTimes } from "@/modules/games/hltbTimes";
import { addCommentPreview, cleanupCommentPreview } from "./modules/comments/commentPreview";
import { initSaveLoad } from "./modules/newPost/saveLoad";
import { syncExcludedGames } from "./lib/hltbService";
import initMobilePostLayout from "./modules/posts/mobileLayout";
import initMobileCommentLayout from "./modules/comments/mobileLayout";
import { cleanupProtonDb, initProtonDb } from "./modules/games/protonDb";
import { COMPATIBILITY_DEVICES, createCompatibilityColumn } from "./modules/games/compatibilityColumns";
import { cleanupSteamHuntersTimes, initSteamHuntersTimes } from "./modules/games/steamHuntersTimes";
import initBlacklist, { cleanupBlacklist } from "./modules/users/blacklist";
import initListQuickRearrange from "./modules/list/quickRearrange";
import { cleanupRearrangeButtons, initRearrangeButtons } from "./modules/list/rearrangeButtons";
import initUpdateNotifier from "./modules/changelog/updateNotifier";
import initAutomaticList from "./modules/list/automaticHltbList";
import { addMissingGamesShortcut, cleanupMissingShortcuts } from "./modules/header/missingGamesShortcut";
import { addUncategorizedGamesShortcut, cleanupUncategorizedGamesShortcut } from "./modules/header/uncategorizedGamesShortcut";
import { cleanupOldListBackups } from "./lib/cleanupOldListBackups";
import { removeLegacyGameData } from "./upgrades/removeLegacyGameData";
import { migrateListMakerPresets } from "./upgrades/migrateListMakerPresets";
import { initBulkRemoveGames } from "./modules/games/bulkRemoveGames/bulkRemoveGames";
import { initFullWidthTable } from "./modules/games/fullWidthTable";
import { cleanupSteamTags, initSteamTags } from "./modules/games/steamTags";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function runModule(name: string, fn: () => unknown): void {
  try {
    const result = fn();

    if (result instanceof Promise) {
      result.catch((error) => console.error(`BLAEO+: module "${name}" failed`, error));
    }
  } catch (error) {
    console.error(`BLAEO+: module "${name}" failed`, error);
  }
}

function checkIfProgressPage(url: string): boolean {
  return url.includes("games/wont-play") || url.includes("games/never-played") || url.includes("games/unfinished") || url.includes("games/beaten") || url.includes("games/completed");
}

function initUpdateNotice() {
  if (options.modules.misc.updateNotifier) {
    return initUpdateNotifier();
  }

  lastChangelogVersion.value = BP_VERSION;
}

type PageModule = {
  name: string;
  enabled?: () => boolean;
  init: () => unknown;
  cleanup?: () => unknown;
};

const { games, header, posts, newPosts, comments, users } = options.modules;

const PAGE_MODULES: PageModule[] = [
  { name: "optionsMenu", init: initOptionsMenu, cleanup: cleanupOptionsMenu },
  { name: "blacklist", enabled: () => users.blacklist.enabled, init: initBlacklist, cleanup: cleanupBlacklist },
  { name: "headerShortcuts", enabled: () => header.shortcuts, init: addHeaderShortcuts, cleanup: cleanupHeaderShortcuts },
  { name: "uncategorizedGamesShortcut", enabled: () => header.uncategorizedGamesShortcut, init: addUncategorizedGamesShortcut, cleanup: cleanupUncategorizedGamesShortcut },
  { name: "missingGamesShortcut", enabled: () => header.missingGamesShortcut, init: addMissingGamesShortcut, cleanup: cleanupMissingShortcuts },
  { name: "mobileMessageIcon", enabled: () => header.mobileMessageBadge, init: initMobileMessageIcon, cleanup: cleanupMobileMessageIcon },
  { name: "steamTags", enabled: () => games.steamStoreIntegration.enabled, init: initSteamTags, cleanup: cleanupSteamTags },
  { name: "hltbTimes", enabled: () => games.hltbIntegration.enabled, init: initHltbTimes, cleanup: cleanupHltbTimes },
  { name: "protonDb", enabled: () => games.protonDbIntegration.enabled, init: initProtonDb, cleanup: cleanupProtonDb },
  ...COMPATIBILITY_DEVICES.map((device) => ({ name: device.id, enabled: device.enabled, ...createCompatibilityColumn(device) })),
  { name: "steamHuntersTimes", enabled: () => games.steamHuntersIntegration.enabled, init: initSteamHuntersTimes, cleanup: cleanupSteamHuntersTimes },
  {
    name: "filter",
    enabled: () => games.filters.progress || games.filters.tags || games.filters.steamTags || (games.filters.modes && games.hltbIntegration.enabled),
    init: () => initFilter(checkIfProgressPage(window.location.href)),
    cleanup: cleanupFilter,
  },
  { name: "mobilePostLayout", enabled: () => posts.mobileLayout, init: initMobilePostLayout },
  { name: "mobileCommentLayout", enabled: () => comments.mobileLayout, init: initMobileCommentLayout },
  { name: "saveLoad", enabled: () => newPosts.saving, init: initSaveLoad },
  { name: "commentPreview", enabled: () => comments.previews, init: addCommentPreview, cleanup: cleanupCommentPreview },
  { name: "quickRearrange", enabled: () => games.lists.quickRearrange, init: initListQuickRearrange },
  { name: "rearrangeButtons", enabled: () => games.lists.rearrangeButtons, init: initRearrangeButtons, cleanup: cleanupRearrangeButtons },
  { name: "automaticHltbList", enabled: () => games.lists.automaticHltb, init: initAutomaticList },
  { name: "bulkRemoveGames", enabled: () => games.other.bulkRemoveMissingGames, init: initBulkRemoveGames },
  { name: "fullWidthTable", enabled: () => games.other.fullWidthTable, init: initFullWidthTable },
  { name: "updateNotifier", init: initUpdateNotice },
];

function cleanup(): void {
  runModule("component cleanup", unmountAll);

  for (const { name, cleanup: cleanupModule } of PAGE_MODULES) {
    if (cleanupModule) {
      runModule(`${name} cleanup`, cleanupModule);
    }
  }
}

function initUpgrade(): void {
  runModule("removeLegacyGameData", removeLegacyGameData);
  runModule("migrateListMakerPresets", migrateListMakerPresets);

  lastVersion.value = BP_VERSION;
}

function init(): void {
  if (options.modules.games.hltbIntegration.enabled && cacheUpdates.excludedGames.getTime() < Date.now() - ONE_DAY_MS) {
    runModule("HLTB excluded games sync", syncExcludedGames);
  }

  runModule("getUserName", getUserName);
  runModule("cleanupOldListBackups", cleanupOldListBackups);
}
function initEachPage(): void {
  if (document.body.dataset.blaeoPlusInitialized === "true") {
    return;
  }

  document.body.dataset.blaeoPlusInitialized = "true";

  cleanup();

  for (const { name, enabled, init: initModule } of PAGE_MODULES) {
    if (!enabled || enabled()) {
      runModule(name, initModule);
    }
  }
}

initUpgrade();
init();
initEachPage();

document.addEventListener("turbolinks:visit", () => {
  document.body.dataset.blaeoPlusInitialized = "false";
});
document.addEventListener("turbolinks:load", initEachPage);

console.log("BLAEO+ successfully loaded");
