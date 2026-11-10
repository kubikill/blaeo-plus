import { compare } from "compare-versions/lib/esm/compare";
import { automaticHltbPresets, lastVersion } from "@/lib/store.svelte";

const LAST_VERSION_WITH_OLD_PRESETS = "1.2.7";

function getFallbackTime(preset: any): AutomaticHltbPreset["fallbackTime"] {
  switch (preset.gamesWithoutHltbBehavior) {
    case "allplaystyles":
      return "allplaystyles";
    case "othersource":
      return preset.listBy === "steamhunters" ? "everything" : "steamhunters";
    default:
      return "none";
  }
}

function migratePreset(preset: any): AutomaticHltbPreset {
  const { gamesWithoutHltbBehavior, gamesWithoutHltbReportThreshold, gamesWithoutHltbList, mpOnlyListArray, endlessListArray, gamesWithoutHltbListArray, ...settings } = preset;

  return {
    ...settings,
    fallbackTime: getFallbackTime(preset),
    noTimeBehavior: gamesWithoutHltbBehavior === "separate" ? "separate" : "exclude",
    noTimeList: gamesWithoutHltbList ?? [],
    minHltbReports: preset.listBy === "steamhunters" ? "1" : (gamesWithoutHltbReportThreshold ?? "1"),
    minSteamHuntersPlayers: preset.listBy === "steamhunters" ? (gamesWithoutHltbReportThreshold ?? "1") : "1",
    listArray: preset.listArray.map(({ playtime, maxPlaytime, tagId }: AutomaticHltbTimeList) => ({ playtime, maxPlaytime, tagId })),
  };
}

export function migrateListMakerPresets() {
  if (!compare(lastVersion.value, LAST_VERSION_WITH_OLD_PRESETS, "<=")) {
    return;
  }

  automaticHltbPresets.forEach((preset, index) => {
    if ("gamesWithoutHltbBehavior" in preset) {
      automaticHltbPresets[index] = migratePreset(preset);
    }
  });
}
