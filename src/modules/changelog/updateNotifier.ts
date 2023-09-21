import { BP_VERSION, addedComponents, optionsMenuComponent } from "@/globals";
import UpdateNotifier from "./UpdateNotifier.svelte";
import type { SvelteComponent } from "svelte";
import { compare } from "compare-versions/lib/esm/compare";
import { get } from "svelte/store";
import { lastVersionStore } from "@/lib/store";

export default function initUpdateNotifier() {
  if (compare(BP_VERSION, get(lastVersionStore), ">")) {
    const updateNotifierComponent = new UpdateNotifier({
      target: document.body,
      props: {
        showModal: false,
        optionsMenu: optionsMenuComponent.component,
      },
    }) as SvelteComponent;

    addedComponents.push(updateNotifierComponent);

    setTimeout(() => {
      updateNotifierComponent.$set({ showModal: true });
    }, 100);
  }
}
