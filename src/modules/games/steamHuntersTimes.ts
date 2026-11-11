import { steamHuntersLogoClass } from "@/assets/icons";
import { steamHuntersData } from "@/lib/gameData";
import { registerGameDecorator } from "@/lib/gameRows";
import { getGameName, hasNoAchievements, insertSortableHeader } from "@/lib/gameTable";
import { enqueueUnknownSteamHuntersGames, formatSteamHuntersTime, getSteamHuntersUrl, steamHuntersTitle } from "@/lib/steamHunters";
import { options } from "@/lib/store.svelte";
import { removeAllNodesIfExist } from "@/lib/utilities";

/** Sort value: the median in minutes, -1 without a completion time, -2 when the backend hasn't looked the game up yet, -3 for games without achievements. */
function getSortValue(steamId: number, noAchievements: boolean): number {
  const game = steamHuntersData[steamId];

  if (game?.median) {
    return game.median;
  }

  return noAchievements ? -3 : game ? -1 : -2;
}

function getLinkHtml(steamId: number, extraClass = ""): string {
  return `<a href="${getSteamHuntersUrl(steamId)}" class="${steamHuntersLogoClass} ${extraClass}" aria-label="SteamHunters game page" title="SteamHunters game page"></a>`;
}

export function initSteamHuntersTimes() {
  const addLinks = options.modules.games.steamHuntersIntegration.addSteamHuntersLinks;
  const queryList: QueryGame[] = [];

  registerGameDecorator({
    views: ["table", "list"],
    setup: ({ type, container }) => {
      const headerRow = container.querySelector("tr");

      if (type === "table" && headerRow) {
        insertSortableHeader(container, headerRow, "beforeend", "bp-steamhunters-element", "SH median");
        container.querySelector("colgroup")?.insertAdjacentHTML("beforeend", `<col class="bp-steamhunters-element" style="width: 110px">`);
      }
    },
    render: (game, steamId, view) => {
      const noAchievements = hasNoAchievements(game);
      const title = steamHuntersTitle(steamId, noAchievements);
      const time = formatSteamHuntersTime(steamId, noAchievements);
      const name = getGameName(game);

      if (name && !noAchievements) {
        queryList.push({ name, steamId });
      }

      if (view === "table") {
        return {
          times: `<td class="text-right bp-steamhunters-element" data-value="${getSortValue(steamId, noAchievements)}" title="${title}">${time}</td>`,
          links: addLinks ? `<li class="bp-steamhunters-element" style="vertical-align: middle">${getLinkHtml(steamId)}</li>` : "",
        };
      }

      return {
        times: `<div class="bp-steamhunters-element" title="${title}">SH: ${time}</div>`,
        links: addLinks ? getLinkHtml(steamId, "bp-steamhunters-element") : "",
      };
    },
    finish: () => enqueueUnknownSteamHuntersGames(queryList),
  });
}

export function cleanupSteamHuntersTimes() {
  removeAllNodesIfExist("#games .bp-steamhunters-element, #main .bp-steamhunters-element");
}
