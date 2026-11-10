import { hltbLogo, infinityIcon } from "@/assets/icons";
import { enqueueGames, formatHltbTime, getHltbGame, getHltbModes, getHltbStatus, isExcludedGame } from "@/lib/hltbService";
import { hltbData, isUnknownToBackend, waitUntilGameDataLoaded } from "@/lib/gameData";
import { removeAllNodesIfExist } from "@/lib/utilities";
import { options } from "@/lib/store.svelte";
import { getGamesContainer } from "@/lib/waitUntilGamesContainerLoaded";
import { getGameName, getSteamId, hasExtraPlaytimeColumn, hasLeadingIndexColumn, insertSortableHeader } from "@/lib/gameTable";
import { mountTracked } from "@/globals";
import HltbReportModal from "./HltbReportModal.svelte";

type HltbGame = GameInfo[number];

const HLTB_COLUMNS = [
  { option: "main", field: "main", label: "Main", header: "TTB Main" },
  { option: "+extra", field: "extra", label: "+Extra", header: "TTB +Extra" },
  { option: "100%", field: "everything", label: "100%", header: "TTB 100%" },
] as const;

type HltbColumn = (typeof HLTB_COLUMNS)[number];

function getEnabledColumns(): HltbColumn[] {
  return HLTB_COLUMNS.filter((column) => options.modules.games.hltbIntegration.displayColumns[column.option]);
}

function reportsTitle(game: HltbGame, field: HltbTimeField): string {
  return `based on ${game[`${field}Count`] ?? 0} report(s)`;
}

function getHltbTableHtml(steamId: number): string {
  const game = getHltbGame(steamId);
  const columns = getEnabledColumns();

  if (!game) {
    const sortValue = isExcludedGame(steamId) ? -2 : -1;
    return columns.map(() => `<td class="text-right bp-hltb-element" data-value="${sortValue}"><div>${getHltbStatus(steamId)}</div></td>`).join("");
  }

  if (game.type.includes("sp")) {
    return columns
      .map((column) => {
        const isMain = column.field === "main";
        return `
          <td class="text-right bp-hltb-element${isMain ? " bp-hltb-cell" : ""}" data-value="${game[column.field] ?? -1}">
            ${isMain && game.endless ? infinityIcon : ""}
            <span title="${reportsTitle(game, column.field)}">${formatHltbTime(steamId, column.field)}</span>
          </td>`;
      })
      .join("");
  }

  if (columns.length === 0) {
    return "";
  }

  const modes = getHltbModes(game).map(({ field, label }) => `<span title="${reportsTitle(game, field)}">${label}: ${formatHltbTime(steamId, field)}</span>`);

  const sortPlaceholders = `<td class="bp-hltb-element" style="display: none" data-value="-1"></td>`.repeat(columns.length - 1);

  return `<td class="text-center bp-hltb-element" colspan="${columns.length}" data-value="${game.mp ?? -1}">${modes.join(" ")}</td>${sortPlaceholders}`;
}

function getHltbTableOneColumnHtml(steamId: number): string {
  const game = getHltbGame(steamId);
  let html = `<td class="text-right bp-hltb-element">`;

  if (!game) {
    html += `<div>${getHltbStatus(steamId)}</div>`;
  } else if (game.type.includes("sp")) {
    html += game.endless ? infinityIcon : "";

    for (let column of getEnabledColumns()) {
      html += `
        <div class="bp-hltb-element" title="${reportsTitle(game, column.field)}">
          <div class="bp-hltb-one-column"><span class="bp-hltb-one-column-label">${column.label}:</span> ${formatHltbTime(steamId, column.field)}</div>
        </div>`;
    }
  } else {
    for (const { field, label } of getHltbModes(game)) {
      html += `
        <div class="bp-hltb-element bp-hltb-one-column" title="${reportsTitle(game, field)}">
          <span class="bp-hltb-one-column-label">${label}:</span> ${formatHltbTime(steamId, field)}
        </div>`;
    }
  }

  return html + `</td>`;
}

function getHltbListHtml(steamId: number): string {
  const game = getHltbGame(steamId);
  let html = `<div class="bp-list-hltb-info">`;

  if (!game) {
    html += `<div class="bp-hltb-element"><div>${getHltbStatus(steamId)}</div></div>`;
  } else if (game.type.includes("sp")) {
    for (let column of getEnabledColumns()) {
      const endlessIcon = column.field === "main" && game.endless ? infinityIcon : "";
      html += `
        <div class="bp-hltb-element" title="${reportsTitle(game, column.field)}">
          <div>${endlessIcon} ${column.label}: ${formatHltbTime(steamId, column.field)}</div>
        </div>`;
    }
  } else {
    for (const { field, label } of getHltbModes(game)) {
      html += `<div class="bp-hltb-element" title="${reportsTitle(game, field)}">${label}: ${formatHltbTime(steamId, field)}</div>`;
    }
  }

  return html + `</div>`;
}

function addTableHeaders(table: HTMLElement, headerRow: HTMLTableRowElement, oneColumnMode: boolean) {
  const headers = oneColumnMode ? ["Time to beat"] : getEnabledColumns().map((column) => column.header);

  for (const header of headers) {
    insertSortableHeader(table, headerRow, "beforeend", "bp-hltb-element", header);
  }
}

