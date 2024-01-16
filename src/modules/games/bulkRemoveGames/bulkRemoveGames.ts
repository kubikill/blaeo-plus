import { addedComponents } from "@/globals";
import BulkRemoveGamesModal from "./BulkRemoveGamesModal.svelte";

export function initBulkRemoveGames() {
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

  const games: {
    id: string | undefined;
    name: string;
    status: string;
    playtime: string | undefined;
    achievements: string | undefined;
    markedForDeletion: boolean;
  }[] = [];

  let checkInterval: ReturnType<typeof setInterval>;
  checkInterval = setInterval(() => {
    if (!gameTable.dataset.delayedLast) {
      clearInterval(checkInterval);

      const gameRows = gameTable.querySelectorAll("tbody > tr") as NodeListOf<HTMLTableRowElement>;

      gameRows.forEach((row) => {
        const achievementsCell = row.querySelector(".achievements");
        let status = [...row.classList]
          .flatMap((className) => {
            if (className === "game") {
              return [];
            }

            return [className.replace("game-", "")];
          })
          .join("");

        games.push({
          id: row.dataset.item,
          name: row.firstElementChild?.firstChild?.textContent || "",
          status: status,
          playtime: achievementsCell?.nextElementSibling?.innerHTML,
          achievements: achievementsCell?.innerHTML,
          markedForDeletion: false,
        });
      });

      const bulkRemoveGamesModal = new BulkRemoveGamesModal({
        target: modalSlot,
        props: {
          games: games,
        },
      });

      addedComponents.push(bulkRemoveGamesModal);
    }
  }, 100);
}
