import { GM_getValue, GM_setValue } from "vite-plugin-monkey/dist/client";
import { formatDuration, splitArrayIntoChunks, tryJsonParse } from "./utilities";
import { markCacheUpdated } from "./store.svelte";
import { BACKEND_URL, fetchBackendJson, gmRequest } from "./request";
import { hltbData } from "./gameData";

export let hltbExcludedGames = tryJsonParse<number[]>(GM_getValue("hltb-excluded-games", "[]") || "[]", []);

export async function syncExcludedGames() {
  const excludedGames = await fetchBackendJson<number[]>("excluded-games");

  if (!Array.isArray(excludedGames)) {
    throw new Error("The BLAEO+ server sent an invalid excluded games list");
  }

  hltbExcludedGames = excludedGames;
  GM_setValue("hltb-excluded-games", JSON.stringify(excludedGames));
  markCacheUpdated("excludedGames");

  return true;
}

const enqueuedGames = new Set<number>();

export function isExcludedGame(steamId: number): boolean {
  return hltbExcludedGames.includes(steamId);
}

export function enqueueGames(games: QueryGame[]) {
  const toEnqueue = games.filter((game) => !enqueuedGames.has(game.steamId));

  toEnqueue.forEach((game) => enqueuedGames.add(game.steamId));

  for (let chunk of splitArrayIntoChunks(toEnqueue, 100)) {
    gmRequest(
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        url: `${BACKEND_URL}/enqueue-games`,
        responseType: "json",
        anonymous: true,
        overrideMimeType: "application/json",
        data: JSON.stringify({ games: chunk }),
      },
      201,
    )
      .then((response) => console.log(`Successfully enqueued games. Games in HLTB queue: ${response.response.gamesInHltbQueue}`))
      .catch((error) => {
        chunk.forEach((game) => enqueuedGames.delete(game.steamId));
        console.error(`Failed to enqueue library chunk. Details: ${error?.responseText ?? error}`);
      });
  }
}

export function getHltbGame(steamId: number): GameInfo[number] | null {
  const game = hltbData[steamId];

  return !isExcludedGame(steamId) && game && game.hltbId != -1 ? game : null;
}

export function getHltbStatus(steamId: number): string {
  return isExcludedGame(steamId) ? "N/A" : hltbData[steamId] ? "Not on HLTB" : "Unknown";
}

const HLTB_MODES = [
  { field: "mp", label: "MP" },
  { field: "coop", label: "Co-op" },
] as const;

export function getHltbModes(game: GameInfo[number]) {
  return HLTB_MODES.filter((mode) => game.type.includes(mode.field));
}

export function isMpOnly(game: GameInfo[number] | undefined): game is GameInfo[number] {
  return !!game && !game.type?.includes("sp") && !!(game.type?.includes("mp") || game.type?.includes("coop"));
}

export function formatHltbTime(steamId: number, type: HltbTimeField): string {
  const gameObj = hltbData[steamId];

  if (!gameObj) {
    return "Unknown";
  }

  const time = gameObj[type];

  if (!time) {
    return "No data";
  }

  return formatDuration(time, gameObj[`${type}Count`] ?? 0);
}

function postReport(path: string, body: object) {
  return gmRequest({ method: "POST", url: `${BACKEND_URL}/${path}`, headers: { "Content-Type": "application/json" }, data: JSON.stringify(body), responseType: "json", anonymous: true }, 201);
}

export async function reportHltbId(steamId: number, hltbId: number) {
  await postReport("report-hltb-id-correction", { steamId, hltbId });
}

export async function reportNotAGame(steamId: number) {
  await postReport("report-not-a-game", { steamId });
}
