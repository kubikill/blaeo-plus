import { hltbLogo } from "@/assets/icons";
import { options } from "@/globals";
import { enqueueHltbData, hltbExcludedGames, hltbData } from "@/lib/hltbService";
import { removeAllNodesIfExist } from "@/lib/utilities";

function getHltbGameData(steamId) {
  let gameData = {
    mainCompString: "Unknown",
    extraCompString: "Unknown",
    everythingCompString: "Unknown",
    mpCompString: "",
    coopCompString: "",
    gameObj: null as any,
    gameStatus: "Unknown",
  };

  if (hltbExcludedGames.includes(+steamId)) {
    gameData.mainCompString = gameData.extraCompString = gameData.everythingCompString = "N/A";
  } else if (hltbData && hltbData[steamId]) {
    if (hltbData[steamId].hltbId != -1) {
      gameData.gameObj = hltbData[steamId];
      gameData.mainCompString = gameData.extraCompString = gameData.everythingCompString = "No data";
    } else {
      gameData.mainCompString = gameData.extraCompString = gameData.everythingCompString = "Not on HLTB";
    }
  }

  if (gameData.gameObj) {
    if (gameData.gameObj?.type?.includes("sp")) {
      if (gameData.gameObj?.main) {
        let mainCompHours = Math.floor(+gameData.gameObj.main / 3600);
        let mainCompMinutes = Math.floor((+gameData.gameObj.main % 3600) / 60);

        let countWarning = "";
        if (gameData.gameObj.mainCount <= 10) {
          countWarning = "!";
        } else if (gameData.gameObj.mainCount <= 100) {
          countWarning = "~";
        }

        gameData.mainCompString = `${countWarning}${mainCompHours}h ${mainCompMinutes}min`;
      }

      if (gameData.gameObj?.extra) {
        let extraCompHours = Math.floor(+gameData.gameObj.extra / 3600);
        let extraCompMinutes = Math.floor((+gameData.gameObj.extra % 3600) / 60);

        let countWarning = "";
        if (gameData.gameObj.extraCount <= 10) {
          countWarning = "!";
        } else if (gameData.gameObj.extraCount <= 100) {
          countWarning = "~";
        }

        gameData.extraCompString = `${countWarning}${extraCompHours}h ${extraCompMinutes}min`;
      }

      if (gameData.gameObj?.everything) {
        let everythingCompHours = Math.floor(+gameData.gameObj.everything / 3600);
        let everythingCompMinutes = Math.floor((+gameData.gameObj.everything % 3600) / 60);

        let countWarning = "";
        if (gameData.gameObj.everythingCount <= 10) {
          countWarning = "!";
        } else if (gameData.gameObj.everythingCount <= 100) {
          countWarning = "~";
        }

        gameData.everythingCompString = `${countWarning}${everythingCompHours}h ${everythingCompMinutes}min`;
      }
    }
    if (gameData.gameObj?.type?.includes("mp")) {
      if (gameData.gameObj.mp) {
        let mpCompHours = Math.floor(+gameData.gameObj.mp / 3600);
        let mpCompMinutes = Math.floor((+gameData.gameObj.mp % 3600) / 60);

        let countWarning = "";
        if (gameData.gameObj.mpCount <= 10) {
          countWarning = "!";
        } else if (gameData.gameObj.mpCount <= 100) {
          countWarning = "~";
        }
        gameData.mpCompString = `${countWarning}${mpCompHours}h ${mpCompMinutes}min`;
      } else {
        gameData.mpCompString = `No data`;
      }
    }
    if (gameData.gameObj?.type?.includes("coop")) {
      if (gameData.gameObj.coop) {
        let coopCompHours = Math.floor(+gameData.gameObj.coop / 3600);
        let coopCompMinutes = Math.floor((+gameData.gameObj.coop % 3600) / 60);

        let countWarning = "";
        if (gameData.gameObj.coopCount <= 10) {
          countWarning = "!";
        } else if (gameData.gameObj.coopCount <= 100) {
          countWarning = "~";
        }
        gameData.coopCompString = `${countWarning}${coopCompHours}h ${coopCompMinutes}min`;
      } else {
        gameData.coopCompString = `No data`;
      }
    }
  } else {
    gameData.gameStatus = hltbExcludedGames.includes(+steamId) ? "N/A" : hltbData[steamId] ? "Not on HLTB" : "Unknown";
  }

  return gameData;
}

