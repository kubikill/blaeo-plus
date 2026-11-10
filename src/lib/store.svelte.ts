import { mergeDeep, tryJsonParse } from "./utilities";
import { GM_getValue, GM_setValue } from "vite-plugin-monkey/dist/client";
import { BP_VERSION } from "@/globals";

function persisted<T extends object>(key: string, initial: T, serialize: (value: T) => unknown = (value) => JSON.stringify(value)): T {
  const state = $state(initial);

  $effect.root(() => {
    $effect(() => {
      GM_setValue(key, serialize(state));
    });
  });

  return state;
}

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

export const options = persisted(
  "bp-options",
  mergeDeep(
    {
      modules: {
        header: {
          shortcuts: true,
          uncategorizedGamesShortcut: true,
          missingGamesShortcut: true,
          mobileMessageBadge: true,
        },
        games: {
          filters: {
            progress: true,
            tags: true,
            modes: true,
            protonDbRatings: true,
            deckVerifiedStatuses: true,
            steamOsStatuses: true,
            steamMachineStatuses: true,
            steamFrameStatuses: true,
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
            reportButtons: true,
          },
          protonDbIntegration: {
            enabled: false,
          },
          deckVerifiedIntegration: {
            enabled: false,
          },
          steamOsIntegration: {
            enabled: false,
          },
          steamMachineIntegration: {
            enabled: false,
          },
          steamFrameIntegration: {
            enabled: false,
          },
          steamStoreIntegration: {
            enabled: false,
            hideTagsForProgress: {
              "wont-play": false,
              "never-played": false,
              unfinished: false,
              beaten: false,
              completed: false,
              uncategorized: false,
            },
          },
          steamHuntersIntegration: {
            enabled: false,
            addSteamHuntersLinks: true,
          },
          lists: {
            quickRearrange: true,
            rearrangeButtons: true,
            automaticHltb: true,
          },
          other: {
            bulkRemoveMissingGames: true,
            fullWidthTable: false,
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
    tryJsonParse(GM_getValue("bp-options", "{}"), {}),
  ) as Options,
);

export const lastVersion = persisted("bp-last-version", { value: getLastVersion() as string }, (state) => state.value);

export const lastChangelogVersion = persisted("bp-last-changelog-version", { value: (GM_getValue("bp-last-changelog-version", "") || getLastVersion()) as string }, (state) => state.value);

export const listBackups = persisted("bp-list-backups", tryJsonParse<ListBackup[]>(GM_getValue("bp-list-backups", "[]"), []));

export const automaticHltbPresets = persisted("bp-automatic-hltb-presets", tryJsonParse<AutomaticHltbPreset[]>(GM_getValue("bp-automatic-hltb-presets", "[]"), []));

export const cacheUpdates = $state({
  excludedGames: new Date(GM_getValue("hltb-last-update", 0)),
});

$effect.root(() => {
  $effect(() => {
    GM_setValue("hltb-last-update", cacheUpdates.excludedGames.getTime());
  });
});

export function markCacheUpdated(cache: keyof typeof cacheUpdates) {
  cacheUpdates[cache] = new Date();
}
