import "@/app.scss";
import { getUserGames, getUserName, options, userData } from "@/globals";
import addHeaderShortcuts from "@/modules/header/shortcuts";
import addMobileMessageBadge from "@/modules/header/mobileMessageBadge";
import { initMenu } from "@/modules/options/menu";
import { initFilter } from "@/modules/games/filter";
import { initHltbTimes } from "@/modules/games/hltbTimes";
import addCommentPreview from "./modules/comments/commentPreview";
import { initSaveLoad } from "./modules/newPost/saveLoad";

function checkIfProgressPage(url: string) {
  return (
    url.includes("games/wont-play") ||
    url.includes("games/never-played") ||
    url.includes("games/unfinished") ||
    url.includes("games/beaten") ||
    url.includes("games/completed")
  );
}

function initEachPage() {
  const currentUrl = window.location.href;
  initMenu();

  if (options.modules.header.shortcuts) {
    addHeaderShortcuts();
  }

  if (options.modules.header.mobileMessageBadge) {
    addMobileMessageBadge();
  }

  if (
    options.modules.games.filters.progress ||
    options.modules.games.filters.tags ||
    (options.modules.games.filters.modes && options.modules.games.hltbIntegration.enabled)
  ) {
    initFilter(checkIfProgressPage(currentUrl));
  }

  if (options.modules.games.hltbIntegration.enabled) {
    initHltbTimes();
  }

  if (options.modules.newPosts.saving) {
    initSaveLoad();
  }

  if (options.modules.comments.previews) {
    addCommentPreview();
  }
}

initEachPage();

document.addEventListener("turbolinks:load", initEachPage);

console.log("BLAEO+ successfully loaded");
