import { hltbData } from "@/lib/gameData";
import { whenGamesDecorated } from "@/lib/gameRows";
import GameFilters from "@/modules/games/GameFilters.svelte";
import { mountTracked } from "@/globals";
import { options } from "@/lib/store.svelte";
import { getGamesContainer } from "@/lib/waitUntilGamesContainerLoaded";
import { removeAllNodesIfExist } from "@/lib/utilities";
import { getSteamId } from "@/lib/gameTable";
import { COMPATIBILITY_DEVICES } from "./compatibilityColumns";
import { type FilterOption as FilterOptionFull, PROGRESSES, type Filters, type GameStats, type Progress } from "./filterTypes";

type GameElement = HTMLTableRowElement | HTMLDivElement | HTMLLIElement;
type FilterOption = Pick<FilterOptionFull, "value">;

type TagFilter = {
  mode: "tags" | "not-tags" | null;
  and: boolean;
  selectors: string[];
};

function parseTagFilter(selected: FilterOption[], notValue: string, andValue: string, toSelector: (value: string) => string): TagFilter {
  const values = selected.map((option) => option.value);

  return {
    mode: values.includes(notValue) ? "not-tags" : values.length > 0 ? "tags" : null,
    and: values.includes(andValue),
    selectors: values.filter((value) => value !== notValue && value !== andValue).map(toSelector),
  };
}

function matchesTagFilter(game: GameElement, filter: TagFilter, anyTagSelector: string): boolean {
  const hasTag = (selector: string) => !!game.querySelector(selector);

  switch (filter.mode) {
    case "tags":
      if (filter.selectors.length === 0) {
        return true;
      }
      return filter.and ? filter.selectors.every(hasTag) : filter.selectors.some(hasTag);
    case "not-tags":
      if (filter.selectors.length === 0) {
        return !hasTag(anyTagSelector);
      }
      return filter.and ? !filter.selectors.every(hasTag) : !filter.selectors.some(hasTag);
    default:
      return true;
  }
}

function matchesModeFilter(steamId: number, selectedModes: string[]): boolean {
  const gameModes = hltbData[steamId]?.type;
  const modes = selectedModes.filter((mode) => mode !== "strict" && mode !== "not");

  if (selectedModes.includes("strict")) {
    return JSON.stringify(gameModes ?? []) === JSON.stringify(modes);
  }

  if (selectedModes.includes("not")) {
    return !modes.some((mode) => gameModes?.includes(mode as GameTypes));
  }

  return modes.every((mode) => gameModes?.includes(mode as GameTypes));
}

function matchesProtonDbFilter(game: GameElement, selectedRatings: string[]): boolean {
  const includeProvisional = selectedRatings.includes("provisional");
  const ratings = selectedRatings.filter((rating) => rating !== "provisional");

  if (ratings.length === 0) {
    return true;
  }

  const isProvisional = !!game.querySelector(".bp-protondb-rating-provisional");

  return (includeProvisional || !isProvisional) && ratings.some((rating) => game.querySelector(`.bp-protondb-rating-${rating}`));
}

function matchesDeviceFilter(game: GameElement, classPrefix: string, selectedStatuses: string[]): boolean {
  return selectedStatuses.length === 0 || selectedStatuses.some((status) => game.querySelector(`.${classPrefix}-${status}`));
}

function runFilters(games: NodeListOf<GameElement>, filters: Filters, progresses: Record<Progress, boolean>, gamesContainer: HTMLElement) {
  const values = (selected: FilterOption[]) => selected.map((option) => option.value);
  const tagFilter = parseTagFilter(filters.tags, "not-tags", "and-tags", (value) => `[href$="/lists/${CSS.escape(value)}"]`);
  const steamTagFilter = parseTagFilter(filters.steamTags, "not-steam-tags", "and-steam-tags", (value) => `[data-steam-tags*="${CSS.escape(`|${value}|`)}"]`);
  const modes = values(filters.modes);
  const protonDbRatings = values(filters.protonDbRatings);
  const deviceFilters = COMPATIBILITY_DEVICES.map((device) => ({ classPrefix: device.classPrefix, statuses: values(filters.deviceStatuses[device.id]) }));

  for (let game of games) {
    const visible =
      matchesTagFilter(game, tagFilter, ".list-tag") &&
      matchesTagFilter(game, steamTagFilter, '[data-steam-tags*="|"]') &&
      matchesModeFilter(getSteamId(game), modes) &&
      matchesProtonDbFilter(game, protonDbRatings) &&
      deviceFilters.every(({ classPrefix, statuses }) => matchesDeviceFilter(game, classPrefix, statuses));

    game.style.display = visible ? "" : "none";
  }

  for (let progress of PROGRESSES) {
    gamesContainer.classList.toggle(`hide-${progress}`, !progresses[progress]);
  }
}

function getGameStats(games: NodeListOf<GameElement>): GameStats {
  const stats: Record<string, number | string> = { total: games.length };

  for (let progress of PROGRESSES) {
    const count = Array.from(games).filter((game) => game.classList.contains(`game-${progress}`)).length;
    stats[progress] = count;
    stats[`${progress}-percent`] = (Math.floor((count / games.length) * 10000) / 100).toFixed(2);
  }

  return stats as GameStats;
}

