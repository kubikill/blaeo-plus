// Add missing games shortcut to "My Games" dropdown

import { userData } from "@/globals";
import { removeNodeIfExists } from "@/lib/utilities";

export function addMissingGamesShortcut() {
  const myGamesDropdown = document.querySelector("#navbar .navbar-right > li.dropdown  > .dropdown-menu");

  if (!myGamesDropdown) {
    return;
  }

  const myGamesDivider = myGamesDropdown.querySelector(".divider");

  if (myGamesDivider) {
    myGamesDivider.insertAdjacentHTML("beforebegin", `<li class="bp-missing-games-shortcut"><a href="/users/${userData.name}/games/missing">Missing games</a></li>`);
  }
}

export function cleanupMissingShortcuts() {
  removeNodeIfExists("#navbar .navbar-right .bp-missing-games-shortcut");
}
