import { writable } from "svelte/store";
import { mergeDeep } from "./utilities";
import { GM_getValue, GM_setValue } from "vite-plugin-monkey/dist/client";
import { BP_VERSION } from "@/globals";

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
        lists: {
          quickRearrange: true,
          automaticHltb: true,
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
      misc: {
        updateNotifier: true,
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

export const lastVersionStore = writable(getLastVersion());
lastVersionStore.subscribe((value) => {
  GM_setValue("bp-last-version", value);
});

let listBackups = JSON.parse(GM_getValue("bp-list-backups", "[]")) as ListBackup[];
export const listBackupStore = writable(listBackups);
listBackupStore.subscribe((value) => {
  GM_setValue("bp-list-backups", JSON.stringify(value));
});

let automaticHltbPresets = JSON.parse(GM_getValue("bp-automatic-hltb-presets", "[]")) as AutomaticHltbPreset[];
export const automaticHltbPresetsStore = writable(automaticHltbPresets);
automaticHltbPresetsStore.subscribe((value) => {
  GM_setValue("bp-automatic-hltb-presets", JSON.stringify(value));
});
