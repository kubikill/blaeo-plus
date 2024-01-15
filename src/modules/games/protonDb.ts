import { provisionalIcon } from "@/assets/icons";
import { optionsStore } from "@/lib/store";
import { linuxData } from "@/lib/linuxService";
import { removeAllNodesIfExist } from "@/lib/utilities";
import { get } from "svelte/store";

let options = get(optionsStore) as Options;
optionsStore.subscribe((value) => {
  options = value;
});

const protonDbRatingScore = {
  unknown: -1,
  "no data": 0,
  pending: 0,
  borked: 1,
  bronze: 2,
  silver: 3,
  gold: 4,
  platinum: 5,
};

const protonDbRatingColors = {
  unknown: "#444444",
  borked: "#FF0000",
  bronze: "#CD7F32",
  silver: "#A6A6A6",
  gold: "#CFB53B",
  platinum: "#B4C7DC",
};

function getProtonDbScore(steamId: number): number {
  if (!linuxData[steamId]) {
    return protonDbRatingScore.unknown;
  }

  if (linuxData[steamId].protonDbRating != "unknown" && linuxData[steamId].protonDbRating != "pending") {
    return protonDbRatingScore[linuxData[steamId].protonDbRating];
  } else {
    return protonDbRatingScore[linuxData[steamId].protonDbProvRating];
  }
}

function getProtonDbHtml(steamId: number, mode: string): string {
  switch (mode) {
    case "table":
      return getProtonDbTableHtml(steamId);
    case "list":
      return getProtonDbListHtml(steamId);
    case "grid":
      return getProtonDbGridHtml(steamId);
    default:
      return "";
  }
}

function getProtonDbTableHtml(steamId: number): string {
  let html = "";

  if (!linuxData[steamId]) {
    html += `
    <td class="text-right bp-protondb-element" data-value="unknown">
        <a href="https://www.protondb.com/app/${steamId}" class="bp-protondb-rating bp-protondb-rating-unknown">unknown</a>
    </td>`;
    return html;
  }

  if (linuxData[steamId].protonDbRating != "unknown" && linuxData[steamId].protonDbRating != "pending") {
    html += `
    <td class="text-right bp-protondb-element" data-value="${getProtonDbScore(steamId)}">
        <a href="https://www.protondb.com/app/${steamId}" class="bp-protondb-rating bp-protondb-rating-${linuxData[steamId].protonDbRating === "no data" ? "no-data" : linuxData[steamId].protonDbRating}" title="based on ${
          linuxData[steamId].protonDbReports ?? 0
        } report(s)">
          ${linuxData[steamId].protonDbRating}
        </a>
    </td>
    `;
  } else if (linuxData[steamId].protonDbProvRating != "unknown") {
    html += `
    <td class="text-right bp-protondb-element" data-value="${getProtonDbScore(steamId)}">
        <a href="https://www.protondb.com/app/${steamId}" class="bp-protondb-rating bp-protondb-rating-${linuxData[steamId].protonDbProvRating} bp-protondb-rating-provisional" title="provisional rating based on ${
          linuxData[steamId].protonDbReports ?? 0
        } report(s)">
          ${provisionalIcon} ${linuxData[steamId].protonDbProvRating}
        </a>
    </td>
  `;
  } else {
    html += `
    <td class="text-right bp-protondb-element" data-value="${getProtonDbScore(steamId)}">
        <div class="bp-protondb-rating bp-protondb-rating-unknown">unknown</div>
    </td>
  `;
  }

  return html;
}

