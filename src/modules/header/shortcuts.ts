// Add shortcuts to the user dropdown in navbar

export default function addHeaderShortcuts() {
  const headerDropdown = document.querySelector("#navbar .navbar-right > .btn-group > .dropdown-menu");

  if (!headerDropdown) {
    return;
  }

  const headerDropdownProfileLink = headerDropdown.firstElementChild;
  headerDropdownProfileLink.insertAdjacentHTML("afterend", '<li><a href="/posts/new">New post</a></li>');
}
