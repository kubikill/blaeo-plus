let gamesContainerLoaded = false;
let gamesContainerWaitingPromise: Promise<void> | null = null;

export function getGamesContainer() {
  let gameContainer = document.querySelector("table#games") as HTMLElement;

  if (gameContainer) {
    return {
      type: "table",
      container: gameContainer,
    };
  }

  if (document.querySelector("div#games > .game.game-media")) {
    return {
      type: "list",
      container: document.querySelector("#games") as HTMLElement,
    };
  }

  if (document.querySelector("#main > ul.games")) {
    return {
      type: "grid",
      container: document.querySelector("#main > ul.games") as HTMLElement,
    };
  }

  if (document.querySelector("#main > .game.game-media")) {
    return {
      type: "list",
      container: document.querySelector("#main") as HTMLElement,
    };
  }

  return false;
}

export function isGamesContainerLoaded() {
  return gamesContainerLoaded;
}

export function waitUntilGamesContainerLoaded() {
  const gamesContainer = getGamesContainer();

  if (!gamesContainer) {
    return Promise.reject();
  }

  if (!gamesContainer.container.dataset.delayedLast) {
    return Promise.resolve();
  }

  if (gamesContainerWaitingPromise === null) {
    gamesContainerWaitingPromise = new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!gamesContainer.container.dataset.delayedLast) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  }

  return gamesContainerWaitingPromise;
}
