import { writable } from "svelte/store";
import { mergeDeep } from "./utilities";
import { GM_getValue, GM_setValue } from "vite-plugin-monkey/dist/client";

let options = mergeDeep(
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
      users: {
        blacklist: {
          enabled: true,
          postBehavior: "hide",
          commentBehavior: "hide",
        },
      },
    },
    blacklist: {},
  },
  JSON.parse(GM_getValue("bp-options", "{}")),
) as Options;

export const optionsStore = writable(options);

optionsStore.subscribe((value) => {
  GM_setValue("bp-options", JSON.stringify(value));
});
