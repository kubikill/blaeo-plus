import { hltbData } from "@/lib/hltbService";
import GameFilters from "@/modules/games/GameFilters.svelte";
import { addedComponents } from "@/globals";
import { optionsStore } from "@/lib/store";
import { get } from "svelte/store";
import { getGamesContainer, waitUntilGamesContainerLoaded } from "@/lib/waitUntilGamesContainerLoaded";

let options = get(optionsStore) as Options;
optionsStore.subscribe((value) => {
  options = value;
});

function runFilters(games: NodeListOf<HTMLTableRowElement | HTMLDivElement | HTMLLIElement>, filters: any, progresses: any, gamesContainer: HTMLElement) {
  if (filters) {
    let tagFilters = [];
    let tagFilterString = "";
    let tagFilterType = false as "not-tags" | "tags" | false;
    let tagFilterAnd = false;
    let modeStrict = false;
    let modeNot = false;
    let includeProtonDbProvisional = false;
    let steamTagFilters = [];
    let steamTagFilterString = "";
    let steamTagFilterType = false as "not-tags" | "tags" | false;
    let steamTagFilterAnd = false;

    if (filters.tags.find((tag: { value: string }) => tag.value === "not-tags")) {
      tagFilterType = "not-tags";
    } else if (filters.tags.length > 0) {
      tagFilterType = "tags";
    }

    if (filters.tags.find((tag: { value: string }) => tag.value === "and-tags")) {
      tagFilterAnd = true;
    }

    if (tagFilterType) {
      for (let tag of filters.tags) {
        if (tag.value != "not-tags" && tag.value != "and-tags") {
          tagFilters.push(`[href$="${tag.value}"]`);
        }
      }

      tagFilterString = tagFilters.join(", ");
    }

    if (filters.modes.find((mode: { value: string }) => mode.value === "strict")) {
      modeStrict = true;
    }

    if (filters.modes.find((mode: { value: string }) => mode.value === "not")) {
      modeNot = true;
    }

    if (filters.steamTags.find((tag: { value: string }) => tag.value === "not-steam-tags")) {
      steamTagFilterType = "not-tags";
    } else if (filters.steamTags.length > 0) {
      steamTagFilterType = "tags";
    }

    if (filters.steamTags.find((tag: { value: string }) => tag.value === "and-steam-tags")) {
      steamTagFilterAnd = true;
    }

    if (steamTagFilterType) {
      for (let tag of filters.steamTags) {
        if (tag.value != "not-steam-tags" && tag.value != "and-steam-tags") {
          steamTagFilters.push(`[data-steam-tag$="${tag.value}"]`);
        }
      }

      steamTagFilterString = steamTagFilters.join(", ");
    }

    if (filters.protonDbRatings.find((rating: { value: string }) => rating.value === "provisional")) {
      includeProtonDbProvisional = true;
    }

    gameLoop: for (let game of games) {
      switch (tagFilterType) {
        case "tags":
          if (tagFilterAnd) {
            for (let tag of tagFilters) {
              if (!game.querySelector(tag)) {
                game.style.display = "none";
                continue gameLoop;
              }
            }
          } else {
            if (!game.querySelector(tagFilterString)) {
              game.style.display = "none";
              continue;
            }
          }

          break;
        case "not-tags":
          if (tagFilterString) {
            if (tagFilterAnd) {
              for (let tag of tagFilters) {
                if (!game.querySelector(tag)) {
                  game.style.display = "";
                  continue gameLoop;
                }
              }
              game.style.display = "none";
              continue;
            } else {
              if (game.querySelector(tagFilterString)) {
                game.style.display = "none";
                continue;
              }
            }
          } else {
            if (game.querySelector(".list-tag")) {
              game.style.display = "none";
              continue;
            }
          }
      }

      switch (steamTagFilterType) {
        case "tags":
          if (steamTagFilterAnd) {
            for (let tag of steamTagFilters) {
              if (!game.querySelector(tag)) {
                game.style.display = "none";
                continue gameLoop;
              }
            }
          } else {
            if (!game.querySelector(steamTagFilterString)) {
              game.style.display = "none";
              continue;
            }
          }

          break;
        case "not-tags":
          if (steamTagFilterString) {
            if (steamTagFilterAnd) {
              for (let tag of steamTagFilters) {
                if (!game.querySelector(tag)) {
                  game.style.display = "";
                  continue gameLoop;
                }
              }
              game.style.display = "none";
              continue;
            } else {
              if (game.querySelector(steamTagFilterString)) {
                game.style.display = "none";
                continue;
              }
            }
          } else {
            if (game.querySelector(".list-tag")) {
              game.style.display = "none";
              continue;
            }
          }
      }

      const steamStoreLink = game.querySelector('a[href*="store.steampowered.com/app/"]') as HTMLAnchorElement;
      const steamId = +steamStoreLink!.href!.match(/app\/(\d+)/)![1];

      if (modeStrict) {
        if (
          JSON.stringify(hltbData[steamId]?.type ?? []) !=
          JSON.stringify(
            Array.from(
              filters.modes.filter((mode: { value: string }) => mode.value != "strict" && mode.value != "not"),
              (mode: any) => mode.value,
            ),
          )
        ) {
          game.style.display = "none";
          continue gameLoop;
        }
      } else if (modeNot) {
        for (let mode of filters.modes) {
          if (hltbData[steamId]?.type?.includes(mode.value)) {
            game.style.display = "none";
            continue gameLoop;
          }
        }
      } else {
        for (let mode of filters.modes) {
          if (!hltbData[steamId]?.type?.includes(mode.value)) {
            game.style.display = "none";
            continue gameLoop;
          }
        }
      }

      let protonRatingFound = false;
      let protonDbRatings = Array.from(
        filters.protonDbRatings.filter((rating: { value: string }) => rating.value != "provisional"),
        (rating: any) => rating.value,
      );

      if (protonDbRatings.length > 0) {
        for (let rating of protonDbRatings) {
          const ratingElement = game.querySelector(`.bp-protondb-rating-${rating}`);
          if (ratingElement && (includeProtonDbProvisional || !game.querySelector(`.bp-protondb-rating-provisional`))) {
            protonRatingFound = true;
            break;
          }
        }
        if (!protonRatingFound) {
          game.style.display = "none";
          continue gameLoop;
        }
      }

      let deckVerifiedStatusFound = false;
      let deckVerifiedStatuses = Array.from(filters.deckVerifiedStatuses, (status: any) => status.value);

      if (deckVerifiedStatuses.length > 0) {
        for (let status of deckVerifiedStatuses) {
          const statusBadge = game.querySelector(`.bp-deckverified-${status}`);
          if (statusBadge) {
            deckVerifiedStatusFound = true;
            break;
          }
        }
        if (!deckVerifiedStatusFound) {
          game.style.display = "none";
          continue gameLoop;
        }
      }

      game.style.display = "";
    }
  }

  if (progresses["wont-play"]) {
    gamesContainer.classList.remove("hide-wont-play");
  } else {
    gamesContainer.classList.add("hide-wont-play");
  }

  if (progresses["never-played"]) {
    gamesContainer.classList.remove("hide-never-played");
  } else {
    gamesContainer.classList.add("hide-never-played");
  }

  if (progresses["unfinished"]) {
    gamesContainer.classList.remove("hide-unfinished");
  } else {
    gamesContainer.classList.add("hide-unfinished");
  }

  if (progresses["beaten"]) {
    gamesContainer.classList.remove("hide-beaten");
  } else {
    gamesContainer.classList.add("hide-beaten");
  }

  if (progresses["completed"]) {
    gamesContainer.classList.remove("hide-completed");
  } else {
    gamesContainer.classList.add("hide-completed");
  }

  if (progresses["uncategorized"]) {
    gamesContainer.classList.remove("hide-uncategorized");
  } else {
    gamesContainer.classList.add("hide-uncategorized");
  }
}

