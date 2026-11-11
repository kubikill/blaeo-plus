import { ensureGameData } from "./gameData";
import { findSteamId, getLinuxAnchorColumn, hasLeadingIndexColumn } from "./gameTable";
import { removeAllNodesIfExist } from "./utilities";
import { getGamesContainer, type GamesContainer } from "./waitUntilGamesContainerLoaded";

export type GameView = GamesContainer["type"];

export type GameParts = {
  tags?: string;
  links?: string;
  trailingLinks?: string;
  linux?: string;
  times?: string;
};

export type GameDecorator = {
  views?: GameView[];
  setup?: (gamesContainer: GamesContainer) => void;
  render: (game: HTMLElement, steamId: number, view: GameView) => GameParts;
  finish?: () => void;
};

type Run = {
  decorators: GameDecorator[];
  gamesContainer: GamesContainer | null;
  observer: MutationObserver | null;
  seen: WeakSet<Element>;
  queue: HTMLElement[];
  nameIndex: number;
  linuxAnchorIndex: number;
  prepared: boolean;
  pumping: boolean;
  finished: boolean;
  cancelled: boolean;
  done: Promise<void>;
  resolveDone: () => void;
};

function createRun(): Run {
  let resolveDone = () => {};
  const done = new Promise<void>((resolve) => (resolveDone = resolve));

  return {
    decorators: [],
    gamesContainer: null,
    observer: null,
    seen: new WeakSet(),
    queue: [],
    nameIndex: 0,
    linuxAnchorIndex: 2,
    prepared: false,
    pumping: false,
    finished: false,
    cancelled: false,
    done,
    resolveDone,
  };
}

let run = createRun();

function safely(run: Run, decorator: GameDecorator, work: () => void) {
  try {
    work();
  } catch (error) {
    run.decorators = run.decorators.filter((other) => other !== decorator);
    console.error("BLAEO+: a game list module failed", error);
  }
}

function isLoading(run: Run): boolean {
  return !!run.gamesContainer?.container.dataset.delayedLast;
}

function getSteamIds(games: HTMLElement[]): number[] {
  return [...new Set(games.flatMap((game) => findSteamId(game) ?? []))];
}

function collectParts(run: Run, game: HTMLElement, steamId: number, view: GameView) {
  const parts = { tags: "", links: "", trailingLinks: "", linux: "", times: "" };
  let hasLinux = false;
  let hasTimes = false;
  let linuxBesideTimes = false;

  for (const decorator of run.decorators) {
    safely(run, decorator, () => {
      const rendered = decorator.render(game, steamId, view);

      if (rendered.linux !== undefined && !hasLinux) {
        hasLinux = true;
        linuxBesideTimes = hasTimes;
      }

      hasTimes ||= rendered.times !== undefined;

      for (const slot of Object.keys(parts) as (keyof GameParts)[]) {
        parts[slot] += rendered[slot] ?? "";
      }
    });
  }

  return { ...parts, links: parts.links + parts.trailingLinks, hasLinux, hasTimes, linuxBesideTimes };
}

function insertParts(run: Run, game: HTMLElement, steamId: number, view: GameView) {
  const { tags, links, linux, times, hasLinux, hasTimes, linuxBesideTimes } = collectParts(run, game, steamId, view);

  if (view === "table") {
    const anchorCell = game.children[run.linuxAnchorIndex];

    if (tags) game.children[run.nameIndex]?.insertAdjacentHTML("beforeend", tags);
    if (linux) anchorCell?.insertAdjacentHTML("afterend", linux);
    if (times) game.insertAdjacentHTML("beforeend", times);
    if (links) game.querySelector(".toolbar")?.insertAdjacentHTML("beforeend", links);
  } else if (view === "list") {
    const linuxMedia = hasLinux ? `<div class="bp-linux-media">${linux}</div>` : "";
    const timesInfo = hasTimes ? `<div class="bp-list-hltb-info">${times}</div>` : "";
    const bodyHtml = tags + (linuxBesideTimes ? "" : linuxMedia);
    const gameHtml = (linuxBesideTimes ? linuxMedia : "") + timesInfo;

    if (bodyHtml) game.querySelector(".media-body")?.insertAdjacentHTML("beforeend", bodyHtml);
    if (gameHtml) game.insertAdjacentHTML("beforeend", gameHtml);
    if (links) game.querySelector(".media-heading")?.insertAdjacentHTML("beforeend", links);
  } else {
    if (hasLinux) game.querySelector(".caption")?.insertAdjacentHTML("beforeend", `<div class="bp-linux-grid">${linux}</div>`);
    if (tags) game.insertAdjacentHTML("beforeend", tags);
  }
}

function prepare(run: Run, gamesContainer: GamesContainer) {
  const headerRow = gamesContainer.type === "table" ? gamesContainer.container.querySelector("tr") : null;

  run.prepared = true;
  run.nameIndex = hasLeadingIndexColumn(headerRow) ? 1 : 0;
  run.linuxAnchorIndex = getLinuxAnchorColumn(headerRow) - 1;
  run.decorators = run.decorators.filter((decorator) => !decorator.views || decorator.views.includes(gamesContainer.type));

  for (const decorator of run.decorators) {
    safely(run, decorator, () => decorator.setup?.(gamesContainer));
  }
}

function decorate(run: Run, games: HTMLElement[]) {
  const gamesContainer = run.gamesContainer;

  if (!gamesContainer) {
    return;
  }

  if (!run.prepared) {
    prepare(run, gamesContainer);
  }

  for (const game of games) {
    const steamId = game.isConnected ? findSteamId(game) : undefined;

    if (steamId !== undefined) {
      insertParts(run, game, steamId, gamesContainer.type);
    }
  }
}

function finish(run: Run) {
  run.finished = true;

  for (const decorator of run.decorators) {
    safely(run, decorator, () => decorator.finish?.());
  }

  run.resolveDone();
}

async function pump(run: Run) {
  if (run.pumping) {
    return;
  }

  run.pumping = true;

  try {
    while (!run.cancelled && run.queue.length > 0 && !(run.prepared && isLoading(run))) {
      const games = run.queue.splice(0);

      await ensureGameData(getSteamIds(games)).catch((error) => console.error("BLAEO+: some game data is unavailable", error));

      if (run.cancelled) {
        return;
      }

      decorate(run, games);
    }

    if (!run.cancelled && !run.finished && !isLoading(run)) {
      finish(run);
    }
  } finally {
    run.pumping = false;
  }
}

function collect(run: Run) {
  if (run.cancelled || !run.gamesContainer) {
    return;
  }

  for (const game of run.gamesContainer.container.querySelectorAll<HTMLElement>(".game")) {
    if (!run.seen.has(game)) {
      run.seen.add(game);
      run.queue.push(game);
    }
  }

  void pump(run);
}

export function registerGameDecorator(decorator: GameDecorator) {
  run.decorators.push(decorator);
}

export function whenGamesDecorated(): Promise<void> {
  return run.done;
}

export function startGameRows() {
  const current = run;
  const gamesContainer = getGamesContainer();

  if (!gamesContainer) {
    return;
  }

  current.gamesContainer = gamesContainer;
  current.observer = new MutationObserver(() => collect(current));
  current.observer.observe(gamesContainer.container, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-delayed-last"] });

  collect(current);
}

export function stopGameRows() {
  run.cancelled = true;
  run.observer?.disconnect();
  run = createRun();

  removeAllNodesIfExist(".bp-list-hltb-info");
}
