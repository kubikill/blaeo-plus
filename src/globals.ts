import { GM_xmlhttpRequest, GM_getValue } from "vite-plugin-monkey/dist/client";
import { getAuthenticityToken, mergeDeep } from "@/lib/utilities";
import type { SvelteComponent } from "svelte";

export const BP_VERSION = "1.1.0";

export const addedComponents = [] as SvelteComponent[];

export let options = mergeDeep(
  {
    modules: {
      header: {
        shortcuts: true,
        mobileMessageBadge: true,
      },
      games: {
        filters: {
          progress: true,
          tags: true,
          modes: true,
          protonDbRatings: true,
          deckVerifiedStatuses: true,
        },
        hltbIntegration: {
          enabled: true,
          displayColumns: {
            main: true,
            "+extra": true,
            "100%": true,
          },
          oneColumnMode: false,
          addHltbLinks: true,
        },
        protonDbIntegration: {
          enabled: false,
          addProtonDbLink: true,
        },
        deckVerifiedIntegration: {
          enabled: false,
        },
      },
      posts: {
        mobileLayout: true,
      },
      newPosts: {
        saving: true,
      },
      comments: {
        previews: true,
        mobileLayout: true,
      },
    },
  },
  JSON.parse(GM_getValue("bp-options", "{}")),
) as Options;

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
