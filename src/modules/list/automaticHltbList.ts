import { mountTracked } from "@/globals";
import AutomaticListModal from "./AutomaticHltbListModal.svelte";

export default function initAutomaticList() {
  const listRearrange = document.querySelector("table.lists-table[data-rearrange]");

  if (!listRearrange) {
    return;
  }

  listRearrange.insertAdjacentHTML("beforebegin", '<div class="bp-automatic-hltb-list-element"></div>');

  const automaticListModalContainer = document.querySelector(".bp-automatic-hltb-list-element");

  if (!automaticListModalContainer) {
    return;
  }

  mountTracked(AutomaticListModal, {
    target: automaticListModalContainer,
  });
}
