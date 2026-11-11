import CompatibilityModal from "@/modules/games/CompatibilityModal.svelte";
import { linuxData, steamFrameData, steamMachineData, steamOsData } from "@/lib/gameData";
import { registerGameDecorator, type GameView } from "@/lib/gameRows";
import { removeAllNodesIfExist } from "@/lib/utilities";
import { compatibilityRatingIconClass } from "@/lib/linuxService";
import { mountTracked } from "@/globals";
import { addLinuxColumn, getGameName } from "@/lib/gameTable";
import { options } from "@/lib/store.svelte";

type CompatibilityDevice = {
  id: CompatibilityDeviceId;
  title: string;
  columnLabel: string;
  columnWidth: number;
  classPrefix: string;
  filterPlaceholder: string;
  enabled: () => boolean;
  filterEnabled: () => boolean;
  getStatus: (steamId: number) => DeviceCompatibility | undefined;
};

const ratingScore = {
  unknown: -1,
  untested: 0,
  unsupported: 1,
  playable: 2,
  verified: 3,
};

const games = options.modules.games;

export const COMPATIBILITY_DEVICES: CompatibilityDevice[] = [
  {
    id: "deck",
    title: "Steam Deck",
    columnLabel: "Deck",
    columnWidth: 50,
    classPrefix: "bp-deckverified",
    filterPlaceholder: "Steam Deck Verified statuses",
    enabled: () => games.deckVerifiedIntegration.enabled,
    filterEnabled: () => games.filters.deckVerifiedStatuses,
    getStatus: (steamId) => (linuxData[steamId] ? { rating: linuxData[steamId].deckRating, info: linuxData[steamId].deckInfo } : undefined),
  },
  {
    id: "steamos",
    title: "SteamOS",
    columnLabel: "SteamOS",
    columnWidth: 85,
    classPrefix: "bp-steamos",
    filterPlaceholder: "SteamOS statuses",
    enabled: () => games.steamOsIntegration.enabled,
    filterEnabled: () => games.filters.steamOsStatuses,
    getStatus: (steamId) => steamOsData[steamId],
  },
  {
    id: "steammachine",
    title: "Steam Machine",
    columnLabel: "Machine",
    columnWidth: 85,
    classPrefix: "bp-steammachine",
    filterPlaceholder: "Steam Machine statuses",
    enabled: () => games.steamMachineIntegration.enabled,
    filterEnabled: () => games.filters.steamMachineStatuses,
    getStatus: (steamId) => steamMachineData[steamId],
  },
  {
    id: "steamframe",
    title: "Steam Frame",
    columnLabel: "Frame",
    columnWidth: 70,
    classPrefix: "bp-steamframe",
    filterPlaceholder: "Steam Frame statuses",
    enabled: () => games.steamFrameIntegration.enabled,
    filterEnabled: () => games.filters.steamFrameStatuses,
    getStatus: (steamId) => steamFrameData[steamId],
  },
];

export function createCompatibilityColumn(device: CompatibilityDevice) {
  const { classPrefix, columnLabel, title } = device;

  function getHtml(steamId: number, view: GameView): string {
    const rating = device.getStatus(steamId)?.rating;
    const isUnknown = rating === "unknown";
    const showLabel = view !== "table" && rating !== undefined && (device.id !== "deck" || COMPATIBILITY_DEVICES.some((other) => other.id !== "deck" && other.enabled()));
    const classes = `bp-compatibility-element ${classPrefix}-element${isUnknown ? ` ${classPrefix}-unknown` : ""}${showLabel ? " bp-compatibility-labelled" : ""}`;
    const content =
      rating && rating !== "unknown"
        ? `<button type="button" class="bp-compatibility-badge ${classPrefix}-badge ${classPrefix}-${rating} ${compatibilityRatingIconClass(device.id, rating)}" data-steam-id="${steamId}" title="View ${title} rating details" aria-label="View ${title} rating details"></button>`
        : isUnknown
          ? "???"
          : "";

    if (view === "table") {
      return `<td class="text-center ${classes}" data-value="${ratingScore[rating ?? "unknown"]}">${content}</td>`;
    }

    return `<div class="${classes}">${showLabel ? `<span>${columnLabel}</span>` : ""}${content}</div>`;
  }

  function init() {
    registerGameDecorator({
      setup: ({ type, container }) => {
        if (type === "list") {
          container.classList.add("bp-game-list");
        }

        if (type === "table") {
          addLinuxColumn(container, `${classPrefix}-element`, columnLabel, device.columnWidth);
        }

        const modal = mountTracked(CompatibilityModal, { target: document.body, props: { deviceId: device.id, title } });

        container.addEventListener("click", (event) => {
          const badge = (event.target as Element).closest<HTMLElement>(`.${classPrefix}-badge`);
          const status = badge ? device.getStatus(Number(badge.dataset.steamId)) : undefined;

          if (badge && status) {
            modal.open(status, getGameName(badge.closest(".game") as Element) ?? "");
          }
        });
      },
      render: (_game, steamId, view) => ({ linux: getHtml(steamId, view) }),
    });
  }

  function cleanup() {
    removeAllNodesIfExist(`.${classPrefix}-element, .bp-linux-media, .bp-linux-grid`);
  }

  return { init, cleanup };
}
