import { GM_getValue, GM_setValue, GM_xmlhttpRequest } from "vite-plugin-monkey/dist/client";
import { tryJsonParse } from "./utilities";
import { lastCacheUpdatesStore } from "./store";

export let steamspyData = tryJsonParse(GM_getValue("steamspy-data", "{}") || "{}", {}) as SteamspyDataList;
export let steamspyLastUpdate = new Date(GM_getValue("steamspy-last-update", 0));

export function syncSteamspyGames() {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: "https://blaeoplus.kubikill.dev/hltb/steamspy-list",
      nocache: true,
      responseType: "json",
      anonymous: true,
      onload: (response) => {
        if (response.status === 200) {
          steamspyData = response.response;
          GM_setValue("steamspy-data", response.responseText);

          resolve(response.responseText);
        } else {
          reject(`Failed to fetch Steamspy info from backend. Details: ${response.responseText}`);
        }
      },
      onerror: (error) => {
        reject(error);
      },
    });
  });
}

export async function syncSteamspy() {
  let steamspyGames = syncSteamspyGames();

  await steamspyGames;

  lastCacheUpdatesStore.update((updates) => {
    updates.steamspy = new Date();
    return updates;
  });

  return true;
}
