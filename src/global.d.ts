interface Window {
  updateOptions: Function;
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
        steamOsStatuses: boolean;
        steamMachineStatuses: boolean;
        steamFrameStatuses: boolean;
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
        reportButtons: boolean;
      };
      protonDbIntegration: {
        enabled: boolean;
      };
      deckVerifiedIntegration: {
        enabled: boolean;
      };
      steamOsIntegration: {
        enabled: boolean;
      };
      steamMachineIntegration: {
        enabled: boolean;
      };
      steamFrameIntegration: {
        enabled: boolean;
      };
      steamStoreIntegration: {
        enabled: boolean;
        hideTagsForProgress: Record<import("./modules/games/filterTypes").Progress, boolean>;
      };
      steamHuntersIntegration: {
        enabled: boolean;
        addSteamHuntersLinks: boolean;
      };
      lists: {
        quickRearrange: boolean;
        rearrangeButtons: boolean;
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
      saving: boolean;
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

type HltbTimeField = "main" | "extra" | "everything" | "mp" | "coop";

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
  deckRating: CompatibilityRating;
  deckInfo: string;
};

type CompatibilityRating = "unknown" | "untested" | "unsupported" | "playable" | "verified";

type CompatibilityDeviceId = "deck" | "steamos" | "steammachine" | "steamframe";

type DeviceCompatibility = {
  rating: CompatibilityRating;
  info: string;
};

type DeviceCompatibilityList = {
  [key: number]: DeviceCompatibility;
};

type LinuxDataList = {
  [key: number]: LinuxData;
};

type SteamspyData = {
  tags: string[] | string;
};

type SteamHuntersData = {
  /** Median time to perfect the game, in minutes */
  median: number | null;
  /** Number of players who perfected the game */
  perfected: number;
};

type SteamHuntersDataList = {
  [key: number]: SteamHuntersData;
};

type SteamspyDataList = {
  [key: number]: SteamspyData;
};

type AutomaticHltbTagInfo = {
  games: BlaeoGameEntry[];
  newGames: BlaeoGameEntry[];
  oldList: BlaeoListJson | null;
};

type BlaeoListOption = { label: string; value: string; color: string };

type AutomaticHltbTimeList = {
  playtime: number | string;
  maxPlaytime: number | string;
  tagId: BlaeoListOption[];
};

type ListMakerGameTime = {
  seconds: number;
  count: number;
  label: string;
};

type AutomaticHltbPreset = {
  name: string;
  mode: string;
  progresses: Record<string, boolean>;
  sortWholeList: boolean;
  listBy: "main" | "extra" | "everything" | "steamhunters";
  sortBy: string;
  sortByOrder: string;
  ignoreLeadingArticles?: boolean;
  mpOnlyBehavior: string;
  endlessBehavior: string;
  fallbackTime: "none" | "main" | "extra" | "everything" | "allplaystyles" | "steamhunters";
  noTimeBehavior: string;
  minHltbReports: string;
  minSteamHuntersPlayers: string;
  mpOnlyList: BlaeoListOption[];
  endlessList: BlaeoListOption[];
  noTimeList: BlaeoListOption[];
  whitelistLists?: BlaeoListOption[];
  blacklistLists?: BlaeoListOption[];
  listFilterPriority?: "whitelist" | "blacklist";
  listArray: AutomaticHltbTimeList[];
};

type BlaeoGameEntry = {
  id: string;
  steam_id: number;
  name: string;
  playtime: number;
  progress: string;
  achievements?: {
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
