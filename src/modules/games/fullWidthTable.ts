export function initFullWidthTable() {
  let gameContainer = document.querySelector("#games.game-table") as HTMLElement;
  if (!gameContainer) {
    return;
  }

  document.body.classList.add("bp-force-container-fluid");
}
