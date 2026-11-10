import { steamHuntersLogo } from "@/assets/icons";
import { steamHuntersData, waitUntilGameDataLoaded } from "@/lib/gameData";
import { getGameName, getSteamId, hasNoAchievements, insertSortableHeader } from "@/lib/gameTable";
import { enqueueUnknownSteamHuntersGames, formatSteamHuntersTime, getSteamHuntersUrl, steamHuntersTitle } from "@/lib/steamHunters";
import { options } from "@/lib/store.svelte";
import { removeAllNodesIfExist } from "@/lib/utilities";
import { getGamesContainer } from "@/lib/waitUntilGamesContainerLoaded";

/** Sort value: the median in minutes, -1 without a completion time, -2 when the backend hasn't looked the game up yet, -3 for games without achievements. */
function getSortValue(steamId: number, noAchievements: boolean): number {
  const game = steamHuntersData[steamId];

  if (game?.median) {
    return game.median;
  }

  return noAchievements ? -3 : game ? -1 : -2;
}

function getLinkHtml(steamId: number, extraClass = ""): string {
  return `<a href="${getSteamHuntersUrl(steamId)}" class="${extraClass}" aria-label="SteamHunters game page" title="SteamHunters game page">${steamHuntersLogo}</a>`;
}

function insertLink(container: Element, html: string) {
  const reportButton = container.querySelector(".bp-hltb-report");
  const before = reportButton?.closest("li") ?? reportButton;

  if (before && container.contains(before)) {
    before.insertAdjacentHTML("beforebegin", html);
  } else {
    container.insertAdjacentHTML("beforeend", html);
  }
}

export async function initSteamHuntersTimes() {
  const gameContainer = getGamesContainer();

  if (!gameContainer || gameContainer.type === "grid") {
    return;
  }

  await waitUntilGameDataLoaded();

  const table = gameContainer.container;
  const headerRow = table.querySelector("tr");
  const addLinks = options.modules.games.steamHuntersIntegration.addSteamHuntersLinks;
  const queryList: QueryGame[] = [];

  if (gameContainer.type === "table" && headerRow) {
    insertSortableHeader(table, headerRow, "beforeend", "bp-steamhunters-element", "SH median");
    table.querySelector("colgroup")?.insertAdjacentHTML("beforeend", `<col class="bp-steamhunters-element" style="width: 110px">`);
  }

  table.querySelectorAll<HTMLElement>(".game").forEach((game) => {
    const steamId = getSteamId(game);
    const noAchievements = hasNoAchievements(game);
    const time = `<span title="${steamHuntersTitle(steamId, noAchievements)}">${formatSteamHuntersTime(steamId, noAchievements)}</span>`;
    const name = getGameName(game);

    if (gameContainer.type === "table") {
      game.insertAdjacentHTML("beforeend", `<td class="text-right bp-steamhunters-element" data-value="${getSortValue(steamId, noAchievements)}">${time}</td>`);

      const toolbar = game.querySelector(".toolbar");

      if (addLinks && toolbar) {
        insertLink(toolbar, `<li class="bp-steamhunters-element" style="vertical-align: middle">${getLinkHtml(steamId)}</li>`);
      }
    } else {
      const heading = game.querySelector(".media-heading");
      const hltbInfo = game.querySelector(".bp-list-hltb-info");
      const line = `SH: ${time}`;

      if (hltbInfo) {
        hltbInfo.insertAdjacentHTML("beforeend", `<div class="bp-steamhunters-element">${line}</div>`);
      } else {
        game.insertAdjacentHTML("beforeend", `<div class="bp-list-hltb-info bp-steamhunters-element">${line}</div>`);
      }

      if (addLinks && heading) {
        insertLink(heading, getLinkHtml(steamId, "bp-steamhunters-element"));
      }
    }

    if (name && !noAchievements) {
      queryList.push({ name, steamId });
    }
  });

  enqueueUnknownSteamHuntersGames(queryList);
}

export function cleanupSteamHuntersTimes() {
  removeAllNodesIfExist("#games .bp-steamhunters-element, #main .bp-steamhunters-element");
}
