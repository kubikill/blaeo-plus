let gamesContainerWaitingPromise: Promise<void> | null = null;
let gamesContainerWaitingFor: HTMLElement | null = null;

export type GamesContainer = {
  type: "table" | "list" | "grid";
  container: HTMLElement;
};

export function getGamesContainer(): GamesContainer | false {
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

export function waitUntilGamesContainerLoaded() {
  const gamesContainer = getGamesContainer();

  if (!gamesContainer) {
    return Promise.reject(new Error("No games container on this page"));
  }

  if (!gamesContainer.container.dataset.delayedLast) {
    return Promise.resolve();
  }

  if (gamesContainerWaitingPromise === null || gamesContainerWaitingFor !== gamesContainer.container) {
    const container = gamesContainer.container;
    gamesContainerWaitingFor = container;
    gamesContainerWaitingPromise = new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!container.isConnected) {
          // User navigated away before the games finished loading; stop polling and leave the promise pending.
          clearInterval(interval);
          return;
        }

        if (!container.dataset.delayedLast) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  }

  return gamesContainerWaitingPromise;
}