function getHltbHtml(steamId: string, mode: string) {
  let gameData = getHltbGameData(steamId);
  switch (mode) {
    case "table":
      return getHltbTableHtml(steamId, gameData);
    case "list":
      return getHltbListHtml(steamId, gameData);
  }
}

function getHltbTableHtml(steamId: string, gameData: any) {
  let html = "";

  if (gameData.gameObj) {
    if (gameData.gameObj.type.includes("sp")) {
      if (options.modules.games.hltbIntegration.displayColumns.main) {
        html += `
          <td class="text-right bp-hltb-element" data-value="${
            hltbExcludedGames.includes(+steamId) ? -2 : null ?? gameData.gameObj?.main ?? -1
          }">
            <div title="based on ${gameData.gameObj?.mainCount ?? 0} report(s)">${gameData.mainCompString}</div>
          </td>
        `;
      }

      if (options.modules.games.hltbIntegration.displayColumns["+extra"]) {
        html += `
        <td class="text-right bp-hltb-element" data-value="${
          hltbExcludedGames.includes(+steamId) ? -2 : null ?? gameData.gameObj?.extra ?? -1
        }">
          <div title="based on ${gameData.gameObj?.extraCount ?? 0} report(s)">${gameData.extraCompString}</div>
        </td>
        `;
      }

      if (options.modules.games.hltbIntegration.displayColumns["100%"]) {
        html += `
            <td class="text-right bp-hltb-element" data-value="${
              hltbExcludedGames.includes(+steamId) ? -2 : null ?? gameData.gameObj?.everything ?? -1
            }">
              <div title="based on ${gameData.gameObj?.everythingCount ?? 0} report(s)">${
          gameData.everythingCompString
        }</div>
            </td>
            `;
      }
    } else {
      html += `
        <td class="text-center bp-hltb-element" colspan="3" data-value="${
          hltbExcludedGames.includes(+steamId) ? -2 : null ?? gameData.gameObj?.mp ?? -1
        }">`;

      if (gameData.gameObj.type.includes("mp")) {
        html += `<span title="based on ${gameData.gameObj?.mpCount ?? 0} report(s)">MP: ${
          gameData.mpCompString
        } </span>`;
      }

      if (gameData.gameObj.type.includes("coop")) {
        html += `<span title="based on ${gameData.gameObj?.coopCount ?? 0} report(s)">Co-op: ${
          gameData.coopCompString
        }</span>`;
      }

      html += `</td>`;
    }
  } else {
    if (options.modules.games.hltbIntegration.displayColumns.main) {
      html += `
      <td class="text-right bp-hltb-element" data-value="${hltbExcludedGames.includes(+steamId) ? -2 : -1}">
        <div>${gameData.gameStatus}</div>
      </td>
    `;
    }

    if (options.modules.games.hltbIntegration.displayColumns["+extra"]) {
      html += `
      <td class="text-right bp-hltb-element" data-value="${hltbExcludedGames.includes(+steamId) ? -2 : -1}">
        <div>${gameData.gameStatus}</div>
      </td>
    `;
    }

    if (options.modules.games.hltbIntegration.displayColumns["100%"]) {
      html += `
      <td class="text-right bp-hltb-element" data-value="${hltbExcludedGames.includes(+steamId) ? -2 : -1}">
        <div>${gameData.gameStatus}</div>
      </td>
    `;
    }
  }

  return html;
}

function getHltbListHtml(steamId: string, gameData: any) {
  let html = `<div class="bp-list-hltb-info">`;

  if (gameData.gameObj) {
    if (gameData.gameObj.type.includes("sp")) {
      if (options.modules.games.hltbIntegration.displayColumns.main) {
        html += `
          <div class="bp-hltb-element" title="based on ${gameData.gameObj?.mainCount ?? 0} report(s)">
            <div>Main: ${gameData.mainCompString}</div>
          </div>
        `;
      }

      if (options.modules.games.hltbIntegration.displayColumns["+extra"]) {
        html += `
          <div class="bp-hltb-element" title="based on ${gameData.gameObj?.extraCount ?? 0} report(s)">
            <div>+Extra: ${gameData.extraCompString}</div>
          </div>
        `;
      }

      if (options.modules.games.hltbIntegration.displayColumns["100%"]) {
        html += `
          <div class="bp-hltb-element" title="based on ${gameData.gameObj?.everythingCount ?? 0} report(s)">
            <div>100%: ${gameData.everythingCompString}</div>
          </div>
        `;
      }
    } else {
      if (gameData.gameObj.type.includes("mp")) {
        html += `
          <div class="bp-hltb-element" title="based on ${gameData.gameObj?.mpCount ?? 0} report(s)">
            MP: ${gameData.mpCompString} 
          </div>
        `;
      }

      if (gameData.gameObj.type.includes("coop")) {
        html += `
          <div class="bp-hltb-element" title="based on ${gameData.gameObj?.coopCount ?? 0} report(s)">
            Co-op: ${gameData.coopCompString}
          </div>
        `;
      }
    }
  } else {
    html += `
    <div class="bp-hltb-element">
      <div>${gameData.gameStatus}</div>
    </div>
    `;
  }

  html += `</div>`;

  return html;
}

