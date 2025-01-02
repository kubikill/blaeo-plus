import { optionsStore } from "@/lib/store";
import { steamspyData } from "@/lib/steamspyService";
import { removeAllNodesIfExist } from "@/lib/utilities";
import { get } from "svelte/store";
import { getGamesContainer, waitUntilGamesContainerLoaded } from "@/lib/waitUntilGamesContainerLoaded";

let options = get(optionsStore) as Options;
optionsStore.subscribe((value) => {
  options = value;
});

function getGameSteamTagsHtml(steamId: number): string {
  let html = "<ul class='bp-steam-tags'><li>🏷️</li>";

  if (steamspyData[steamId]) {
    const steamspy = steamspyData[steamId];
    let tags = steamspy.tags;

    try {
      tags = JSON.parse(tags);
      tags = Object.keys(tags);
    } catch {
      tags = tags.split(";");
    }

    if (tags && tags.length > 0) {
      tags.forEach((tag) => {
        if (tag === "+") {
          return;
        }

        html += `<li class="badge badge-secondary bp-steam-tag" data-steam-tag="${tag}">${tag}</li>`;
      });
    } else {
      html += "<li>No tags</li>";
    }
  } else {
    html += "<li>No tag data available</li>";
  }

  html += "</ul>";

  return html;
}

export async function initSteamTags() {
  let gameContainer = getGamesContainer();

  if (!gameContainer || gameContainer.type === "grid") {
    return;
  }

  if (gameContainer.type === "list") {
    gameContainer.container.classList.add("bp-game-list");
  }

  await waitUntilGamesContainerLoaded();

  const gameTableHeader = gameContainer.container.querySelector("tr > th:nth-child(3)") as HTMLTableCellElement;
  const gameTableFullHeader = gameContainer.container.querySelector("tr") as HTMLTableRowElement;
  const games = gameContainer.container.querySelectorAll(".game") as NodeListOf<HTMLElement>;

  games.forEach((game) => {
    const steamStoreLink = game.querySelector('a[href*="store.steampowered.com/app/"]') as HTMLAnchorElement;
    const steamId = +steamStoreLink!.href!.match(/app\/(\d+)/)![1];

    if (gameContainer.type === "table") {
      let nameCell;
      if (gameTableFullHeader!.firstElementChild!.textContent!.trim() === "#" || gameTableFullHeader!.firstElementChild!.textContent!.trim() === "Date Won") {
        nameCell = game.querySelector("td:nth-child(2)");
      } else {
        nameCell = game.querySelector("td:nth-child(1)");
      }
      nameCell!.insertAdjacentHTML("beforeend", getGameSteamTagsHtml(steamId));
    } else if (gameContainer.type === "list") {
      const hltbCell = game.querySelector(".bp-list-hltb-info");

      if (hltbCell) {
        hltbCell.insertAdjacentHTML("beforebegin", getGameSteamTagsHtml(steamId));
      } else {
        const mediaBody = game.querySelector(".media-body");

        mediaBody!.insertAdjacentHTML("beforeend", getGameSteamTagsHtml(steamId));
      }
    }
  });
}

export function cleanupSteamTags() {
  removeAllNodesIfExist(".bp-protondb-element, .bp-linux-media, .bp-linux-grid");
}
