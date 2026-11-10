import { BP_VERSION, mountTracked, optionsMenuComponent } from "@/globals";
import UpdateNotifier from "./UpdateNotifier.svelte";
import { compare } from "compare-versions/lib/esm/compare";
import { lastChangelogVersion } from "@/lib/store.svelte";

export default function initUpdateNotifier() {
  if (compare(BP_VERSION, lastChangelogVersion.value, ">")) {
    const updateNotifier = mountTracked(UpdateNotifier, {
      target: document.body,
      props: {
        optionsMenu: optionsMenuComponent.component,
      },
    });

    setTimeout(() => updateNotifier.open(), 100);
  }
}
