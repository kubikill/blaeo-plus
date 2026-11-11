import { steamspyData } from "@/lib/gameData";
import { registerGameDecorator } from "@/lib/gameRows";
import { escapeHtml, removeAllNodesIfExist } from "@/lib/utilities";
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

export function initSteamTags() {
  registerGameDecorator({
    setup: ({ type, container }) => {
      if (type === "list") {
        container.classList.add("bp-game-list");
      }
    },
    render: (game, steamId, view) => ({ tags: getGameSteamTagsHtml(steamId, view === "grid" || shouldHideTags(game)) }),
  });
}

export function cleanupSteamTags() {
  removeAllNodesIfExist(".bp-steam-tags");
}
