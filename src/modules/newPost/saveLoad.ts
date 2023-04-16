import SaveLoad from "./SaveLoad.svelte";

export function initSaveLoad() {
  const newPostForm = document.getElementById("new_post");

  if (!newPostForm) {
    return;
  }

  const buttonGroup = newPostForm.querySelector("div:last-child");

  const saveLoadComponent = new SaveLoad({
    target: buttonGroup,
  });
}
