// Add shortcuts to the user dropdown in navbar

import { removeNodeIfExists } from "@/lib/utilities";

export function addHeaderShortcuts() {
  const headerDropdown = document.querySelector("#navbar .navbar-right > .btn-group > .dropdown-menu");

  if (!headerDropdown) {
    return;
  }

  const headerDropdownProfileLink = headerDropdown.firstElementChild;
  headerDropdownProfileLink.insertAdjacentHTML(
    "afterend",
    '<li class="bp-new-post-shortcut"><a href="/posts/new">New post</a></li>'
  );
}

export function cleanupHeaderShortcuts() {
  removeNodeIfExists("#navbar .navbar-right .bp-new-post-shortcut");
}
