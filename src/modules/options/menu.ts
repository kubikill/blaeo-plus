import { addedComponents } from "@/globals";
import OptionsMenu from "./OptionsMenu.svelte";
import { removeNodeIfExists } from "@/lib/utilities";

export function initOptionsMenu() {
  const headerDropdown = document.querySelector("#navbar .navbar-right > .btn-group > .dropdown-menu");
  if (!headerDropdown) {
    return;
  }

  // Render options menu
  const optionsMenuComponent = new OptionsMenu({
    target: document.body,
    props: {
      showOptions: false,
    },
  });

  addedComponents.push(optionsMenuComponent);

  const headerDropdownSettingsLink = headerDropdown.querySelector('[href="/settings"]').parentElement;

  let optionsButtonTemplate = document.createElement("template");
  optionsButtonTemplate.innerHTML =
    '<li><button type="button" class="bp-options-button">BLAEO+ settings</button></li>'.trim();
  let optionsButton = optionsButtonTemplate.content.firstElementChild;
  optionsButton.addEventListener("click", () => {
    optionsMenuComponent.$set({ showOptions: true });
  });

  headerDropdownSettingsLink.insertAdjacentElement("afterend", optionsButton);
}

export function cleanupOptionsMenu() {
  removeNodeIfExists("#navbar .navbar-right .bp-options-button");
}
