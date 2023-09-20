type TagOption = {
  label: string;
  color: string;
};

type BlaeoPlusSave = {
  name: string;
  content: string;
};

type Options = {
  modules: {
    header: {
      shortcuts: boolean;
      mobileMessageBadge: boolean;
    };
    games: {
      filters: {
        progress: boolean;
        tags: boolean;
        modes: boolean;
        protonDbRatings: boolean;
        deckVerifiedStatuses: boolean;
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
        addProtonDbLinks: boolean;
      };
      deckVerifiedIntegration: {
        enabled: boolean;
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
  };
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

interface JQuery<Element> {
  sortable_table(mode: string, columnIndex: number, order: boolean): null;
}

declare module "*.svelte" {
  export { SvelteComponentDev as default } from "svelte/internal";
}
