// Add uncategorized games shortcut to "My Games" dropdown

import { userData } from "@/globals";
import { removeNodeIfExists } from "@/lib/utilities";

export function addUncategorizedGamesShortcut() {
  const myGamesDropdown = document.querySelector("#navbar .navbar-right > li.dropdown  > .dropdown-menu");

  if (!myGamesDropdown) {
    return;
  }

  const myGamesWontPlay = myGamesDropdown.querySelector("a.wont-play");

  if (myGamesWontPlay) {
    myGamesWontPlay.parentElement?.insertAdjacentHTML("afterend", `<li class="bp-uncategorized-games-shortcut"><a class="uncategorized" href="/users/${userData.name}/games/uncategorized">Uncategorized</a></li>`);
  }
}

export function cleanupUncategorizedGamesShortcut() {
  removeNodeIfExists("#navbar .navbar-right .bp-uncategorized-games-shortcut");
}
