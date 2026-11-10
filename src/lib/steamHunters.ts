import { isUnknownToBackend, steamHuntersData } from "./gameData";
import { enqueueGames } from "./hltbService";
import { formatDuration } from "./utilities";

export function getSteamHuntersUrl(steamId: number): string {
  return `https://steamhunters.com/apps/${steamId}`;
}

export function getSteamHuntersTime(steamId: number): number | undefined {
  const median = steamHuntersData[steamId]?.median;
  return median ? median * 60 : undefined;
}

export function formatSteamHuntersTime(steamId: number, noAchievements = false): string {
  const game = steamHuntersData[steamId];

  if (game?.median) {
    return formatDuration(game.median * 60, game.perfected);
  }

  if (noAchievements) {
    return "N/A";
  }

  return game ? "No data" : "Unknown";
}

export function steamHuntersTitle(steamId: number, noAchievements = false): string {
  const game = steamHuntersData[steamId];

  if (game?.median) {
    return `Median time to complete on SteamHunters, from ${game.perfected} player(s) who completed it`;
  }

  if (noAchievements) {
    return "This game has no achievements";
  }

  return game ? "Not completed by any SteamHunters player yet" : "Not looked up on SteamHunters yet";
}

export function enqueueUnknownSteamHuntersGames(games: QueryGame[]) {
  enqueueGames(games.filter((game) => isUnknownToBackend("steamhunters", game.steamId)));
}
