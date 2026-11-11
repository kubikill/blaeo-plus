import { GM_getValue, GM_setValue } from "vite-plugin-monkey/dist/client";
import { formatDuration, splitArrayIntoChunks, tryJsonParse } from "./utilities";
import { markCacheUpdated, options } from "./store.svelte";
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

export type BackendSource = "hltb" | "protondb" | "deckverified" | "steamstore" | "steamhunters";

type EnqueuedBatch = { sentAt: number; sources: BackendSource[]; steamIds: number[] };

const ENQUEUED_KEY = "bp-enqueued-games";
const REMEMBER_ENQUEUED_MS = 24 * 60 * 60 * 1000;
const SAVE_ENQUEUED_DELAY_MS = 2000;

const enqueuedGames: Record<BackendSource, Set<number>> = { hltb: new Set(), protondb: new Set(), deckverified: new Set(), steamstore: new Set(), steamhunters: new Set() };
let enqueuedBatches = tryJsonParse<EnqueuedBatch[]>(GM_getValue(ENQUEUED_KEY, "[]") || "[]", []).filter((batch) => batch.sentAt > Date.now() - REMEMBER_ENQUEUED_MS);
let saveEnqueuedTimer: ReturnType<typeof setTimeout> | undefined;

for (const { sources, steamIds } of enqueuedBatches) {
  for (const source of sources) {
    steamIds.forEach((steamId) => enqueuedGames[source]?.add(steamId));
  }
}

function rememberEnqueued(sources: BackendSource[], steamIds: number[]) {
  enqueuedBatches = enqueuedBatches.filter((batch) => batch.sentAt > Date.now() - REMEMBER_ENQUEUED_MS);
  enqueuedBatches.push({ sentAt: Date.now(), sources, steamIds });

  clearTimeout(saveEnqueuedTimer);
  saveEnqueuedTimer = setTimeout(() => GM_setValue(ENQUEUED_KEY, JSON.stringify(enqueuedBatches)), SAVE_ENQUEUED_DELAY_MS);
}

function enabledSources(): BackendSource[] {
  const games = options.modules.games;
  const sources: BackendSource[] = [];

  if (games.hltbIntegration.enabled) sources.push("hltb");
  if (games.protonDbIntegration.enabled) sources.push("protondb");
  if (games.deckVerifiedIntegration.enabled || games.steamOsIntegration.enabled || games.steamMachineIntegration.enabled || games.steamFrameIntegration.enabled) sources.push("deckverified");
  if (games.steamStoreIntegration.enabled) sources.push("steamstore");
  if (games.steamHuntersIntegration.enabled) sources.push("steamhunters");

  return sources;
}

export function isExcludedGame(steamId: number): boolean {
  return hltbExcludedGames.includes(steamId);
}

export function enqueueGames(games: QueryGame[], sources: BackendSource[] = enabledSources()) {
  if (sources.length === 0) {
    return;
  }

  const toEnqueue = games.filter((game) => sources.some((source) => !enqueuedGames[source].has(game.steamId)));

  toEnqueue.forEach((game) => sources.forEach((source) => enqueuedGames[source].add(game.steamId)));

  for (let chunk of splitArrayIntoChunks(toEnqueue, 100)) {
    gmRequest(
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        url: `${BACKEND_URL}/enqueue-games`,
        responseType: "json",
        anonymous: true,
        overrideMimeType: "application/json",
        data: JSON.stringify({ games: chunk, sources }),
      },
      201,
    )
      .then(() => {
        rememberEnqueued(
          sources,
          chunk.map((game) => game.steamId),
        );
        console.log(`Successfully enqueued ${chunk.length} game(s) for ${sources.join(", ")}`);
      })
      .catch((error) => {
        chunk.forEach((game) => sources.forEach((source) => enqueuedGames[source].delete(game.steamId)));
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
