import DeckModal from "@/modules/games/DeckModal.svelte";
import { linuxData } from "@/lib/linuxService";
import { removeAllNodesIfExist } from "@/lib/utilities";
import DeckBadge from "@/modules/games/DeckBadge.svelte";
import { addedComponents } from "@/globals";

const deckRatingScore = {
  unknown: -1,
  untested: 0,
  unsupported: 1,
  playable: 2,
  verified: 3,
};

function getDeckScore(steamId: number): number {
  return deckRatingScore[linuxData[steamId].deckRating];
}

function getDeckVerifiedHtml(steamId: number, mode: string): string {
  switch (mode) {
    case "table":
      return getDeckVerifiedTableHtml(steamId);
    case "list":
      return getDeckVerifiedListHtml(steamId);
    case "grid":
      return getDeckVerifiedGridHtml(steamId);
    default:
      return "";
  }
}

function getDeckVerifiedTableHtml(steamId: number): string {
  let html = "";

  if (linuxData[steamId].deckRating != "unknown") {
    html += `
    <td class="text-center bp-deckverified-element" data-value="${getDeckScore(steamId)}"></td>
    `;
  } else {
    html += `
    <td class="text-center bp-deckverified-element bp-deckverified-unknown" data-value="${getDeckScore(steamId)}">???</td>
  `;
  }

  return html;
}

function getDeckVerifiedListHtml(steamId: number) {
  let html = "";

  if (linuxData[steamId].deckRating != "unknown") {
    html += `
    <div class="bp-deckverified-element"></div>
    `;
  } else {
    html += `
    <div class="bp-deckverified-element bp-deckverified-unknown">
      ???
    </div>
    `;
  }

  return html;
}

function getDeckVerifiedGridHtml(steamId: number) {
  let html = "";

  if (linuxData[steamId].deckRating != "unknown") {
    html += `
    <div class="bp-deckverified-element"></div>
    `;
  } else {
    html += `
    <div class="bp-deckverified-element bp-deckverified-unknown">
      ???
    </div>
    `;
  }

  return html;
}

