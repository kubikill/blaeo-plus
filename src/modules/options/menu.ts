import { mountTracked, optionsMenuComponent } from "@/globals";
import OptionsMenu from "./OptionsMenu.svelte";
import { removeNodeIfExists } from "@/lib/utilities";

export function initOptionsMenu() {
  const headerDropdown = document.querySelector<HTMLElement>("#navbar .navbar-right > .btn-group > .dropdown-menu");
  const headerDropdownSettingsLink = headerDropdown?.querySelector('[href="/settings"]')?.parentElement;

  if (!headerDropdownSettingsLink) {
    return;
  }

  const optionsMenu = mountTracked(OptionsMenu, { target: document.body, props: {} });
  optionsMenuComponent.component = optionsMenu;

  const optionsButtonTemplate = document.createElement("template");
  optionsButtonTemplate.innerHTML = '<li><button type="button" class="bp-options-button">BLAEO+ settings</button></li>';
  const optionsButtonItem = optionsButtonTemplate.content.firstElementChild as HTMLLIElement;
  optionsButtonItem.querySelector("button")?.addEventListener("click", () => optionsMenu.open());

  headerDropdownSettingsLink.insertAdjacentElement("afterend", optionsButtonItem);
}

export function cleanupOptionsMenu() {
  removeNodeIfExists("#navbar .navbar-right .bp-options-button");
}
