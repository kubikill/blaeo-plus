import "@/app.scss";
import { options } from "@/globals";
import addHeaderShortcuts from "@/modules/header/shortcuts";
import initMobileMessageIcon from "@/modules/header/mobileMessageIcon";
import { initMenu } from "@/modules/options/menu";
import { initFilter } from "@/modules/games/filter";
import { initHltbTimes } from "@/modules/games/hltbTimes";
import addCommentPreview from "./modules/comments/commentPreview";
import { initSaveLoad } from "./modules/newPost/saveLoad";
import { hltbLastUpdate, syncHltb } from "./lib/hltbService";
import initMobileLayout from "./modules/posts/mobileLayout";

function checkIfProgressPage(url: string) {
  return (
    url.includes("games/wont-play") ||
    url.includes("games/never-played") ||
    url.includes("games/unfinished") ||
    url.includes("games/beaten") ||
    url.includes("games/completed")
  );
}

function init() {
  if (options.modules.games.hltbIntegration.enabled) {
    if (hltbLastUpdate.getTime() < Date.now() - 86400) {
      // if last sync was at least 1 day ago
      syncHltb();
    }
  }
}

function initEachPage() {
  if (document.body.dataset.blaeoPlusInitialized === "true") {
    return;
  }

  document.body.dataset.blaeoPlusInitialized = "true";

  const currentUrl = window.location.href;
  initMenu();

  if (options.modules.header.shortcuts) {
    addHeaderShortcuts();
  }

  if (options.modules.header.mobileMessageBadge) {
    initMobileMessageIcon();
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

  if (options.modules.posts.mobileLayout) {
    initMobileLayout();
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