export async function initDeckVerified() {
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

  if (gameContainer.classList.contains("games") && gameContainer.tagName === "ul") {
    gameContainer.classList.add("bp-game-list");
  }

  const deckModalComponent = new DeckModal({
    target: document.body,
    props: {
      showModal: false,
    },
  });

  addedComponents.push(deckModalComponent);

  let checkInterval: ReturnType<typeof setInterval>;
  checkInterval = setInterval(() => {
    if (!gameContainer.dataset.delayedLast) {
      clearInterval(checkInterval);

      const protonDbHeader = gameContainer.querySelector("tr > th[data-bp-protondb]") as HTMLElement;
      const gameTableHeader = gameContainer.querySelector("tr > th:nth-child(3)") as HTMLTableCellElement;
      const gameTableGroups = gameContainer.querySelector("colgroup") as HTMLElement;
      const games = gameContainer.querySelectorAll(".game") as NodeListOf<HTMLElement>;

      if (protonDbHeader) {
        protonDbHeader.insertAdjacentHTML(
          "afterend",
          `
            <th class="text-right bp-deckverified-element" data-bp-deckverified="asc">Deck<i class="fa fa-sort"></i></th>
          `,
        );
      } else if (gameTableHeader) {
        gameTableHeader.insertAdjacentHTML(
          "afterend",
          `
            <th class="text-right bp-deckverified-element" data-bp-deckverified="asc">Deck <i class="fa fa-sort"></i></th>
          `,
        );
      }

      const gameDeckVerifiedHeader = gameContainer.querySelector("tr > th[data-bp-deckverified]") as HTMLElement;

      if (gameDeckVerifiedHeader) {
        gameDeckVerifiedHeader.addEventListener("click", () => {
          $(gameContainer).sortable_table("sort", $(gameDeckVerifiedHeader).index(), gameDeckVerifiedHeader.dataset.bpDeckVerified === "asc");
          if (gameDeckVerifiedHeader.dataset.bpDeckVerified === "asc") {
            gameDeckVerifiedHeader.dataset.bpDeckVerified = "desc";
          } else {
            gameDeckVerifiedHeader.dataset.bpDeckVerified = "asc";
          }
        });
      }

      if (gameTableGroups) {
        if (protonDbHeader) {
          const afterColgroup = gameTableGroups.querySelector("col.bp-protondb-element");

          afterColgroup!.insertAdjacentHTML("afterend", `<col class="bp-deckverified-element" style="width: 50px">`);
        } else if (gameTableHeader!.firstElementChild!.textContent!.trim() === "#" || gameTableHeader!.firstElementChild!.textContent!.trim() === "Date Won") {
          const afterColgroup = gameTableGroups.querySelector("col:nth-child(4)");

          afterColgroup!.insertAdjacentHTML("afterend", `<col class="bp-deckverified-element" style="width: 50px">`);
        } else {
          const afterColgroup = gameTableGroups.querySelector("col:nth-child(3)");

          afterColgroup!.insertAdjacentHTML("afterend", '<col class="bp-deckverified-element" style="width: 50px">');
        }
      }

      games.forEach((game) => {
        const steamStoreLink = game.querySelector('a[href*="store.steampowered.com/app/"]') as HTMLAnchorElement;
        const steamId = +steamStoreLink!.href!.match(/app\/(\d+)/)![1] as number;
        let gameName;

        if (game.tagName === "TR") {
          gameName = game.querySelector("td:not(.text-right)")?.firstChild?.textContent;
          const protonDbCell = game.querySelector("td.bp-protondb-element") as HTMLTableCellElement;

          if (protonDbCell) {
            protonDbCell.insertAdjacentHTML("afterend", getDeckVerifiedHtml(steamId, "table"));
          } else {
            const nameCell = game.querySelector("td:nth-child(3)") as HTMLTableCellElement;
            nameCell.insertAdjacentHTML("afterend", getDeckVerifiedHtml(steamId, "table"));
          }
        } else if (game.classList.contains("game-media")) {
          gameName = game.querySelector(".media-heading")?.firstChild?.textContent;
          const linuxCell = game.querySelector(".bp-linux-media");
          const hltbCell = game.querySelector(".bp-list-hltb-info");

          if (linuxCell) {
            linuxCell.insertAdjacentHTML("beforeend", getDeckVerifiedHtml(steamId, "list"));
          } else if (hltbCell) {
            hltbCell.insertAdjacentHTML("beforebegin", `<div class="bp-linux-media">${getDeckVerifiedHtml(steamId, "list")}</div>`);
          } else {
            const mediaBody = game.querySelector(".media-body");

            mediaBody!.insertAdjacentHTML("beforeend", getDeckVerifiedHtml(steamId, "list"));
          }
        } else if (game.classList.contains("game-thumbnail")) {
          gameName = game.querySelector(".title")?.textContent;
          const linuxCell = game.querySelector(".bp-linux-grid");

          if (linuxCell) {
            linuxCell.insertAdjacentHTML("beforeend", getDeckVerifiedHtml(steamId, "grid"));
          } else {
            const caption = game.querySelector(".caption");

            caption?.insertAdjacentHTML("beforeend", `<div class="bp-linux-grid">${getDeckVerifiedHtml(steamId, "grid")}</div>`);
          }
        }

        const deckVerifiedElement = game.querySelector(".bp-deckverified-element:not(.bp-deckverified-unknown)") as HTMLElement;

        if (deckVerifiedElement) {
          const deckBadge = new DeckBadge({
            target: deckVerifiedElement,
            props: {
              gameData: linuxData[steamId],
              gameName: gameName,
              modal: deckModalComponent,
            },
          });

          addedComponents.push(deckBadge);
        }
      });
    }
  }, 100);
}

export function cleanupDeckVerified() {
  removeAllNodesIfExist(".bp-deckverified-element, .bp-linux-media, .bp-linux-grid");
}
