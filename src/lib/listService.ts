import { authenticityToken } from "@/globals";
import { GM_xmlhttpRequest } from "vite-plugin-monkey/dist/client";

export function getGamesFromList(listId: string) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: `https://www.backlog-assassins.net/lists/${listId}.json`,
      nocache: true,
      responseType: "json",
      onload: (response) => {
        if (response.status === 200) {
          resolve(response.response);
        } else {
          console.error(`Failed (probably) to get games from a BLAEO list. Details: ${response.responseText}`);
          reject(response.responseText);
        }
      },
      onerror: (error) => {
        console.error(`Failed to get games from a BLAEO list. Details: ${error}`);
        reject(error);
      },
    });
  });
}

export function setList(listId: string, games: string[]) {
  let formData = new URLSearchParams();

  for (let game of games) {
    formData.append("games[]", game);
  }

  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "POST",
      url: `https://www.backlog-assassins.net/lists/${listId}/games`,
      nocache: true,
      responseType: "json",
      data: formData,
      headers: {
        "X-CSRF-Token": authenticityToken,
      },
      onload: (response) => {
        if (response.status === 200) {
          resolve(response.response);
        } else {
          console.error(`Failed (probably) to rearrange list ${listId}. Details: ${response.responseText}`);
          reject(response.responseText);
        }
      },
      onerror: (error) => {
        console.error(`Failed to rearrange list ${listId}. Details: ${error}`);
        reject(error);
      },
    });
  });
}
