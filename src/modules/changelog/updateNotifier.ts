import { BP_VERSION, lastVersion, optionsMenuComponent } from "@/globals";
import UpdateNotifier from "./UpdateNotifier.svelte";
import type { SvelteComponent } from "svelte";
import { compare } from "compare-versions/lib/esm/compare";

export default function initUpdateNotifier() {
  console.log(BP_VERSION, lastVersion, compare(BP_VERSION, lastVersion, ">"));
  if (compare(BP_VERSION, lastVersion, ">")) {
    const updateNotifierComponent = new UpdateNotifier({
      target: document.body,
      props: {
        showModal: false,
        optionsMenu: optionsMenuComponent.component,
      },
    }) as SvelteComponent;

    setTimeout(() => {
      updateNotifierComponent.$set({ showModal: true });
    }, 100);
  }
}
