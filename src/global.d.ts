interface Window {
  updateOptions: function;
}

type TagOption = {
  label: string;
  color: string;
};

type BlaeoPlusSave = {
  name: string;
  content: string;
};

type Blacklist = {
  [key: string]: {
    note: string;
  };
};

type Options = {
  modules: {
    header: {
      shortcuts: boolean;
      uncategorizedGamesShortcut: boolean;
      missingGamesShortcut: boolean;
      mobileMessageBadge: boolean;
    };
    games: {
      filters: {
        progress: boolean;
        tags: boolean;
        modes: boolean;
        protonDbRatings: boolean;
        deckVerifiedStatuses: boolean;
        steamTags: boolean;
      };
      hltbIntegration: {
        enabled: boolean;
        displayColumns: {
          main: boolean;
          "+extra": boolean;
          "100%": boolean;
        };
        oneColumnMode: boolean;
        addHltbLinks: boolean;
      };
      protonDbIntegration: {
        enabled: boolean;
      };
      deckVerifiedIntegration: {
        enabled: boolean;
      };
      steamStoreIntegration: {
        enabled: boolean;
      };
      lists: {
        quickRearrange: boolean;
        automaticHltb: boolean;
      };
      other: {
        fullWidthTable: boolean;
        bulkRemoveMissingGames: boolean;
      };
    };
    posts: {
      mobileLayout: boolean;
    };
    newPosts: {
      saving: fboolean;
    };
    comments: {
      previews: boolean;
      mobileLayout: boolean;
    };
    users: {
      blacklist: {
        enabled: boolean;
        postBehavior: "none" | "hide" | "collapse" | "collapse-with-uncollapse";
        commentBehavior: "none" | "hide" | "collapse" | "collapse-with-uncollapse";
      };
    };
    misc: {
      updateNotifier: boolean;
    };
  };
  blacklist: Blacklist;
};

type QueryGame = {
  name: string;
  steamId: number;
};

type GameTypes = "sp" | "mp" | "coop";

type GameInfo = {
  [key: number]: {
    hltbId: number;
    type: GameTypes[];
    endless: boolean;
    avgComp: number;
    main?: number;
    mainCount?: number;
    extra?: number;
    extraCount?: number;
    everything?: number;
    everythingCount?: number;
    mp?: number;
    mpCount?: number;
    coop?: number;
    coopCount?: number;
  };
};

type DeckInfo = {
  type: "success" | "warning" | "unsupported" | "info";
  message: string;
};

type LinuxData = {
  protonDbRating: "unknown" | "no data" | "pending" | "borked" | "bronze" | "silver" | "gold" | "platinum";
  protonDbProvRating: "unknown" | "no data" | "pending" | "borked" | "bronze" | "silver" | "gold" | "platinum";
  protonDbReports: number;
  deckRating: "unknown" | "untested" | "unsupported" | "playable" | "verified";
  deckInfo: string;
};

type LinuxDataList = {
  [key: number]: LinuxData;
};

type SteamspyData = {
  tags: string[];
  posRevs: number;
  negRevs: number;
};

type SteamspyDataList = {
  [key: number]: SteamspyData;
};

type AutomaticHltbTagInfo = {
  playtime: number | string;
  maxPlaytime: number | string;
  tagId: array;
  games: any[];
  newGames: any[];
  oldList: BlaeoListJson | null;
};

type AutomaticHltbPreset = {
  name: string;
  mode: string;
  progresses: object;
  sortWholeList: boolean;
  listBy: "main" | "extra" | "everything";
  sortBy: string;
  sortByOrder: string;
  mpOnlyBehavior: string;
  endlessBehavior: string;
  gamesWithoutHltbBehavior: string;
  gamesWithoutHltbReportThreshold: string;
  mpOnlyList: array;
  endlessList: array;
  gamesWithoutHltbList: array;
  listArray: AutomaticHltbTagInfo[];
  mpOnlyListArray: AutomaticHltbTagInfo;
  endlessListArray: AutomaticHltbTagInfo;
  gamesWithoutHltbListArray: AutomaticHltbTagInfo;
};

type BlaeoGameEntry = {
  value?: any;
  id: string;
  steam_id: number;
  name: string;
  playtime: number;
  progress: string;
  achievements: {
    unlocked: number;
    total: number;
  };
};

type BlaeoGamesJson = BlaeoGameEntry[];

type BlaeoGamesSteamIdJson = {
  [key: string]: BlaeoGameEntry;
};

type BlaeoListGameEntry = {
  position: number;
  steam_id: number;
  name: string;
  playtime: number;
  progress: string;
};

type BlaeoListJson = {
  name: string;
  color: string;
  games: BlaeoListGameEntry[];
};

type ListBackup = {
  id: string;
  name: string;
  color: string;
  date: string;
  dateIso: string;
  games: BlaeoListGameEntry[];
};

interface JQuery<Element> {
  sortable_table(mode: string, columnIndex: number, order: boolean): null;
}

declare module "*.svelte" {
  export { SvelteComponentDev as default } from "svelte/internal";
}
