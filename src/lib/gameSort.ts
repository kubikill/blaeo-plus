import { hltbData } from "./gameData";
import { getSteamHuntersTime } from "./steamHunters";
import { stripLeadingArticle } from "./utilities";

type SortableGame = { steamId: number; name?: string; playtime?: number };
type GameSortOptions = { sortBy: string; order: string; ignoreLeadingArticles: boolean };
type SortValue = string | number | undefined;

const HLTB_SORT_FIELDS = { "hltb-main": "main", "hltb-extra": "extra", "hltb-100": "everything" } as const;

function getSortValue(game: SortableGame, { sortBy, ignoreLeadingArticles }: GameSortOptions): SortValue {
  switch (sortBy) {
    case "name":
      return ignoreLeadingArticles && game.name ? stripLeadingArticle(game.name) : game.name;
    case "playtime":
      return game.playtime;
    case "steamhunters":
      return getSteamHuntersTime(game.steamId);
    default:
      return hltbData[game.steamId]?.[HLTB_SORT_FIELDS[sortBy as keyof typeof HLTB_SORT_FIELDS]] || undefined;
  }
}

function compareSortValues(a: SortValue, b: SortValue, order: string): number {
  if (a === undefined || b === undefined) {
    return +(a === undefined) - +(b === undefined);
  }

  const result = typeof a === "string" && typeof b === "string" ? a.localeCompare(b) : +a - +b;

  return order === "asc" ? result : -result;
}

export function sortGamesBy<T>(games: T[], toSortable: (game: T) => SortableGame, options: GameSortOptions): T[] {
  return games
    .map((game) => ({ game, value: getSortValue(toSortable(game), options) }))
    .sort((a, b) => compareSortValues(a.value, b.value, options.order))
    .map(({ game }) => game);
}