function getProtonDbListHtml(steamId: number) {
  let html = "";

  if (!linuxData[steamId]) {
    html += `
    <div class="bp-linux-media">
    <a href="https://www.protondb.com/app/${steamId}" class="bp-protondb-element bp-protondb-rating bp-protondb-rating-unknown">unknown</a>
    </div>`;
    return html;
  }

  if (linuxData[steamId].protonDbRating != "unknown" && linuxData[steamId].protonDbRating != "pending") {
    html += `
      <div class="bp-linux-media">
        <a href="https://www.protondb.com/app/${steamId}" class="bp-protondb-element bp-protondb-rating bp-protondb-rating-${linuxData[steamId].protonDbRating === "no data" ? "no-data" : linuxData[steamId].protonDbRating}" 
        title="based on ${linuxData[steamId].protonDbReports ?? 0} report(s)">
          ${linuxData[steamId].protonDbRating}
        </a>
      </div>
    `;
  } else if (linuxData[steamId].protonDbProvRating != "unknown") {
    html += `
      <div class="bp-linux-media">
        <a href="https://www.protondb.com/app/${steamId}" class="bp-protondb-element bp-protondb-rating bp-protondb-rating-${linuxData[steamId].protonDbProvRating} bp-protondb-rating-provisional" title="provisional rating based on ${
          linuxData[steamId].protonDbReports ?? 0
        } report(s)">
          ${provisionalIcon} ${linuxData[steamId].protonDbProvRating}
        </a>
      </div>
  `;
  } else {
    html += `
    <div class="bp-linux-media">
      <a href="https://www.protondb.com/app/${steamId}" class="bp-protondb-element bp-protondb-rating bp-protondb-rating-unknown">unknown</a>
    </div>
    `;
  }

  return html;
}

function getProtonDbGridHtml(steamId: number) {
  let html = "";

  if (!linuxData[steamId]) {
    html += `
    <div class="bp-linux-grid">
      <a href="https://www.protondb.com/app/${steamId}" class="bp-protondb-element bp-protondb-rating bp-protondb-rating-unknown">unknown</a>
    </div>`;
    return html;
  }

  if (linuxData[steamId].protonDbRating != "unknown" && linuxData[steamId].protonDbRating != "pending") {
    html += `
      <div class="bp-linux-grid">
        <a href="https://www.protondb.com/app/${steamId}" class="bp-protondb-element bp-protondb-rating bp-protondb-rating-${linuxData[steamId].protonDbRating === "no data" ? "no-data" : linuxData[steamId].protonDbRating}" 
        title="based on ${linuxData[steamId].protonDbReports ?? 0} report(s)">
          ${linuxData[steamId].protonDbRating}
        </a>
      </div>
    `;
  } else if (linuxData[steamId].protonDbProvRating != "unknown") {
    html += `
      <div class="bp-linux-grid">
        <a href="https://www.protondb.com/app/${steamId}" class="bp-protondb-element bp-protondb-rating bp-protondb-rating-${linuxData[steamId].protonDbProvRating} bp-protondb-rating-provisional" title="provisional rating based on ${
          linuxData[steamId].protonDbReports ?? 0
        } report(s)">
          ${provisionalIcon} ${linuxData[steamId].protonDbProvRating}
        </a>
      </div>
  `;
  } else {
    html += `
    <div class="bp-linux-grid">
      <a href="https://www.protondb.com/app/${steamId}" class="bp-protondb-element bp-protondb-rating bp-protondb-rating-unknown">unknown</a>
    </div>
    `;
  }

  return html;
}

