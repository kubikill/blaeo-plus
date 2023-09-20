import { GM_getValue, GM_xmlhttpRequest } from "vite-plugin-monkey/dist/client";
import { getAuthenticityToken } from "@/lib/utilities";
import type { SvelteComponent } from "svelte";

function getLastVersion() {
  let lastVersion = GM_getValue("bp-last-version", "");

  if (!lastVersion) {
    if (GM_getValue("bp-options", false)) {
      lastVersion = "1.0.4";
    } else {
      lastVersion = BP_VERSION;
    }
  }

  return lastVersion;
}

export const BP_VERSION = "1.1.0";

export const addedComponents = [] as SvelteComponent[];

export let optionsMenuComponent = {
  component: null as SvelteComponent | null,
};

export let lastVersion = getLastVersion();

export let userData = {
  name: "",
  games: [],
};

export let authenticityToken = getAuthenticityToken();

export function getUserName() {
  const blaeoProfileLink = document.querySelector('#navbar .navbar-right .btn-group a[href^="/users/"]') as HTMLAnchorElement;
  if (blaeoProfileLink) {
    const name = blaeoProfileLink.href.match(/\/users\/([\w+]+)$/);
    if (name) {
      userData.name = name[1];
    }
  }
}

export function getUserGames(name: string) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: `https://www.backlog-assassins.net/users/${name}/games.json`,
      nocache: true,
      responseType: "json",
      onload: (response) => {
        if (response.status === 200) {
          userData.games = response.response.games;
          resolve(response.response.games);
        } else {
          console.error(`Failed to fetch ${name}'s games from BLAEO. Details: ${response.responseText}`);
          reject(response);
        }
      },
      onerror: (error) => {
        console.error(`Failed to fetch ${name}'s games from BLAEO. Details: ${error}`);
        reject(error);
      },
    });
  });
}
