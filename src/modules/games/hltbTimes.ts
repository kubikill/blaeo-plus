import { hltbLogo } from "@/assets/icons";
import { options } from "@/globals";
import { enqueueHltbData, hltbExcludedGames, hltbData } from "@/lib/hltbService";

export async function initHltbTimes() {
  const gameContainer = document.querySelector("#games") as HTMLElement;
  if (!gameContainer) {
    return;
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
              <th class="text-right" data-bp-ttb-main="asc">TTB Main <i class="fa fa-sort"></i></th>
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
              <th class="text-right" data-bp-ttb-extra="asc">TTB +Extra <i class="fa fa-sort"></i></th>
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
              <th class="text-right" data-bp-ttb-everything="asc">TTB 100% <i class="fa fa-sort"></i></th>
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
        if (gameTableHeader.firstElementChild.textContent.trim() === "#") {
          gameTableGroups.innerHTML = `
            <col style="width: 1%;">
            <col>
            <col>
            <col style="width: 130px">
          `;

          if (options.modules.games.hltbIntegration.displayColumns.main) {
            gameTableGroups.innerHTML += `<col style="width: ${155 - 15 * colspan}px;">`;
          }

          if (options.modules.games.hltbIntegration.displayColumns["+extra"]) {
            gameTableGroups.innerHTML += `<col style="width: ${155 - 15 * colspan}px;">`;
          }

          if (options.modules.games.hltbIntegration.displayColumns["100%"]) {
            gameTableGroups.innerHTML += `<col style="width: ${155 - 15 * colspan}px;">`;
          }
        } else {
          gameTableGroups.innerHTML = `
            <col>
            <col>
            <col style="width: 130px">
          `;

          if (options.modules.games.hltbIntegration.displayColumns.main) {
            gameTableGroups.innerHTML += `<col style="width: ${155 - 15 * colspan}px;">`;
          }

          if (options.modules.games.hltbIntegration.displayColumns["+extra"]) {
            gameTableGroups.innerHTML += `<col style="width: ${155 - 15 * colspan}px;">`;
          }

          if (options.modules.games.hltbIntegration.displayColumns["100%"]) {
            gameTableGroups.innerHTML += `<col style="width: ${155 - 15 * colspan}px;">`;
          }
        }
      }

      const queryList = [];

      games.forEach((game) => {
        const steamStoreLink = game.querySelector('a[href*="store.steampowered.com/app/"]') as HTMLAnchorElement;
        const steamId = steamStoreLink.href.match(/app\/(\d+)/)[1];

        if (game.tagName === "TR") {
          game.insertAdjacentHTML("beforeend", getHltbHtml(steamId));

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
              <li style="vertical-align: middle">
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
        }
      });

      enqueueHltbData(queryList);
    }
  }, 100);
}

