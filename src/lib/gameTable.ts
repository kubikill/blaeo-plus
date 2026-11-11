const LINUX_COLUMN_CLASS = "bp-linux-column";

export function findSteamId(game: Element): number | undefined {
  const steamId = game.querySelector<HTMLAnchorElement>('a[href*="store.steampowered.com/app/"]')?.href.match(/app\/(\d+)/)?.[1];

  return steamId ? +steamId : undefined;
}

export function getSteamId(game: Element): number {
  const steamId = findSteamId(game);

  if (steamId === undefined) {
    throw new Error("Game element has no Steam store link");
  }

  return steamId;
}

export function getGameName(game: Element): string | undefined {
  return game.querySelector(".media-heading, .title, td:not(.text-right, .achievements)")?.firstChild?.textContent?.trim();
}

export function hasNoAchievements(game: Element): boolean {
  const achievementsCell = game.querySelector(".achievements");

  if (achievementsCell) {
    return !/\d/.test(achievementsCell.textContent ?? "");
  }

  return Array.from(game.querySelectorAll(".text-muted")).some((element) => element.textContent?.trim() === "no achievements");
}

function makeColumnSortable(header: HTMLElement, table: HTMLElement) {
  let ascending = true;

  header.addEventListener("click", () => {
    $(table).sortable_table("sort", $(header).index(), ascending);
    ascending = !ascending;
  });
}

export function insertSortableHeader(table: HTMLElement, anchor: Element, position: "afterend" | "beforeend", className: string, label: string) {
  anchor.insertAdjacentHTML(position, `<th class="text-right ${className}">${label} <i class="fa fa-sort"></i></th>`);
  makeColumnSortable((position === "afterend" ? anchor.nextElementSibling : anchor.lastElementChild) as HTMLElement, table);
}

/** Some tables (lists, giveaway wins) start with a "#" / "Date Won" column, which shifts every other column by one. */
export function hasLeadingIndexColumn(headerRow: HTMLTableRowElement | null): boolean {
  const firstHeader = headerRow?.firstElementChild?.textContent?.trim();

  return firstHeader === "#" || firstHeader === "Date Won";
}

export function hasExtraPlaytimeColumn(headerRow: HTMLTableRowElement | null): boolean {
  const thirdHeader = headerRow?.children[2]?.textContent?.trim() ?? "";

  return thirdHeader === "Playtime This Month" || thirdHeader.startsWith("Playtime In");
}

export function getLinuxAnchorColumn(headerRow: HTMLTableRowElement | null): number {
  return hasLeadingIndexColumn(headerRow) || hasExtraPlaytimeColumn(headerRow) ? 4 : 3;
}

export function addLinuxColumn(table: HTMLElement, className: string, label: string, width: number) {
  const headerRow = table.querySelector("tr");
  const anchorColumn = getLinuxAnchorColumn(headerRow) + (headerRow?.querySelectorAll(`th.${LINUX_COLUMN_CLASS}`).length ?? 0);
  const anchorHeader = headerRow?.querySelector(`th:nth-child(${anchorColumn})`);

  if (anchorHeader) {
    insertSortableHeader(table, anchorHeader, "afterend", `${LINUX_COLUMN_CLASS} ${className}`, label);
  }

  table.querySelector(`colgroup > col:nth-child(${anchorColumn})`)?.insertAdjacentHTML("afterend", `<col class="${className}" style="width: ${width}px">`);
}
