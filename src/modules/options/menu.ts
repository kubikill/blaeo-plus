import OptionsMenu from "./OptionsMenu.svelte";

export function initMenu() {
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

  const headerDropdownSettingsLink = headerDropdown.querySelector('[href="/settings"]').parentElement;

  let optionsButtonTemplate = document.createElement("template");
  optionsButtonTemplate.innerHTML =
    '<li><button type="button" class="bp-settings">BLAEO+ settings</button></li>'.trim();
  let optionsButton = optionsButtonTemplate.content.firstElementChild;
  optionsButton.addEventListener("click", () => {
    optionsMenuComponent.$set({ showOptions: true });
  });

  headerDropdownSettingsLink.insertAdjacentElement("afterend", optionsButton);
}
