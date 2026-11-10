import { compare } from "compare-versions/lib/esm/compare";
import { GM_deleteValue } from "vite-plugin-monkey/dist/client";
import { lastVersion } from "@/lib/store.svelte";

const LAST_VERSION_WITH_LEGACY_DATA = "1.2.7";
const LEGACY_KEYS = ["hltb-data", "linux-data", "steamspy-data", "linux-last-update", "steamspy-last-update", "bp-game-data-hltb", "bp-game-data-linux", "bp-game-data-steamspy"];

export function removeLegacyGameData() {
  if (!compare(lastVersion.value, LAST_VERSION_WITH_LEGACY_DATA, "<=")) {
    return;
  }

  for (const key of LEGACY_KEYS) {
    GM_deleteValue(key);
  }
}
