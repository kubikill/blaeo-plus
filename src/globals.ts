import { GM_xmlhttpRequest } from "vite-plugin-monkey/dist/client";
import { getAuthenticityToken } from "@/lib/utilities";
import type { SvelteComponent } from "svelte";

export const BP_VERSION = "1.2.3";
export const SUPPORT_URL = "https://steamcommunity.com/groups/attackyourbacklog/discussions/1/7155698768546603592/";

export const addedComponents = [] as SvelteComponent[];

export let optionsMenuComponent = {
  component: null as SvelteComponent | null,
};

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

export function getUserGames(name: string): Promise<BlaeoGamesJson> {
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
