import { authenticityToken } from "@/globals";
import { GM_xmlhttpRequest } from "vite-plugin-monkey/dist/client";

export function getLists() {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: `https://www.backlog-assassins.net/settings/lists`,
      nocache: true,
      responseType: "document",
      onload: (response) => {
        if (response.status === 200) {
          const lists = [] as { id: string; name: string; color: string }[];

          const listEntries = response.response.querySelectorAll("table.lists-table[data-rearrange] tr[data-item]") as NodeListOf<HTMLTableRowElement>;
          for (let listEntry of listEntries) {
            lists.push({
              id: listEntry.getAttribute("data-item") as string,
              name: listEntry.querySelector("td:first-child > span")?.textContent?.trim() as string,
              color: listEntry.style.borderLeftColor,
            });
          }

          resolve(lists);
        } else {
          console.error(`Failed (probably) to get lists from BLAEO. Details: ${response.responseText}`);
          reject(response.responseText);
        }
      },
      onerror: (error) => {
        console.error(`Failed to get lists from BLAEO. Details: ${error}`);
        reject(error);
      },
    });
  });
}

export function getList(listId: string): Promise<BlaeoListJson> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: `https://www.backlog-assassins.net/lists/${listId}.json`,
      nocache: true,
      responseType: "json",
      onload: (response) => {
        if (response.status === 200) {
          resolve(response.response.list);
        } else {
          console.error(`Failed to get games from a BLAEO list. Details: ${response.responseText}`);
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
