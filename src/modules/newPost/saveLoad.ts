import { mountTracked } from "@/globals";
import SaveLoad from "./SaveLoad.svelte";

export function initSaveLoad() {
  const newPostForm = document.getElementById("new_post");

  if (!newPostForm) {
    return;
  }

  const buttonGroup = newPostForm.querySelector("div:last-child");
  const previewButton = buttonGroup?.querySelector("#get-preview")?.nextElementSibling;

  if (!buttonGroup || !previewButton) {
    return;
  }

  mountTracked(SaveLoad, {
    target: buttonGroup,
    anchor: previewButton,
  });
}
