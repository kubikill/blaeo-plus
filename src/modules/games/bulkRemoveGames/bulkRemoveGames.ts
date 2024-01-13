import { addedComponents } from "@/globals";
import BulkRemoveGamesModal from "./BulkRemoveGamesModal.svelte";

export function initBulkRemoveGames() {
  if (!window.location.pathname.match(/\/uncategorized$/)) {
    return;
  }

  const gameTable = document.querySelector("table#games");

  if (!gameTable) {
    return;
  }

  const gameRows = gameTable.querySelectorAll("tbody > tr") as NodeListOf<HTMLTableRowElement>;

  const games: { id: string | undefined; status: string[]; playtime: string | undefined; achievements: string | undefined }[] = [];

  gameRows.forEach((row) => {
    const achievementsCell = row.querySelector(".achievements");
    let status = [...row.classList].flatMap((className) => {
      if (className === "game") {
        return [];
      }

      return [className.replace("game-", "")];
    });
    games.push({
      id: row.dataset.item,
      status: status,
      playtime: achievementsCell?.nextElementSibling?.innerHTML,
      achievements: achievementsCell?.innerHTML,
    });
  });

  const heading = document.querySelector("#main > h3");

  const bulkRemoveGamesModal = new BulkRemoveGamesModal({
    target: heading,
    props: {
      games: games,
    },
  });

  addedComponents.push(bulkRemoveGamesModal);
}
