// Add a messages button

export default function initMobileMessageIcon() {
  const navbarMessagesButton = document.querySelector('#navbar .navbar-right [href="/replies"]') as HTMLAnchorElement;

  if (!navbarMessagesButton) {
    return;
  }

  const navbarMenuToggle = document.querySelector(".navbar .navbar-header .navbar-toggle");

  const navbarMessagesButtonClone = navbarMessagesButton.cloneNode(true) as HTMLAnchorElement;
  navbarMessagesButtonClone.classList.add("hidden-md", "hidden-lg");
  navbarMessagesButtonClone.classList.add("bp-mobile-messages");
  navbarMenuToggle.insertAdjacentElement("afterend", navbarMessagesButtonClone);

  navbarMessagesButton.classList.add("hidden-xs", "hidden-sm");
}
