import { mountTracked } from "@/globals";
import BulkRemoveGamesModal from "./BulkRemoveGamesModal.svelte";
import { waitUntilGamesContainerLoaded } from "@/lib/waitUntilGamesContainerLoaded";

export async function initBulkRemoveGames() {
  if (!window.location.pathname.match(/\/games\/missing$/)) {
    return;
  }

  const gameTable = document.querySelector("table#games") as HTMLTableElement;

  if (!gameTable) {
    return;
  }

  gameTable.insertAdjacentHTML(
    "beforebegin",
    `
    <div class="bp-bulk-remove-games-slot"></div>
    `,
  );

  const modalSlot = document.querySelector(".bp-bulk-remove-games-slot");

  if (!modalSlot) {
    return;
  }

  const games: {
    id: string;
    name: string;
    status: string;
    playtime: string | undefined;
    achievements: string | undefined;
    markedForDeletion: boolean;
  }[] = [];

  await waitUntilGamesContainerLoaded();

  gameTable.querySelectorAll<HTMLTableRowElement>("tbody > tr").forEach((row) => {
    if (!row.dataset.item) {
      return;
    }

    const achievementsCell = row.querySelector(".achievements");

    games.push({
      id: row.dataset.item,
      name: row.firstElementChild?.firstChild?.textContent || "",
      status: [...row.classList]
        .filter((className) => className !== "game")
        .map((className) => className.replace("game-", ""))
        .join(""),
      playtime: achievementsCell?.nextElementSibling?.innerHTML,
      achievements: achievementsCell?.innerHTML,
      markedForDeletion: false,
    });
  });

  mountTracked(BulkRemoveGamesModal, { target: modalSlot, props: { games } });
}
