import { mountTracked } from "@/globals";
import QuickRearrangeModal from "./QuickRearrangeModal.svelte";

export default function initListQuickRearrange() {
  const listRearrange = document.querySelector<HTMLElement>("ul#list[data-sortable]");

  if (!listRearrange) {
    return;
  }

  const heading = document.querySelector("#main > h3");
  const listName = heading?.firstChild?.textContent;
  // read list id from current url, then save it to listId variable
  const listId = window.location.pathname.match(/\/lists\/(\w+)/)?.[1];

  if (!heading || !listId) {
    return;
  }

  mountTracked(QuickRearrangeModal, {
    target: heading,
    props: {
      listName: listName ?? "",
      listId: listId,
      gameContainer: listRearrange,
    },
  });
}
