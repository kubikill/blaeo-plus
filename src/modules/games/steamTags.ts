import { steamspyData, waitUntilGameDataLoaded } from "@/lib/gameData";
import { escapeHtml, removeAllNodesIfExist } from "@/lib/utilities";
import { getGamesContainer } from "@/lib/waitUntilGamesContainerLoaded";
import { getSteamId, hasLeadingIndexColumn, insertInListBody } from "@/lib/gameTable";
import { options } from "@/lib/store.svelte";
import { PROGRESSES } from "./filterTypes";

function shouldHideTags(game: HTMLElement): boolean {
  return PROGRESSES.some((progress) => options.modules.games.steamStoreIntegration.hideTagsForProgress[progress] && game.classList.contains(`game-${progress}`));
}

function getSteamTags(steamId: number): string[] | null {
  const rawTags = steamspyData[steamId]?.tags;

  if (rawTags === undefined) {
    return null;
  }

  let tags: string[];

  if (Array.isArray(rawTags)) {
    tags = rawTags;
  } else {
    try {
      tags = Object.keys(JSON.parse(rawTags));
    } catch {
      tags = rawTags.split(";");
    }
  }

  return tags.filter((tag) => tag && tag !== "+");
}

function getGameSteamTagsHtml(steamId: number, hidden = false): string {
  const tags = getSteamTags(steamId);
  const text = tags === null ? "No tag data available" : tags.length > 0 ? tags.join(", ") : "No tags";
  const data = tags?.length ? `|${tags.join("|")}|` : "";

  return `<div class="bp-steam-tags" data-steam-tags="${escapeHtml(data)}"${hidden ? " hidden" : ""}>🏷️ ${escapeHtml(text)}</div>`;
}

export async function initSteamTags() {
  const gameContainer = getGamesContainer();

  if (!gameContainer) {
    return;
  }

  if (gameContainer.type === "list") {
    gameContainer.container.classList.add("bp-game-list");
  }

  await waitUntilGameDataLoaded();

  const games = gameContainer.container.querySelectorAll<HTMLElement>(".game");
  const nameColumn = hasLeadingIndexColumn(gameContainer.container.querySelector("tr")) ? 2 : 1;

  games.forEach((game) => {
    const steamId = getSteamId(game);

    if (gameContainer.type === "grid") {
      game.insertAdjacentHTML("beforeend", getGameSteamTagsHtml(steamId, true));
      return;
    }

    const tagsHtml = getGameSteamTagsHtml(steamId, shouldHideTags(game));

    if (gameContainer.type === "table") {
      game.querySelector(`td:nth-child(${nameColumn})`)?.insertAdjacentHTML("beforeend", tagsHtml);
    } else {
      insertInListBody(game, tagsHtml);
    }
  });
}

export function cleanupSteamTags() {
  removeAllNodesIfExist(".bp-steam-tags");
}