function setColumnWidths(colgroup: HTMLElement, headerRow: HTMLTableRowElement, oneColumnMode: boolean) {
  const columnWidth = options.modules.games.other.fullWidthTable ? 150 : 130;
  const fixedColumn = `<col class="bp-hltb-element" style="width: ${columnWidth}px">`;

  let html: string;

  if (hasLeadingIndexColumn(headerRow)) {
    html = `<col class="bp-hltb-element" style="width: 1%;"><col class="bp-hltb-element">${fixedColumn}${fixedColumn}`;
  } else if (hasExtraPlaytimeColumn(headerRow)) {
    html = `<col class="bp-hltb-element">${fixedColumn}${fixedColumn}${fixedColumn}`;
  } else {
    html = `<col class="bp-hltb-element">${fixedColumn}${fixedColumn}`;
  }

  if (oneColumnMode) {
    html += `<col class="bp-hltb-element" style="width: 160px;">`;
  } else {
    html += getEnabledColumns()
      .map(() => `<col class="bp-hltb-element" style="width: ${columnWidth - 20}px;">`)
      .join("");
  }

  colgroup.innerHTML = html;
}

function getReportButtonHtml(steamId: number, extraClass = ""): string {
  return `<button type="button" class="bp-hltb-report${extraClass}" data-steam-id="${steamId}" title="Report wrong HLTB link or non-game" aria-label="Report wrong HLTB link or non-game"></button>`;
}

function getHltbLinkHtml(steamId: number): string {
  return `<a href="https://howlongtobeat.com/game/${hltbData[steamId].hltbId}" aria-label="HLTB game page" title="HLTB game page">${hltbLogo}</a>`;
}

export async function initHltbTimes() {
  const gameContainer = getGamesContainer();

  if (!gameContainer || gameContainer.type === "grid") {
    return;
  }

  await waitUntilGameDataLoaded();

  const games = gameContainer.container.querySelectorAll<HTMLElement>(".game");
  const headerRow = gameContainer.container.querySelector("tr");
  const colgroup = gameContainer.container.querySelector<HTMLElement>("colgroup");
  const oneColumnMode = options.modules.games.hltbIntegration.oneColumnMode;
  const addLinks = options.modules.games.hltbIntegration.addHltbLinks;
  const addReportButtons = options.modules.games.hltbIntegration.reportButtons;

  if (gameContainer.type === "table" && headerRow) {
    addTableHeaders(gameContainer.container, headerRow, oneColumnMode);

    if (colgroup) {
      setColumnWidths(colgroup, headerRow, oneColumnMode);
    }
  }

  const queryList = [] as QueryGame[];

  games.forEach((game) => {
    const steamId = getSteamId(game);
    const hasHltbPage = !!getHltbGame(steamId);
    const gameName = getGameName(game);

    if (gameContainer.type === "table") {
      game.insertAdjacentHTML("beforeend", oneColumnMode ? getHltbTableOneColumnHtml(steamId) : getHltbTableHtml(steamId));

      const gameToolbar = game.querySelector(".toolbar");

      if (addLinks && gameToolbar && hasHltbPage) {
        gameToolbar.insertAdjacentHTML("beforeend", `<li class="bp-hltb-element" style="vertical-align: middle">${getHltbLinkHtml(steamId)}</li>`);
      }

      if (addReportButtons && gameToolbar) {
        gameToolbar.insertAdjacentHTML("beforeend", `<li class="bp-hltb-element" style="vertical-align: middle">${getReportButtonHtml(steamId)}</li>`);
      }
    } else {
      game.insertAdjacentHTML("beforeend", getHltbListHtml(steamId));

      const gameHeading = game.querySelector("h4.media-heading");

      if (addLinks && gameHeading && hasHltbPage) {
        gameHeading.insertAdjacentHTML("beforeend", getHltbLinkHtml(steamId));
      }

      if (addReportButtons && gameHeading) {
        gameHeading.insertAdjacentHTML("beforeend", getReportButtonHtml(steamId, " bp-hltb-element"));
      }
    }

    if (gameName && isUnknownToBackend("hltb", steamId) && !isExcludedGame(steamId)) {
      queryList.push({ name: gameName, steamId });
    }
  });

  enqueueGames(queryList);

  if (addReportButtons) {
    const reportModal = mountTracked(HltbReportModal, { target: document.body, props: {} });

    gameContainer.container.addEventListener("click", (event) => {
      const button = (event.target as Element).closest<HTMLElement>(".bp-hltb-report");

      if (button) {
        const steamId = Number(button.dataset.steamId);
        const hltbId = hltbData[steamId]?.hltbId;
        reportModal.open({ steamId, name: getGameName(button.closest(".game") as Element) ?? "", hltbId: hltbId && hltbId > 0 ? hltbId : null });
      }
    });
  }
}

export function cleanupHltbTimes() {
  removeAllNodesIfExist("#games .bp-hltb-element, #main .bp-hltb-element");
}