export async function initFilter(isProgressPage: boolean) {
  let gamesContainer = getGamesContainer();

  if (!gamesContainer) {
    return;
  }

  await waitUntilGamesContainerLoaded();

  const filterContainer = document.createElement("div");
  filterContainer.classList.add("bp-filters");

  if (gamesContainer.container.id === "main") {
    const progressBar = gamesContainer.container.querySelector(".list-progress");
    if (progressBar) {
      progressBar.insertAdjacentElement("afterend", filterContainer);
    }
  } else {
    gamesContainer.container.insertAdjacentElement("beforebegin", filterContainer);
  }

  const games = gamesContainer.container.querySelectorAll(".game") as NodeListOf<HTMLTableRowElement | HTMLDivElement | HTMLLIElement>;

  const tags = Array.from(gamesContainer.container.querySelectorAll("a.list-tag")) as HTMLAnchorElement[];
  const tagMap = new Map([
    [
      "and-tags",
      {
        label: "AND selected tags",
        color: "#FFFFFF",
      },
    ],
    [
      "not-tags",
      {
        label: "NOT selected tags",
        color: "#000000",
      },
    ],
  ]) as Map<string, TagOption>;

  for (let tag of tags) {
    tagMap.set(tag.href.slice(tag.href.indexOf("/lists") + 7), {
      label: tag.textContent ?? "",
      color: tag.style.backgroundColor,
    });
  }

  const steamTags = Array.from(gamesContainer.container.getElementsByClassName("bp-steam-tag")) as HTMLElement[];

  const steamTagMap = new Map([
    [
      "and-steam-tags",
      {
        label: "AND selected tags",
        color: "#FFFFFF",
      },
    ],
    [
      "not-steam-tags",
      {
        label: "NOT selected tags",
        color: "#000000",
      },
    ],
  ]) as Map<string, TagOption>;

  for (let tag of steamTags) {
    steamTagMap.set(tag.textContent ?? "", {
      label: tag.textContent ?? "",
      color: "#000000",
    });
  }

  const gameStats = {
    "wont-play": 0,
    "wont-play-percent": "",
    "never-played": 0,
    "never-played-percent": "",
    unfinished: 0,
    "unfinished-percent": "",
    beaten: 0,
    "beaten-percent": "",
    completed: 0,
    "completed-percent": "",
    uncategorized: 0,
    "uncategorized-percent": "",
    total: 0,
  };

  for (let game of games) {
    gameStats.total++;

    if (game.classList.contains("game-wont-play")) {
      gameStats["wont-play"]++;
    }

    if (game.classList.contains("game-never-played")) {
      gameStats["never-played"]++;
    }

    if (game.classList.contains("game-unfinished")) {
      gameStats.unfinished++;
    }

    if (game.classList.contains("game-beaten")) {
      gameStats.beaten++;
    }

    if (game.classList.contains("game-completed")) {
      gameStats.completed++;
    }

    if (game.classList.contains("game-uncategorized")) {
      gameStats.uncategorized++;
    }
  }

  gameStats["wont-play-percent"] = (Math.floor((gameStats["wont-play"] / gameStats["total"]) * 10000) / 100).toFixed(2);
  gameStats["never-played-percent"] = (Math.floor((gameStats["never-played"] / gameStats["total"]) * 10000) / 100).toFixed(2);
  gameStats["unfinished-percent"] = (Math.floor((gameStats["unfinished"] / gameStats["total"]) * 10000) / 100).toFixed(2);
  gameStats["beaten-percent"] = (Math.floor((gameStats["beaten"] / gameStats["total"]) * 10000) / 100).toFixed(2);
  gameStats["completed-percent"] = (Math.floor((gameStats["completed"] / gameStats["total"]) * 10000) / 100).toFixed(2);

  gameStats["uncategorized-percent"] = (Math.floor((gameStats["uncategorized"] / gameStats["total"]) * 10000) / 100).toFixed(2);

  const filterOptions = {
    progresses: [] as string[],
    modes: [],
    availableTags: tagMap,
    tags: [],
    availableSteamTags: steamTagMap,
    steamTags: [],
    protonDbRatings: [] as string[],
    deckVerifiedStatuses: [] as string[],
  };

  const progresses = {
    "wont-play": true,
    "never-played": true,
    unfinished: true,
    beaten: true,
    completed: true,
    uncategorized: true,
  };

  const modes = [
    {
      label: "Strict checking",
      value: "strict",
      color: "#000000",
      sortValue: 1,
    },
    {
      label: "NOT selected modes",
      value: "not",
      color: "#000000",
      sortValue: 2,
    },
    {
      label: "Singleplayer",
      value: "sp",
      color: "transparent",
      sortValue: 3,
    },
    {
      label: "Multiplayer",
      value: "mp",
      color: "transparent",
      sortValue: 4,
    },
    {
      label: "Co-op",
      value: "coop",
      color: "transparent",
      sortValue: 5,
    },
  ];

  const protonDbRatings = [
    {
      label: "Include provisional ratings",
      value: "provisional",
      color: "#000000",
      sortValue: 0,
    },
    {
      label: "Platinum",
      value: "platinum",
      color: "#b4c7dc",
      sortValue: 1,
    },
    {
      label: "Gold",
      value: "gold",
      color: "#cfb53b",
      sortValue: 2,
    },
    {
      label: "Silver",
      value: "silver",
      color: "#a6a6a6",
      sortValue: 3,
    },
    {
      label: "Bronze",
      value: "bronze",
      color: "#cd7f32",
      sortValue: 4,
    },
    {
      label: "Borked",
      value: "borked",
      color: "#ff0000",
      sortValue: 5,
    },
    {
      label: "No data",
      value: "no-data",
      color: "#444444",
      sortValue: 6,
    },
  ];

  const deckVerifiedStatuses = [
    {
      label: "Verified",
      value: "verified",
      color: "#59bf40",
      sortValue: 1,
    },
    {
      label: "Playable",
      value: "playable",
      color: "#ffc82c",
      sortValue: 2,
    },
    {
      label: "Unsupported",
      value: "unsupported",
      color: "#8c8e8f",
      sortValue: 3,
    },
    {
      label: "Untested",
      value: "untested",
      color: "#8c8e8f",
      sortValue: 4,
    },
  ];

  let showProgressFilter = options.modules.games.filters.progress && !document.querySelector("#main .list-progress") && !isProgressPage;
  let showTagsFilter = options.modules.games.filters.tags && gamesContainer.type !== "grid";
  let showModesFilter = options.modules.games.filters.modes && options.modules.games.hltbIntegration.enabled;
  let showProtonDbFilter = options.modules.games.filters.protonDbRatings && options.modules.games.protonDbIntegration.enabled;
  let showDeckVerifiedFilter = options.modules.games.filters.deckVerifiedStatuses && options.modules.games.deckVerifiedIntegration.enabled;
  let showSteamTagsFilter = options.modules.games.filters.steamTags && options.modules.games.steamStoreIntegration.enabled;

  const gameFilters = new GameFilters({
    target: filterContainer,
    props: {
      filters: filterOptions,
      gameStats: gameStats,
      progresses: progresses,
      modes: modes,
      protonDbRatings: protonDbRatings,
      deckVerifiedStatuses: deckVerifiedStatuses,
      showProgressFilter: showProgressFilter,
      showTagsFilter: showTagsFilter,
      showModesFilter: showModesFilter,
      showProtonDbFilter: showProtonDbFilter,
      showDeckVerifiedFilter: showDeckVerifiedFilter,
      showSteamTagsFilter: showSteamTagsFilter,
    },
  });

  addedComponents.push(gameFilters);

  gameFilters.$on("filters-changed", () => {
    runFilters(games, filterOptions, progresses, gamesContainer.container);
  });
}
