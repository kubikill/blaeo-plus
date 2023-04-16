import { GM_getValue, GM_setValue, GM_xmlhttpRequest } from "vite-plugin-monkey/dist/client";
import { splitArrayIntoChunks } from "./utilities";
import { getUserGames, getUserName, userData } from "@/globals";

export let hltbExcludedGames = JSON.parse(GM_getValue("hltb-excluded-games", "{}") || "{}");

export let hltbData = JSON.parse(GM_getValue("hltb-data", "{}") || "{}");

export function syncHltbData() {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: "https://blaeoplus.kubikill.tk/hltb/game-list",
      nocache: true,
      responseType: "json",
      anonymous: true,
      onload: (response) => {
        if (response.status === 200) {
          GM_setValue("hltb-data", response.responseText);
          hltbData = response.response;
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
      url: "https://blaeoplus.kubikill.tk/hltb/excluded-games",
      nocache: true,
      responseType: "json",
      anonymous: true,
      onload: (response) => {
        if (response.status === 200) {
          GM_setValue("hltb-excludedgames", response.responseText);
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

export function enqueueHltbData(games: Array<any>) {
  let libraryChunks = splitArrayIntoChunks(games, 100);

  for (let chunk of libraryChunks) {
    GM_xmlhttpRequest({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      url: "https://blaeoplus.kubikill.tk/hltb/enqueue-games",
      nocache: true,
      responseType: "json",
      anonymous: true,
      overrideMimeType: "application/json",
      data: JSON.stringify({
        games: chunk,
      }),
      onload: (response) => {
        if (response.status === 201) {
          console.log(`Successfully enqueued games. Games in queue: ${response.response.gamesInQueue}`);
        } else {
          console.error(`Failed to enqueue library chunk. Details: ${response.responseText}`);
        }
      },
      onerror: (error) => {},
    });
  }
}

export function enqueueEntireLibrary() {
  getUserName();
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
      url: "https://blaeoplus.kubikill.tk/hltb/enqueue-games",
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
