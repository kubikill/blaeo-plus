import { GM_getValue, GM_setValue, GM_xmlhttpRequest } from "vite-plugin-monkey/dist/client";
import { splitArrayIntoChunks } from "./utilities";
import { getUserGames, userData } from "@/globals";

export let hltbExcludedGames = JSON.parse(GM_getValue("hltb-excluded-games", "[]") || "[]");
export let hltbData = JSON.parse(GM_getValue("hltb-data", "{}") || "{}") as GameInfo;
export let hltbLastUpdate = new Date(GM_getValue("hltb-last-update", 0));

export function syncHltbGames() {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: "https://blaeoplus.kubikill.dev/hltb/game-list",
      nocache: true,
      responseType: "json",
      anonymous: true,
      onload: (response) => {
        if (response.status === 200) {
          hltbData = response.response;
          GM_setValue("hltb-data", response.responseText);

          resolve(response.responseText);
        } else {
          reject(`Failed to fetch HLTB info from backend. Details: ${response.responseText}`);
        }
      },
      onerror: (error) => {
        reject(error);
      },
    });
  });
}

export function syncHltbExcludedGames() {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: "https://blaeoplus.kubikill.dev/hltb/excluded-games",
      nocache: true,
      responseType: "json",
      anonymous: true,
      onload: (response) => {
        if (response.status === 200) {
          GM_setValue("hltb-excluded-games", response.responseText);
          hltbExcludedGames = response.response;
          resolve(response.responseText);
        } else {
          reject(`Failed to fetch HLTB excluded games from backend. Details: ${response.responseText}`);
        }
      },
      onerror: (error) => {
        reject(error);
      },
    });
  });
}

export async function syncHltb() {
  let hltbGames = syncHltbGames();
  let hltbExcludedGames = syncHltbExcludedGames();

  await hltbGames;
  await hltbExcludedGames;

  hltbLastUpdate = new Date();
  GM_setValue("hltb-last-update", Date.now());
}

export function enqueueHltbData(games: Array<any>) {
  let libraryChunks = splitArrayIntoChunks(games, 100);

  for (let chunk of libraryChunks) {
    GM_xmlhttpRequest({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      url: "https://blaeoplus.kubikill.dev/hltb/enqueue-games",
      nocache: true,
      responseType: "json",
      anonymous: true,
      overrideMimeType: "application/json",
      data: JSON.stringify({
        games: chunk,
      }),
      onload: (response) => {
        if (response.status === 201) {
          console.log(`Successfully enqueued games. Games in HLTB queue: ${response.response.gamesInHltbQueue}`);
        } else {
          console.error(`Failed to enqueue library chunk. Details: ${response.responseText}`);
        }
      },
      onerror: (error) => {},
    });
  }
}

export function enqueueEntireLibrary() {
  if (userData.name) {
    getUserGames(userData.name);
  } else {
    return;
  }

  let libraryChunks = splitArrayIntoChunks(userData.games, 100);

  for (let chunk of libraryChunks) {
    let gameList = [];

    for (let game of chunk) {
      gameList.push({
        name: game.name,
        steamId: game.steam_id,
      });
    }

    GM_xmlhttpRequest({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      url: "https://blaeoplus.kubikill.dev/hltb/enqueue-games",
      nocache: true,
      responseType: "json",
      anonymous: true,
      overrideMimeType: "application/json",
      data: JSON.stringify({
        games: gameList,
      }),
      onload: (response) => {
        if (response.status === 201) {
          console.log("Successfully enqueued library chunk");
        } else {
          console.error(`Failed to enqueue library chunk. Details: ${response.responseText}`);
        }
      },
      onerror: (error) => {},
    });
  }
}