export async function initHltbTimes() {
  let gameContainer = document.querySelector("#games") as HTMLElement;
  if (!gameContainer) {
    if (document.querySelector("#main > .game.game-media")) {
      gameContainer = document.querySelector("#main") as HTMLElement;
    } else {
      return;
    }
  }

  let checkInterval: ReturnType<typeof setInterval>;
  checkInterval = setInterval(() => {
    if (!gameContainer.dataset.delayedLast) {
      clearInterval(checkInterval);

      const gameTableHeader = gameContainer.querySelector("tr") as HTMLTableRowElement;
      const gameTableGroups = gameContainer.querySelector("colgroup") as HTMLElement;
      const games = gameContainer.querySelectorAll(".game") as NodeListOf<HTMLElement>;

      let colspan = 0;

      for (let column of Object.entries(options.modules.games.hltbIntegration.displayColumns)) {
        if (column[1]) {
          colspan++;
        }
      }

      if (options.modules.games.hltbIntegration.displayColumns)
        if (gameTableHeader) {
          if (options.modules.games.hltbIntegration.displayColumns.main) {
            gameTableHeader.insertAdjacentHTML(
              "beforeend",
              `
              <th class="text-right bp-hltb-element" data-bp-ttb-main="asc">TTB Main <i class="fa fa-sort"></i></th>
            `
            );

            const gameTtbMainHeader = gameTableHeader.querySelector("[data-bp-ttb-main]") as HTMLElement;

            gameTtbMainHeader.addEventListener("click", () => {
              $(gameContainer).sortable_table(
                "sort",
                $(gameTtbMainHeader).index(),
                gameTtbMainHeader.dataset.bpTtbMain === "asc"
              );
              if (gameTtbMainHeader.dataset.bpTtbMain === "asc") {
                gameTtbMainHeader.dataset.bpTtbMain = "desc";
              } else {
                gameTtbMainHeader.dataset.bpTtbMain = "asc";
              }
            });
          }

          if (options.modules.games.hltbIntegration.displayColumns["+extra"]) {
            gameTableHeader.insertAdjacentHTML(
              "beforeend",
              `
              <th class="text-right bp-hltb-element" data-bp-ttb-extra="asc">TTB +Extra <i class="fa fa-sort"></i></th>
            `
            );

            const gameTtbExtraHeader = gameTableHeader.querySelector("[data-bp-ttb-extra]") as HTMLElement;

            gameTtbExtraHeader.addEventListener("click", () => {
              $(gameContainer).sortable_table(
                "sort",
                $(gameTtbExtraHeader).index(),
                gameTtbExtraHeader.dataset.bpTtbExtra === "asc"
              );
              if (gameTtbExtraHeader.dataset.bpTtbExtra === "asc") {
                gameTtbExtraHeader.dataset.bpTtbExtra = "desc";
              } else {
                gameTtbExtraHeader.dataset.bpTtbExtra = "asc";
              }
            });
          }

          if (options.modules.games.hltbIntegration.displayColumns["100%"]) {
            gameTableHeader.insertAdjacentHTML(
              "beforeend",
              `
              <th class="text-right bp-hltb-element" data-bp-ttb-everything="asc">TTB 100% <i class="fa fa-sort"></i></th>
            `
            );

            const gameTtbEverythingHeader = gameTableHeader.querySelector("[data-bp-ttb-everything]") as HTMLElement;

            gameTtbEverythingHeader.addEventListener("click", () => {
              $(gameContainer).sortable_table(
                "sort",
                $(gameTtbEverythingHeader).index(),
                gameTtbEverythingHeader.dataset.bpTtbEverything === "asc"
              );
              if (gameTtbEverythingHeader.dataset.bpTtbEverything === "asc") {
                gameTtbEverythingHeader.dataset.bpTtbEverything = "desc";
              } else {
                gameTtbEverythingHeader.dataset.bpTtbEverything = "asc";
              }
            });
          }
        }

      if (gameTableGroups) {
        if (
          gameTableHeader.firstElementChild.textContent.trim() === "#" ||
          gameTableHeader.firstElementChild.textContent.trim() === "Date Won"
        ) {
          gameTableGroups.innerHTML = `
            <col class="bp-hltb-element" style="width: 1%;">
            <col class="bp-hltb-element">
            <col class="bp-hltb-element" style="width: 130px">
            <col class="bp-hltb-element" style="width: 130px">
          `;

          if (options.modules.games.hltbIntegration.displayColumns.main) {
            gameTableGroups.innerHTML += `<col class="bp-hltb-element" style="width: ${155 - 15 * colspan}px;">`;
          }

          if (options.modules.games.hltbIntegration.displayColumns["+extra"]) {
            gameTableGroups.innerHTML += `<col class="bp-hltb-element" style="width: ${155 - 15 * colspan}px;">`;
          }

          if (options.modules.games.hltbIntegration.displayColumns["100%"]) {
            gameTableGroups.innerHTML += `<col class="bp-hltb-element" style="width: ${155 - 15 * colspan}px;">`;
          }
        } else {
          gameTableGroups.innerHTML = `
            <col>
            <col>
            <col style="width: 130px">
          `;

          if (options.modules.games.hltbIntegration.displayColumns.main) {
            gameTableGroups.innerHTML += `<col class="bp-hltb-element" style="width: ${155 - 15 * colspan}px;">`;
          }

          if (options.modules.games.hltbIntegration.displayColumns["+extra"]) {
            gameTableGroups.innerHTML += `<col class="bp-hltb-element" style="width: ${155 - 15 * colspan}px;">`;
          }

          if (options.modules.games.hltbIntegration.displayColumns["100%"]) {
            gameTableGroups.innerHTML += `<col class="bp-hltb-element" style="width: ${155 - 15 * colspan}px;">`;
          }
        }
      }

      const queryList = [];

      games.forEach((game) => {
        const steamStoreLink = game.querySelector('a[href*="store.steampowered.com/app/"]') as HTMLAnchorElement;
        const steamId = steamStoreLink.href.match(/app\/(\d+)/)[1];

        if (game.tagName === "TR") {
          game.insertAdjacentHTML("beforeend", getHltbHtml(steamId, "table"));

          const gameToolbar = game.querySelector(".toolbar");

          if (
            options.modules.games.hltbIntegration.addHltbLinks &&
            gameToolbar &&
            hltbData[steamId] &&
            hltbData[steamId].hltbId != -1
          ) {
            gameToolbar.insertAdjacentHTML(
              "beforeend",
              `
              <li class="bp-hltb-element" style="vertical-align: middle">
                <a href="https://howlongtobeat.com/game/${hltbData[steamId].hltbId}" aria-label="HLTB game page" title="HLTB game page">${hltbLogo}</a>
              </li>
            `
            );
          }

          const gameName = game.querySelector("td:not(.text-right, .achievements)").firstChild.textContent.trim();

          if (hltbData && !hltbData[steamId] && !hltbExcludedGames.includes(+steamId)) {
            queryList.push({
              name: gameName,
              steamId: steamId,
            });
          }
        } else if (game.classList.contains("game-media")) {
          game.insertAdjacentHTML("beforeend", getHltbHtml(steamId, "list"));

          const gameHeading = game.querySelector("h4.media-heading");

          if (
            options.modules.games.hltbIntegration.addHltbLinks &&
            gameHeading &&
            hltbData[steamId] &&
            hltbData[steamId].hltbId != -1
          ) {
            gameHeading.insertAdjacentHTML(
              "beforeend",
              `
              <a href="https://howlongtobeat.com/game/${hltbData[steamId].hltbId}" aria-label="HLTB game page" title="HLTB game page">${hltbLogo}</a>
            `
            );
          }

          if (gameHeading && hltbData && !hltbData[steamId] && !hltbExcludedGames.includes(+steamId)) {
            queryList.push({
              name: gameHeading.textContent,
              steamId: steamId,
            });
          }
        }
      });

      enqueueHltbData(queryList);
    }
  }, 100);
}

export function cleanupHltbTimes() {
  removeAllNodesIfExist("#games .bp-hltb-element");
}