function getTagOptions(andValue: string, notValue: string, tags: [string, TagOption][]): Map<string, TagOption> {
  return new Map([[andValue, { label: "AND selected tags", color: "#FFFFFF" }], [notValue, { label: "NOT selected tags", color: "#000000" }], ...tags]);
}

const modes = [
  { label: "Strict checking", value: "strict", color: "#000000", sortValue: 1 },
  { label: "NOT selected modes", value: "not", color: "#000000", sortValue: 2 },
  { label: "Singleplayer", value: "sp", color: "transparent", sortValue: 3 },
  { label: "Multiplayer", value: "mp", color: "transparent", sortValue: 4 },
  { label: "Co-op", value: "coop", color: "transparent", sortValue: 5 },
];

const protonDbRatings = [
  { label: "Include provisional ratings", value: "provisional", color: "#000000", sortValue: 0 },
  { label: "Platinum", value: "platinum", color: "#b4c7dc", sortValue: 1 },
  { label: "Gold", value: "gold", color: "#cfb53b", sortValue: 2 },
  { label: "Silver", value: "silver", color: "#a6a6a6", sortValue: 3 },
  { label: "Bronze", value: "bronze", color: "#cd7f32", sortValue: 4 },
  { label: "Borked", value: "borked", color: "#ff0000", sortValue: 5 },
  { label: "No data", value: "no-data", color: "#444444", sortValue: 6 },
];

const verifiedStatus = { label: "Verified", value: "verified", color: "#59bf40", sortValue: 1 };
const playableStatus = { label: "Playable", value: "playable", color: "#ffc82c", sortValue: 2 };
const compatibleStatus = { ...playableStatus, label: "Compatible", color: "#199fff" };
const unsupportedStatus = { label: "Unsupported", value: "unsupported", color: "#8c8e8f", sortValue: 3 };
const untestedStatus = { label: "Untested", value: "untested", color: "#8c8e8f", sortValue: 4 };
const deviceStatuses = [verifiedStatus, playableStatus, unsupportedStatus, untestedStatus];

const DEVICE_STATUS_OPTIONS: Record<CompatibilityDeviceId, FilterOptionFull[]> = {
  deck: deviceStatuses,
  steamos: [compatibleStatus, unsupportedStatus, untestedStatus],
  steammachine: deviceStatuses,
  steamframe: deviceStatuses,
};

export async function initFilter(isProgressPage: boolean) {
  const gamesContainer = getGamesContainer();

  if (!gamesContainer) {
    return;
  }

  await whenGamesDecorated();

  const filterContainer = document.createElement("div");
  filterContainer.classList.add("bp-filters");

  if (gamesContainer.container.id === "main") {
    gamesContainer.container.querySelector(".list-progress")?.insertAdjacentElement("afterend", filterContainer);
  } else {
    gamesContainer.container.insertAdjacentElement("beforebegin", filterContainer);
  }

  const games = gamesContainer.container.querySelectorAll<GameElement>(".game");

  const listTags = Array.from(gamesContainer.container.querySelectorAll<HTMLAnchorElement>("a.list-tag")).map((tag): [string, TagOption] => [
    tag.href.slice(tag.href.indexOf("/lists") + 7),
    { label: tag.textContent ?? "", color: tag.style.backgroundColor },
  ]);
  const steamTagNames = new Set(Array.from(gamesContainer.container.querySelectorAll<HTMLElement>("[data-steam-tags]")).flatMap((tags) => tags.dataset.steamTags!.split("|").filter(Boolean)));
  const steamTags = Array.from(steamTagNames, (tag): [string, TagOption] => [tag, { label: tag, color: "#000000" }]);

  const filterOptionsEnabled = options.modules.games.filters;

  mountTracked(GameFilters, {
    target: filterContainer,
    props: {
      progresses: PROGRESSES,
      availableTags: getTagOptions("and-tags", "not-tags", listTags),
      availableSteamTags: getTagOptions("and-steam-tags", "not-steam-tags", steamTags),
      gameStats: getGameStats(games),
      modes,
      protonDbRatings,
      deviceFilters: COMPATIBILITY_DEVICES.filter((device) => device.enabled() && device.filterEnabled()).map((device) => ({ id: device.id, placeholder: device.filterPlaceholder, options: DEVICE_STATUS_OPTIONS[device.id] })),
      showProgressFilter: filterOptionsEnabled.progress && !document.querySelector("#main .list-progress") && !isProgressPage,
      showTagsFilter: filterOptionsEnabled.tags && gamesContainer.type !== "grid",
      showModesFilter: filterOptionsEnabled.modes && options.modules.games.hltbIntegration.enabled,
      showProtonDbFilter: filterOptionsEnabled.protonDbRatings && options.modules.games.protonDbIntegration.enabled,
      showSteamTagsFilter: filterOptionsEnabled.steamTags && options.modules.games.steamStoreIntegration.enabled,
      onfilterschanged: (filters: Filters, shownProgresses: Record<Progress, boolean>) => runFilters(games, filters, shownProgresses, gamesContainer.container),
    },
  });
}

export function cleanupFilter() {
  removeAllNodesIfExist(".bp-filters");
}
