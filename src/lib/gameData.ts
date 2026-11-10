import { BACKEND_TIMEOUT_MS, BACKEND_URL, gmRequest } from "./request";
import { splitArrayIntoChunks } from "./utilities";
import { options } from "./store.svelte";
import { findSteamId } from "./gameTable";
import { getGamesContainer, waitUntilGamesContainerLoaded } from "./waitUntilGamesContainerLoaded";
import { allStoredIds, countRecords, readRecords, STORES, writeRecords, type StoredGameRecord } from "./gameDataDb";

export type Dataset = (typeof STORES)[number];

type DatasetEntries = {
  hltb: GameInfo;
  linux: LinuxDataList;
  steamspy: SteamspyDataList;
  steamhunters: SteamHuntersDataList;
  steamos: DeviceCompatibilityList;
  steammachine: DeviceCompatibilityList;
  steamframe: DeviceCompatibilityList;
};

type LoadedDataset<T> = {
  entries: T;
  fetchedAt: Record<number, number>;
};

const REFRESH_AFTER_MS = 24 * 60 * 60 * 1000;
const MAX_IDS_PER_REQUEST = 2000;

function emptyDataset<T>(): LoadedDataset<T> {
  return { entries: {} as T, fetchedAt: {} };
}

const loaded: { [D in Dataset]: LoadedDataset<DatasetEntries[D]> } = {
  hltb: emptyDataset(),
  linux: emptyDataset(),
  steamspy: emptyDataset(),
  steamhunters: emptyDataset(),
  steamos: emptyDataset(),
  steammachine: emptyDataset(),
  steamframe: emptyDataset(),
};

export const hltbData = loaded.hltb.entries;
export const linuxData = loaded.linux.entries;
export const steamspyData = loaded.steamspy.entries;
export const steamHuntersData = loaded.steamhunters.entries;
export const steamOsData = loaded.steamos.entries;
export const steamMachineData = loaded.steammachine.entries;
export const steamFrameData = loaded.steamframe.entries;

export class GameDataUnavailableError extends Error {
  constructor(readonly datasets: Dataset[]) {
    super(`Couldn't load game data (${datasets.join(", ")}) from the BLAEO+ server. Please try again later.`);
    this.name = "GameDataUnavailableError";
  }
}

function getLoaded(dataset: Dataset) {
  return loaded[dataset] as LoadedDataset<Record<number, unknown>>;
}

async function loadFromCache(dataset: Dataset, steamIds: number[]) {
  const { entries, fetchedAt } = getLoaded(dataset);
  const toRead = steamIds.filter((id) => !(id in fetchedAt));

  if (toRead.length === 0) {
    return;
  }

  for (const record of (await readRecords(dataset, toRead)) ?? []) {
    if (!(fetchedAt[record.steamId] >= record.fetchedAt)) {
      fetchedAt[record.steamId] = record.fetchedAt;

      if ("entry" in record) {
        entries[record.steamId] = record.entry;
      }
    }
  }
}

function storeReceived(dataset: Dataset, steamIds: number[], received: Record<number, unknown>, fetchedNow: number): Promise<void> {
  const { entries, fetchedAt } = getLoaded(dataset);
  const records: StoredGameRecord[] = steamIds.map((id) => {
    fetchedAt[id] = fetchedNow;

    if (received[id]) {
      entries[id] = received[id];
      return { steamId: id, fetchedAt: fetchedNow, entry: received[id] };
    }

    delete entries[id];
    return { steamId: id, fetchedAt: fetchedNow };
  });

  return writeRecords(dataset, records);
}

