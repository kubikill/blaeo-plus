import { GM_xmlhttpRequest, GM_getValue } from "vite-plugin-monkey/dist/client";
import { mergeDeep } from "@/lib/utilities";
import packageJson from "../package.json";

export const BP_VERSION = packageJson.version;

export const addedComponents = [];

export const options = mergeDeep(
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
        },
        hltbIntegration: {
          enabled: true,
          displayColumns: {
            main: true,
            "+extra": true,
            "100%": true,
          },
          addHltbLinks: true,
        },
      },
      posts: {
        mobileLayout: true,
      },
      newPosts: {
        saving: false,
      },
      comments: {
        previews: true,
        mobileLayout: true,
      },
    },
  },
  JSON.parse(GM_getValue("bp-options", "{}"))
);

export let userData = {
  name: "",
  games: [],
};

export function getUserName() {
  const blaeoProfileLink = document.querySelector(
    '#navbar .navbar-right .btn-group a[href^="/users/"]'
  ) as HTMLAnchorElement;
  if (blaeoProfileLink) {
    userData.name = blaeoProfileLink.href.match(/\/users\/([\w+]+)$/)[1];
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