export async function initProtonDb() {
  let gameContainer = document.querySelector("#games") as HTMLElement;
  if (!gameContainer) {
    if (document.querySelector("#main > .game.game-media")) {
      gameContainer = document.querySelector("#main") as HTMLElement;
    } else if (document.querySelector("#main > ul.games")) {
      gameContainer = document.querySelector("#main > ul.games") as HTMLElement;
    } else {
      return;
    }
  }

  if (gameContainer.classList.contains("games") && gameContainer.tagName === "UL") {
    gameContainer.classList.add("bp-game-list");
  }

  let checkInterval: ReturnType<typeof setInterval>;
  checkInterval = setInterval(() => {
    if (!gameContainer.dataset.delayedLast) {
      clearInterval(checkInterval);

      const gameTableHeader = gameContainer.querySelector("tr > th:nth-child(3)") as HTMLTableCellElement;
      const gameTableFullHeader = gameContainer.querySelector("tr") as HTMLTableRowElement;
      const gameTableGroups = gameContainer.querySelector("colgroup") as HTMLElement;
      const games = gameContainer.querySelectorAll(".game") as NodeListOf<HTMLElement>;

      if (gameTableHeader) {
        if (gameTableFullHeader!.firstChild!.textContent!.trim() === "#" || gameTableFullHeader!.firstElementChild!.textContent!.trim() === "Date Won" || gameTableHeader!.textContent!.trim() === "Playtime This Month") {
          gameTableFullHeader.querySelector("th:nth-child(4)").insertAdjacentHTML(
            "afterend",
            `
              <th class="text-right bp-protondb-element" data-bp-protondb="asc">ProtonDB rating <i class="fa fa-sort"></i></th>
            `,
          );
        } else {
          gameTableHeader.insertAdjacentHTML(
            "afterend",
            `
              <th class="text-right bp-protondb-element" data-bp-protondb="asc">ProtonDB rating <i class="fa fa-sort"></i></th>
            `,
          );
        }
        const gameProtonDbHeader = gameContainer.querySelector("tr > th[data-bp-protondb]") as HTMLElement;

        gameProtonDbHeader.addEventListener("click", () => {
          $(gameContainer).sortable_table("sort", $(gameProtonDbHeader).index(), gameProtonDbHeader.dataset.bpProtondb === "asc");
          if (gameProtonDbHeader.dataset.bpProtondb === "asc") {
            gameProtonDbHeader.dataset.bpProtondb = "desc";
          } else {
            gameProtonDbHeader.dataset.bpProtondb = "asc";
          }
        });
      }

      if (gameTableGroups) {
        if (gameTableFullHeader!.firstChild!.textContent!.trim() === "#" || gameTableFullHeader!.firstElementChild!.textContent!.trim() === "Date Won" || gameTableHeader!.textContent!.trim() === "Playtime This Month") {
          const afterColgroup = gameTableGroups.querySelector("col:nth-child(4)");

          afterColgroup!.insertAdjacentHTML("afterend", `<col class="bp-protondb-element" style="width: 100px">`);
        } else {
          const afterColgroup = gameTableGroups.querySelector("col:nth-child(3)");

          afterColgroup!.insertAdjacentHTML("afterend", '<col class="bp-protondb-element" style="width: 100px">');
        }
      }

      games.forEach((game) => {
        const steamStoreLink = game.querySelector('a[href*="store.steampowered.com/app/"]') as HTMLAnchorElement;
        const steamId = +steamStoreLink!.href!.match(/app\/(\d+)/)![1];

        if (game.tagName === "TR") {
          let nameCell;
          if (gameTableFullHeader!.firstChild!.textContent!.trim() === "#" || gameTableFullHeader!.firstElementChild!.textContent!.trim() === "Date Won" || gameTableHeader!.textContent!.trim() === "Playtime This Month") {
            nameCell = game.querySelector("td:nth-child(4)");
          } else {
            nameCell = game.querySelector("td:nth-child(3)");
          }
          nameCell!.insertAdjacentHTML("afterend", getProtonDbHtml(steamId, "table"));
        } else if (game.classList.contains("game-media")) {
          const hltbCell = game.querySelector(".bp-list-hltb-info");

          if (hltbCell) {
            hltbCell.insertAdjacentHTML("beforebegin", getProtonDbHtml(steamId, "list"));
          } else {
            const mediaBody = game.querySelector(".media-body");

            mediaBody!.insertAdjacentHTML("beforeend", getProtonDbHtml(steamId, "list"));
          }
        } else if (game.classList.contains("game-thumbnail")) {
          const caption = game.querySelector(".caption");

          caption!.insertAdjacentHTML("beforeend", getProtonDbHtml(steamId, "grid"));
        }
      });
    }
  }, 100);
}

export function cleanupProtonDb() {
  removeAllNodesIfExist(".bp-protondb-element, .bp-linux-media, .bp-linux-grid");
}
