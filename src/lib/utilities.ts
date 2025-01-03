export function splitArrayIntoChunks(array: Array<any>, chunkSize: number) {
  if (chunkSize <= 0) {
    throw new Error("Chunk size must be 1 or higher");
  }

  let chunks = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }

  return chunks;
}

export function isObject(item: any) {
  return item && typeof item === "object" && !Array.isArray(item);
}

export function mergeDeep(target: any, ...sources: any[]) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

export function removeNodeIfExists(selectors: string) {
  const querySelectorResult = document.querySelector(selectors);

  if (querySelectorResult) {
    querySelectorResult.remove();
  }
}

export function removeAllNodesIfExist(selectors: string) {
  const querySelectorResult = document.querySelectorAll(selectors);

  querySelectorResult.forEach((element) => {
    element.remove();
  });
}

export function getAuthenticityToken(): string {
  const authenticityTokenElement = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');

  if (authenticityTokenElement) {
    return authenticityTokenElement.content;
  }

  return "";
}

export function reformatBlaeoGameListToSteamIdColumn(blaeoGameList: BlaeoGamesJson): BlaeoGamesSteamIdJson {
  const gameList: any = {};

  for (let game of blaeoGameList) {
    gameList[game.steam_id.toString()] = game;
  }

  return gameList;
}

export function reformatBlaeoGameListToBlaeoIdColumn(blaeoGameList: BlaeoGamesJson): BlaeoGamesSteamIdJson {
  const gameList: any = {};

  for (let game of blaeoGameList) {
    gameList[game.id] = game;
  }

  return gameList;
}
