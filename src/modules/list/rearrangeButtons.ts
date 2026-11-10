import { setList } from "@/lib/listService";
import { removeAllNodesIfExist } from "@/lib/utilities";

const BUTTON_CLASS = "bp-rearrange-button";
const ERROR_CLASS = "bp-rearrange-error";
const GAME_SELECTOR = ".game-thumbnail[data-item]";

type ButtonAction = "add" | "remove";

let observers: MutationObserver[] = [];
const pendingSaves = new Map<string, string[]>();
let savingLists = false;

function listIdFromUrl(url: string | null | undefined): string | undefined {
  return url?.match(/\/lists\/(\w+)/)?.[1];
}

function getGameIds(container: Element): string[] {
  return Array.from(container.children).flatMap((child) => (child.matches(GAME_SELECTOR) ? [(child as HTMLElement).dataset.item as string] : []));
}

function showSaveError(list: HTMLElement) {
  if (document.querySelector(`.${ERROR_CLASS}`)) {
    return;
  }

  const error = document.createElement("div");
  error.className = `alert alert-danger ${ERROR_CLASS}`;
  error.textContent = "Couldn't save the list. Reload the page to see its current state.";
  list.before(error);
}

async function savePendingLists(list: HTMLElement) {
  if (savingLists) {
    return;
  }

  savingLists = true;

  for (const [listId, games] of pendingSaves) {
    pendingSaves.delete(listId);

    try {
      await setList(listId, games);
    } catch {
      showSaveError(list);
    }
  }

  savingLists = false;
}

function saveGames(listId: string, games: string[], list: HTMLElement) {
  pendingSaves.set(listId, games);
  savePendingLists(list);
}

function saveList(list: HTMLElement) {
  const games = getGameIds(list);
  const listId = listIdFromUrl(list.dataset.sortable);
  const counter = list.dataset.counter ? document.querySelector(list.dataset.counter) : null;

  if (counter) {
    counter.textContent = `${games.length} game${games.length === 1 ? "" : "s"}`;
  }

  if (listId) {
    saveGames(listId, games, list);
  }
}

function ensureButton(game: Element, action: ButtonAction): HTMLButtonElement {
  let button = game.querySelector<HTMLButtonElement>(`:scope > .${BUTTON_CLASS}`);

  if (!button) {
    button = document.createElement("button");
    button.type = "button";
    game.append(button);
  }

  if (button.dataset.action !== action) {
    button.dataset.action = action;
    button.className = `${BUTTON_CLASS} ${BUTTON_CLASS}-${action}`;
    button.textContent = action === "add" ? "+" : "×";
    button.disabled = false;
    button.title = action === "add" ? "Add to the end of this list" : "Remove from this list";
    button.setAttribute("aria-label", button.title);
  }

  return button;
}

function syncButtons(list: HTMLElement, sourceList: HTMLElement | null) {
  const listedGames = new Set(getGameIds(list));

  list.querySelectorAll(`:scope > ${GAME_SELECTOR}`).forEach((game) => ensureButton(game, "remove"));

  sourceList?.querySelectorAll<HTMLElement>(GAME_SELECTOR).forEach((game) => {
    const button = ensureButton(game, "add");
    const alreadyListed = listedGames.has(game.dataset.item as string);

    if (button.disabled !== alreadyListed) {
      button.disabled = alreadyListed;
      button.title = alreadyListed ? "Already on this list" : "Add to the end of this list";
      button.setAttribute("aria-label", button.title);
    }
  });
}

function addGame(game: HTMLElement, list: HTMLElement) {
  const sourceContainer = game.parentElement as HTMLElement;
  const sourceListId = listIdFromUrl(document.querySelector("#source-list-select li.active a")?.getAttribute("data-sortable"));
  const addedGame = game.cloneNode(true) as HTMLElement;

  addedGame.classList.remove("ui-draggable", "ui-draggable-handle");
  addedGame.removeAttribute("style");
  game.remove();
  list.insertBefore(addedGame, list.querySelector(":scope > .game-trashcan"));
  saveList(list);

  if (sourceListId) {
    saveGames(sourceListId, getGameIds(sourceContainer), list);
  }
}

function handleButtonClick(event: Event, list: HTMLElement) {
  const button = (event.target as Element).closest<HTMLButtonElement>(`.${BUTTON_CLASS}`);
  const game = button?.closest<HTMLElement>(GAME_SELECTOR);

  if (!button || !game) {
    return;
  }

  if (button.dataset.action === "add") {
    addGame(game, list);
  } else {
    game.remove();
    saveList(list);
  }
}

export function initRearrangeButtons() {
  const list = document.querySelector<HTMLElement>("ul#list[data-sortable]");
  const sourceList = document.querySelector<HTMLElement>("#source-list");

  if (!list) {
    return;
  }

  const sync = () => syncButtons(list, sourceList);
  const handleClick = (event: Event) => handleButtonClick(event, list);
  const listObserver = new MutationObserver(sync);

  listObserver.observe(list, { childList: true });
  observers.push(listObserver);
  list.addEventListener("click", handleClick);

  if (sourceList) {
    const sourceObserver = new MutationObserver(sync);

    sourceObserver.observe(sourceList, { childList: true, subtree: true });
    observers.push(sourceObserver);
    sourceList.addEventListener("click", handleClick);
  }

  sync();
}

export function cleanupRearrangeButtons() {
  observers.forEach((observer) => observer.disconnect());
  observers = [];
  removeAllNodesIfExist(`.${BUTTON_CLASS}, .${ERROR_CLASS}`);
}
