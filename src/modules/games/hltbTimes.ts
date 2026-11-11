import { hltbLogoClass, infinityIcon } from "@/assets/icons";
import { enqueueGames, formatHltbTime, getHltbGame, getHltbModes, getHltbStatus, isExcludedGame } from "@/lib/hltbService";
import { hltbData, isUnknownToBackend } from "@/lib/gameData";
import { registerGameDecorator } from "@/lib/gameRows";
import { removeAllNodesIfExist } from "@/lib/utilities";
import { options } from "@/lib/store.svelte";
import { getGameName, hasExtraPlaytimeColumn, hasLeadingIndexColumn, insertSortableHeader } from "@/lib/gameTable";
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
    return columns.map(() => `<td class="text-right bp-hltb-element" data-value="${sortValue}">${getHltbStatus(steamId)}</td>`).join("");
  }

  if (game.type.includes("sp")) {
    return columns
      .map((column) => {
        const isMain = column.field === "main";
        return `<td class="text-right bp-hltb-element${isMain ? " bp-hltb-cell" : ""}" data-value="${game[column.field] ?? -1}" title="${reportsTitle(game, column.field)}">${isMain && game.endless ? infinityIcon : ""}${formatHltbTime(steamId, column.field)}</td>`;
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
    html += getHltbStatus(steamId);
  } else if (game.type.includes("sp")) {
    html += game.endless ? infinityIcon : "";

    for (let column of getEnabledColumns()) {
      html += `<div class="bp-hltb-element bp-hltb-one-column" title="${reportsTitle(game, column.field)}"><span class="bp-hltb-one-column-label">${column.label}:</span> ${formatHltbTime(steamId, column.field)}</div>`;
    }
  } else {
    for (const { field, label } of getHltbModes(game)) {
      html += `<div class="bp-hltb-element bp-hltb-one-column" title="${reportsTitle(game, field)}"><span class="bp-hltb-one-column-label">${label}:</span> ${formatHltbTime(steamId, field)}</div>`;
    }
  }

  return html + `</td>`;
}

function getHltbListHtml(steamId: number): string {
  const game = getHltbGame(steamId);
  let html = "";

  if (!game) {
    html += `<div class="bp-hltb-element">${getHltbStatus(steamId)}</div>`;
  } else if (game.type.includes("sp")) {
    for (let column of getEnabledColumns()) {
      const endlessIcon = column.field === "main" && game.endless ? infinityIcon : "";
      html += `<div class="bp-hltb-element" title="${reportsTitle(game, column.field)}">${endlessIcon} ${column.label}: ${formatHltbTime(steamId, column.field)}</div>`;
    }
  } else {
    for (const { field, label } of getHltbModes(game)) {
      html += `<div class="bp-hltb-element" title="${reportsTitle(game, field)}">${label}: ${formatHltbTime(steamId, field)}</div>`;
    }
  }

  return html;
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
  return `<a href="https://howlongtobeat.com/game/${hltbData[steamId].hltbId}" aria-label="HLTB game page" title="HLTB game page" class="${hltbLogoClass}"></a>`;
}

export function initHltbTimes() {
  const { oneColumnMode, addHltbLinks, reportButtons } = options.modules.games.hltbIntegration;
  const queryList: QueryGame[] = [];

  registerGameDecorator({
    views: ["table", "list"],
    setup: ({ type, container }) => {
      const headerRow = container.querySelector("tr");
      const colgroup = container.querySelector<HTMLElement>("colgroup");

      if (type === "table" && headerRow) {
        addTableHeaders(container, headerRow, oneColumnMode);

        if (colgroup) {
          setColumnWidths(colgroup, headerRow, oneColumnMode);
        }
      }

      if (reportButtons) {
        const reportModal = mountTracked(HltbReportModal, { target: document.body, props: {} });

        container.addEventListener("click", (event) => {
          const button = (event.target as Element).closest<HTMLElement>(".bp-hltb-report");

          if (button) {
            const steamId = Number(button.dataset.steamId);
            const hltbId = hltbData[steamId]?.hltbId;
            reportModal.open({ steamId, name: getGameName(button.closest(".game") as Element) ?? "", hltbId: hltbId && hltbId > 0 ? hltbId : null });
          }
        });
      }
    },
    render: (game, steamId, view) => {
      const link = addHltbLinks && getHltbGame(steamId) ? getHltbLinkHtml(steamId) : "";
      const gameName = getGameName(game);

      if (gameName && isUnknownToBackend("hltb", steamId) && !isExcludedGame(steamId)) {
        queryList.push({ name: gameName, steamId });
      }

      if (view === "table") {
        return {
          times: oneColumnMode ? getHltbTableOneColumnHtml(steamId) : getHltbTableHtml(steamId),
          links: link ? `<li class="bp-hltb-element" style="vertical-align: middle">${link}</li>` : "",
          trailingLinks: reportButtons ? `<li class="bp-hltb-element" style="vertical-align: middle">${getReportButtonHtml(steamId)}</li>` : "",
        };
      }

      return {
        times: getHltbListHtml(steamId),
        links: link,
        trailingLinks: reportButtons ? getReportButtonHtml(steamId, " bp-hltb-element") : "",
      };
    },
    finish: () => enqueueGames(queryList),
  });
}

export function cleanupHltbTimes() {
  removeAllNodesIfExist("#games .bp-hltb-element, #main .bp-hltb-element");
}