function getHltbHtml(steamId: string) {
  let mainCompString = "Unknown";
  let extraCompString = "Unknown";
  let everythingCompString = "Unknown";
  let mpCompString = "";
  let coopCompString = "";
  let gameObj;
  let html = "";

  if (hltbExcludedGames.includes(+steamId)) {
    mainCompString = extraCompString = everythingCompString = "N/A";
  } else if (hltbData && hltbData[steamId]) {
    if (hltbData[steamId].hltbId != -1) {
      gameObj = hltbData[steamId];
      mainCompString = extraCompString = everythingCompString = "No data";
    } else {
      mainCompString = extraCompString = everythingCompString = "Not on HLTB";
    }
  }

  if (gameObj) {
    if (gameObj.type.includes("sp")) {
      if (options.modules.games.hltbIntegration.displayColumns.main) {
        if (gameObj?.main) {
          let mainCompHours = Math.floor(+gameObj.main / 3600);
          let mainCompMinutes = Math.floor((+gameObj.main % 3600) / 60);

          let countWarning = "";
          if (gameObj.mainCount <= 10) {
            countWarning = "!";
          } else if (gameObj.mainCount <= 100) {
            countWarning = "~";
          }

          mainCompString = `${countWarning}${mainCompHours}h ${mainCompMinutes}min`;
        }

        html += `
          <td class="text-right" data-value="${
            hltbExcludedGames.includes(+steamId) ? -2 : null ?? gameObj?.main ?? -1
          }">
            <div title="based on ${gameObj?.mainCount ?? 0} report(s)">${mainCompString}</div>
          </td>
          `;
      }

      if (options.modules.games.hltbIntegration.displayColumns["+extra"]) {
        if (gameObj?.extra) {
          let extraCompHours = Math.floor(+gameObj.extra / 3600);
          let extraCompMinutes = Math.floor((+gameObj.extra % 3600) / 60);

          let countWarning = "";
          if (gameObj.extraCount <= 10) {
            countWarning = "!";
          } else if (gameObj.extraCount <= 100) {
            countWarning = "~";
          }

          extraCompString = `${countWarning}${extraCompHours}h ${extraCompMinutes}min`;
        }

        html += `
          <td class="text-right" data-value="${
            hltbExcludedGames.includes(+steamId) ? -2 : null ?? gameObj?.extra ?? -1
          }">
            <div title="based on ${gameObj?.extraCount ?? 0} report(s)">${extraCompString}</div>
          </td>
          `;
      }

      if (options.modules.games.hltbIntegration.displayColumns["100%"]) {
        if (gameObj?.everything) {
          let everythingCompHours = Math.floor(+gameObj.everything / 3600);
          let everythingCompMinutes = Math.floor((+gameObj.everything % 3600) / 60);

          let countWarning = "";
          if (gameObj.everythingCount <= 10) {
            countWarning = "!";
          } else if (gameObj.everythingCount <= 100) {
            countWarning = "~";
          }

          everythingCompString = `${countWarning}${everythingCompHours}h ${everythingCompMinutes}min`;
        }

        html += `
          <td class="text-right" data-value="${
            hltbExcludedGames.includes(+steamId) ? -2 : null ?? gameObj?.everything ?? -1
          }">
            <div title="based on ${gameObj?.everythingCount ?? 0} report(s)">${everythingCompString}</div>
          </td>
          `;
      }
    } else {
      if (gameObj.type.includes("mp")) {
        if (gameObj.mp) {
          let mpCompHours = Math.floor(+gameObj.mp / 3600);
          let mpCompMinutes = Math.floor((+gameObj.mp % 3600) / 60);

          let countWarning = "";
          if (gameObj.mpCount <= 10) {
            countWarning = "!";
          } else if (gameObj.mpCount <= 100) {
            countWarning = "~";
          }
          mpCompString = `MP: ${countWarning}${mpCompHours}h ${mpCompMinutes}min`;
        } else {
          mpCompString = `MP: No data`;
        }
      }
      if (gameObj.type.includes("coop")) {
        if (gameObj.coop) {
          let coopCompHours = Math.floor(+gameObj.coop / 3600);
          let coopCompMinutes = Math.floor((+gameObj.coop % 3600) / 60);

          let countWarning = "";
          if (gameObj.coopCount <= 10) {
            countWarning = "!";
          } else if (gameObj.coopCount <= 100) {
            countWarning = "~";
          }
          coopCompString = `Co-op: ${countWarning}${coopCompHours}h ${coopCompMinutes}min`;
        } else {
          coopCompString = `Co-op: No data`;
        }
      }

      html += `
          <td class="text-center" colspan="3" data-value="${
            hltbExcludedGames.includes(+steamId) ? -2 : null ?? gameObj?.mp ?? -1
          }">
            <span title="based on ${gameObj?.mpCount ?? 0} report(s)">${mpCompString}</span>
            <span title="based on ${gameObj?.coopCount ?? 0} report(s)">${coopCompString}</span>
          </td>
          `;
    }
  } else {
    let gameStatus = hltbExcludedGames.includes(+steamId) ? "N/A" : hltbData[steamId] ? "Not on HLTB" : "Unknown";

    if (options.modules.games.hltbIntegration.displayColumns.main) {
      html += `
      <td class="text-right" data-value="${hltbExcludedGames.includes(+steamId) ? -2 : -1}">
        <div>${gameStatus}</div>
      </td>
    `;
    }

    if (options.modules.games.hltbIntegration.displayColumns["+extra"]) {
      html += `
      <td class="text-right" data-value="${hltbExcludedGames.includes(+steamId) ? -2 : -1}">
        <div>${gameStatus}</div>
      </td>
    `;
    }

    if (options.modules.games.hltbIntegration.displayColumns["100%"]) {
      html += `
      <td class="text-right" data-value="${hltbExcludedGames.includes(+steamId) ? -2 : -1}">
        <div>${gameStatus}</div>
      </td>
    `;
    }
  }

  return html;
}
