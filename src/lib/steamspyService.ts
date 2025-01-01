import { GM_getValue, GM_setValue, GM_xmlhttpRequest } from "vite-plugin-monkey/dist/client";

export let steamspyData = JSON.parse(GM_getValue("steamspy-data", "{}") || "{}") as SteamspyDataList;
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

  steamspyLastUpdate = new Date();
  GM_setValue("steamspy-last-update", Date.now());
}
