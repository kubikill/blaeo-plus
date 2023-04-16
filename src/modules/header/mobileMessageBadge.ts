// Add shortcuts to the user dropdown in navbar

export default function addMobileMessageBadge() {
  const navbarMessagesBadge = document.querySelector('#navbar .navbar-right [href="/replies"] .badge');

  if (!navbarMessagesBadge) {
    return;
  }

  const navbarMenuToggle = document.querySelector(".navbar .navbar-header .navbar-toggle");

  const badgeClone = navbarMessagesBadge.cloneNode(true);
  navbarMenuToggle.appendChild(badgeClone);
}
