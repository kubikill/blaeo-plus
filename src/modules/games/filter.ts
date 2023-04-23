import { hltbData } from "@/lib/hltbService";
import GameFilters from "@/modules/games/GameFilters.svelte";
import { addedComponents, options } from "@/globals";

function runFilters(
  games: NodeListOf<HTMLTableRowElement | HTMLDivElement | HTMLLIElement>,
  filters,
  progresses,
  gamesContainer
) {
  if (filters) {
    let tagFilters = [];
    let tagFilterString = "";
    let tagFilterType = false as "not-tags" | "tags" | false;
    let tagFilterAnd = false;
    let modeStrict = false;
    let modeNot = false;

    if (filters.tags.find((tag) => tag.value === "not-tags")) {
      tagFilterType = "not-tags";
    } else if (filters.tags.length > 0) {
      tagFilterType = "tags";
    }

    if (filters.tags.find((tag) => tag.value === "and-tags")) {
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

    if (filters.modes.find((mode) => mode.value === "strict")) {
      modeStrict = true;
    }

    if (filters.modes.find((mode) => mode.value === "not")) {
      modeNot = true;
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

      const steamStoreLink = game.querySelector('a[href*="store.steampowered.com/app/"]') as HTMLAnchorElement;
      const steamId = steamStoreLink.href.match(/app\/(\d+)/)[1];

      if (modeStrict) {
        if (
          JSON.stringify(hltbData[steamId]?.type ?? []) !=
          JSON.stringify(
            Array.from(
              filters.modes.filter((mode) => mode.value != "strict" && mode.value != "not"),
              (mode: any) => mode.value
            )
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

export function initFilter(isProgressPage) {
  const gamesTable = document.querySelector("table#games") as HTMLElement;
  const gamesList = document.querySelector("div#games") as HTMLElement;
  const gamesGrid = document.querySelector("#main > ul.games") as HTMLElement;

  let gamesContainer = gamesTable || gamesList || gamesGrid;
  let fallbackGamesList = false;

  if (!gamesContainer) {
    if (document.querySelector("#main > .game.game-media")) {
      gamesContainer = document.querySelector("#main") as HTMLElement;
      fallbackGamesList = true;
    } else {
      return;
    }
  }

  let checkInterval: ReturnType<typeof setInterval>;
  checkInterval = setInterval(() => {
    if (!gamesContainer.dataset.delayedLast) {
      if (gamesContainer) {
        const filterContainer = document.createElement("div");
        filterContainer.classList.add("bp-filters");

        if (fallbackGamesList) {
          const progressBar = gamesContainer.querySelector(".list-progress");
          progressBar.insertAdjacentElement("afterend", filterContainer);
        } else {
          gamesContainer.insertAdjacentElement("beforebegin", filterContainer);
        }

        const games = gamesContainer.querySelectorAll(".game") as NodeListOf<
          HTMLTableRowElement | HTMLDivElement | HTMLLIElement
        >;

        const tags = Array.from(gamesContainer.querySelectorAll("a.list-tag")) as HTMLAnchorElement[];
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

        gameStats["wont-play-percent"] = (
          Math.floor((gameStats["wont-play"] / gameStats["total"]) * 10000) / 100
        ).toFixed(2);
        gameStats["never-played-percent"] = (
          Math.floor((gameStats["never-played"] / gameStats["total"]) * 10000) / 100
        ).toFixed(2);
        gameStats["unfinished-percent"] = (
          Math.floor((gameStats["unfinished"] / gameStats["total"]) * 10000) / 100
        ).toFixed(2);
        gameStats["beaten-percent"] = (Math.floor((gameStats["beaten"] / gameStats["total"]) * 10000) / 100).toFixed(2);
        gameStats["completed-percent"] = (
          Math.floor((gameStats["completed"] / gameStats["total"]) * 10000) / 100
        ).toFixed(2);

        gameStats["uncategorized-percent"] = (
          Math.floor((gameStats["uncategorized"] / gameStats["total"]) * 10000) / 100
        ).toFixed(2);

        const filterOptions = {
          progresses: [] as string[],
          modes: [],
          availableTags: tagMap,
          tags: [],
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

        let showProgressFilter =
          options.modules.games.filters.progress && !document.querySelector("#main .list-progress") && !isProgressPage;
        let showTagsFilter = options.modules.games.filters.tags && !gamesGrid;
        let showModesFilter = options.modules.games.filters.modes && options.modules.games.hltbIntegration.enabled;

        const gameFilters = new GameFilters({
          target: filterContainer,
          props: {
            filters: filterOptions,
            gameStats: gameStats,
            progresses: progresses,
            modes: modes,
            showProgressFilter: showProgressFilter,
            showTagsFilter: showTagsFilter,
            showModesFilter: showModesFilter,
          },
        });

        addedComponents.push(gameFilters);

        gameFilters.$on("filters-changed", () => {
          runFilters(games, filterOptions, progresses, gamesContainer);
        });
      }

      clearInterval(checkInterval);
    }
  }, 200);
}