async function fetchGameData(steamIds: number[], datasets: Dataset[]): Promise<boolean> {
  let succeeded = true;

  for (const chunk of splitArrayIntoChunks(steamIds, MAX_IDS_PER_REQUEST)) {
    try {
      const response = await gmRequest({
        method: "POST",
        url: `${BACKEND_URL}/game-data`,
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify({ steamIds: chunk, fields: datasets }),
        responseType: "json",
        anonymous: true,
        timeout: BACKEND_TIMEOUT_MS,
      });
      const fetchedNow = Date.now();
      const received = datasets.filter((dataset) => typeof response.response?.[dataset] === "object" && response.response[dataset] !== null);

      await Promise.all(received.map((dataset) => storeReceived(dataset, chunk, response.response[dataset], fetchedNow)));

      if (received.length < datasets.length) {
        throw new Error(`the response has no ${datasets.filter((dataset) => !received.includes(dataset)).join(", ")} data`);
      }
    } catch (error: any) {
      succeeded = false;
      console.error(`BLAEO+: failed to fetch game data (${datasets.join(", ")}). Details: ${error?.responseText ?? error}`);
    }
  }

  return succeeded;
}

export function enabledDatasets(): Dataset[] {
  const games = options.modules.games;
  const datasets: Dataset[] = [];

  if (games.hltbIntegration.enabled) datasets.push("hltb");
  if (games.protonDbIntegration.enabled || games.deckVerifiedIntegration.enabled) datasets.push("linux");
  if (games.steamStoreIntegration.enabled) datasets.push("steamspy");
  if (games.steamHuntersIntegration.enabled) datasets.push("steamhunters");
  if (games.steamOsIntegration.enabled) datasets.push("steamos");
  if (games.steamMachineIntegration.enabled) datasets.push("steammachine");
  if (games.steamFrameIntegration.enabled) datasets.push("steamframe");

  return datasets;
}

export function isUnknownToBackend(dataset: Dataset, steamId: number): boolean {
  return steamId in loaded[dataset].fetchedAt && !(steamId in loaded[dataset].entries);
}

export function cachedGameCount(dataset: Dataset): Promise<number> {
  return countRecords(dataset);
}

export async function ensureGameData(steamIds: number[], datasets: Dataset[] = enabledDatasets(), { force = false } = {}) {
  const uniqueIds = [...new Set(steamIds)];

  await Promise.all(datasets.map((dataset) => loadFromCache(dataset, uniqueIds)));

  const refreshBefore = Date.now() - REFRESH_AFTER_MS;
  const isStale = (dataset: Dataset, id: number) => force || !(getLoaded(dataset).fetchedAt[id] > refreshBefore);
  const fields = datasets.filter((dataset) => uniqueIds.some((id) => isStale(dataset, id)));
  const toFetch = uniqueIds.filter((id) => fields.some((dataset) => isStale(dataset, id)));
  const succeeded = fields.length === 0 || (await fetchGameData(toFetch, fields));
  const missing = datasets.filter((dataset) => uniqueIds.some((id) => !(id in loaded[dataset].fetchedAt)));

  if (missing.length > 0 || (force && !succeeded)) {
    throw new GameDataUnavailableError(missing.length > 0 ? missing : fields);
  }

  if (!succeeded) {
    console.warn("BLAEO+: couldn't refresh some game data, using cached data instead");
  }
}

export async function refreshCachedGameData(dataset: Dataset) {
  return ensureGameData(await allStoredIds(dataset), [dataset], { force: true });
}

export function getSteamIdsIn(container: ParentNode): number[] {
  return Array.from(container.querySelectorAll(".game")).flatMap((game) => findSteamId(game) ?? []);
}

let pageDataPromise: Promise<void> | null = null;
let pageDataContainer: HTMLElement | null = null;

export function waitUntilGameDataLoaded(): Promise<void> {
  const gamesContainer = getGamesContainer();

  if (!gamesContainer) {
    return Promise.reject(new Error("No games container on this page"));
  }

  if (!pageDataPromise || pageDataContainer !== gamesContainer.container) {
    pageDataContainer = gamesContainer.container;
    pageDataPromise = waitUntilGamesContainerLoaded()
      .then(() => ensureGameData(getSteamIdsIn(gamesContainer.container)))
      .catch((error) => console.error("BLAEO+: some game data is unavailable", error));
  }

  return pageDataPromise;
}
