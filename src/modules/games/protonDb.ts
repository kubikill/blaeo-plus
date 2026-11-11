import { linuxData } from "@/lib/gameData";
import { registerGameDecorator, type GameView } from "@/lib/gameRows";
import { removeAllNodesIfExist } from "@/lib/utilities";
import { addLinuxColumn } from "@/lib/gameTable";

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
    return `<a${href} class="${classes} bp-protondb-rating-${data.protonDbProvRating} bp-protondb-rating-provisional" title="provisional rating based on ${data.protonDbReports ?? 0} report(s)">${data.protonDbProvRating}</a>`;
  }

  if (data && view === "table") {
    return `<div class="${classes} bp-protondb-rating-unknown">unknown</div>`;
  }

  return `<a${href} class="${classes} bp-protondb-rating-unknown">unknown</a>`;
}

function getProtonDbHtml(steamId: number, view: GameView): string {
  const badge = getRatingBadgeHtml(steamId, view);
  const data = linuxData[steamId];

  return view === "table" ? `<td class="text-right bp-protondb-element" data-value="${data ? getProtonDbScore(data) : "unknown"}">${badge}</td>` : badge;
}

export function initProtonDb() {
  registerGameDecorator({
    setup: ({ type, container }) => {
      if (type === "grid") {
        container.classList.add("bp-game-list");
      }

      if (type === "table") {
        addLinuxColumn(container, "bp-protondb-element", "ProtonDB rating", 100);
      }
    },
    render: (_game, steamId, view) => ({ linux: getProtonDbHtml(steamId, view) }),
  });
}

export function cleanupProtonDb() {
  removeAllNodesIfExist(".bp-protondb-element, .bp-linux-media, .bp-linux-grid");
}
