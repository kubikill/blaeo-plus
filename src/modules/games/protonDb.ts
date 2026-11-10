import { provisionalIcon } from "@/assets/icons";
import { linuxData, waitUntilGameDataLoaded } from "@/lib/gameData";
import { removeAllNodesIfExist } from "@/lib/utilities";
import { getGamesContainer } from "@/lib/waitUntilGamesContainerLoaded";
import { addLinuxColumn, getSteamId, insertInListBody } from "@/lib/gameTable";

type GameView = "table" | "list" | "grid";

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

function hasFinalRating(data: LinuxData): boolean {
  return data.protonDbRating != "unknown" && data.protonDbRating != "pending";
}

function getProtonDbScore(data: LinuxData): number {
  return protonDbRatingScore[hasFinalRating(data) ? data.protonDbRating : data.protonDbProvRating];
}

function getRatingBadgeHtml(steamId: number, view: GameView): string {
  const data = linuxData[steamId];
  const href = ` href="https://www.protondb.com/app/${steamId}"`;
  const classes = `${view === "table" ? "" : "bp-protondb-element "}bp-protondb-rating`;

  if (data && hasFinalRating(data)) {
    const ratingClass = data.protonDbRating === "no data" ? "no-data" : data.protonDbRating;
    return `<a${href} class="${classes} bp-protondb-rating-${ratingClass}" title="based on ${data.protonDbReports ?? 0} report(s)">${data.protonDbRating}</a>`;
  }

  if (data && data.protonDbProvRating != "unknown") {
    return `<a${href} class="${classes} bp-protondb-rating-${data.protonDbProvRating} bp-protondb-rating-provisional" title="provisional rating based on ${data.protonDbReports ?? 0} report(s)">${provisionalIcon} ${
      data.protonDbProvRating
    }</a>`;
  }

  if (data && view === "table") {
    return `<div class="${classes} bp-protondb-rating-unknown">unknown</div>`;
  }

  return `<a${href} class="${classes} bp-protondb-rating-unknown">unknown</a>`;
}

function getProtonDbHtml(steamId: number, view: GameView): string {
  const badge = getRatingBadgeHtml(steamId, view);
  const data = linuxData[steamId];

  switch (view) {
    case "table":
      return `<td class="text-right bp-protondb-element" data-value="${data ? getProtonDbScore(data) : "unknown"}">${badge}</td>`;
    case "list":
      return `<div class="bp-linux-media">${badge}</div>`;
    case "grid":
      return `<div class="bp-linux-grid">${badge}</div>`;
  }
}

export async function initProtonDb() {
  const gameContainer = getGamesContainer();

  if (!gameContainer) {
    return;
  }

  if (gameContainer.type === "grid") {
    gameContainer.container.classList.add("bp-game-list");
  }

  await waitUntilGameDataLoaded();

  const games = gameContainer.container.querySelectorAll<HTMLElement>(".game");
  const anchorColumn = addLinuxColumn(gameContainer.container, "bp-protondb-element", "ProtonDB rating", 100);

  games.forEach((game) => {
    const steamId = getSteamId(game);

    if (gameContainer.type === "table") {
      game.querySelector(`td:nth-child(${anchorColumn})`)?.insertAdjacentHTML("afterend", getProtonDbHtml(steamId, "table"));
    } else if (gameContainer.type === "list") {
      insertInListBody(game, getProtonDbHtml(steamId, "list"));
    } else {
      game.querySelector(".caption")?.insertAdjacentHTML("beforeend", getProtonDbHtml(steamId, "grid"));
    }
  });
}

export function cleanupProtonDb() {
  removeAllNodesIfExist(".bp-protondb-element, .bp-linux-media, .bp-linux-grid");
}
