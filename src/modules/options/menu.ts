import { addedComponents } from "@/globals";
import OptionsMenu from "./OptionsMenu.svelte";
import { removeNodeIfExists } from "@/lib/utilities";
import type { SvelteComponent } from "svelte";
import { optionsStore } from "@/lib/store";
import { get } from "svelte/store";

let options = get(optionsStore) as Options;
optionsStore.subscribe((value) => {
  options = value;
});

export function initOptionsMenu() {
  const headerDropdown = document.querySelector("#navbar .navbar-right > .btn-group > .dropdown-menu") as HTMLElement;
  if (!headerDropdown) {
    return;
  }

  // Render options menu
  const optionsMenuComponent = new OptionsMenu({
    target: document.body,
    props: {
      showOptions: false,
      options: options,
    },
  }) as SvelteComponent;

  addedComponents.push(optionsMenuComponent);

  const headerDropdownSettingsLink = headerDropdown!.querySelector('[href="/settings"]')!.parentElement;

  let optionsButtonTemplate = document.createElement("template");
  optionsButtonTemplate.innerHTML = '<li><button type="button" class="bp-options-button">BLAEO+ settings</button></li>'.trim();
  let optionsButton = optionsButtonTemplate.content.firstElementChild as HTMLButtonElement;
  optionsButton!.addEventListener("click", () => {
    optionsMenuComponent.$set({ showOptions: true });
  });

  headerDropdownSettingsLink!.insertAdjacentElement("afterend", optionsButton);
}

export function cleanupOptionsMenu() {
  removeNodeIfExists("#navbar .navbar-right .bp-options-button");
}
