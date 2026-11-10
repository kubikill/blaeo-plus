<script lang="ts">
  import Modal from "@/lib/Modal.svelte";
  import { GM_getValue, GM_setValue } from "vite-plugin-monkey/dist/client";

  let saves = $state((GM_getValue("post-saves", []) as BlaeoPlusSave[]).filter((save) => typeof save?.content === "string"));
  let autosaves = $state(GM_getValue("post-autosaves", []) as BlaeoPlusSave[]);
  let isLoadModalVisible = $state(false);
  let isSaveModalVisible = $state(false);
  let isNewSaveModalVisible = $state(false);
  let newSaveName = $state("");
  let currentSave: BlaeoPlusSave = $state({ name: "", content: "" });
  let currentSaveIndex = 0;
  let deleteConfirm = $state(false);
  let message = $state("");
  let isMessageVisible = $state(false);
  const postContent = document.querySelector("form#new_post #post_text") as HTMLTextAreaElement;
  const previewButton = document.querySelector("form#new_post #get-preview");

  function showMessage(newMessage: string) {
    message = newMessage;
    isMessageVisible = true;
    setTimeout(() => {
      isMessageVisible = false;
    }, 5000);
  }

  function showLoadModal(save: BlaeoPlusSave, index: number) {
    isLoadModalVisible = true;
    currentSave = save;
    currentSaveIndex = index;
  }

  function showSaveModal(save: BlaeoPlusSave, index: number) {
    isSaveModalVisible = true;
    currentSave = save;
    currentSaveIndex = index;
    newSaveName = currentSave.name;
  }

  function showNewSaveModal() {
    isNewSaveModalVisible = true;
    newSaveName = new Date().toLocaleString();
  }

  function closeLoadModal() {
    isLoadModalVisible = false;
  }

  function closeSaveModal() {
    isSaveModalVisible = false;
  }

  function closeNewSaveModal() {
    isNewSaveModalVisible = false;
  }

  function handleLoad() {
    postContent.value = currentSave.content;
    closeLoadModal();
    showMessage("Save successfully loaded!");
  }

  function handleSave() {
    currentSave.name = newSaveName;
    currentSave.content = postContent.value;
    GM_setValue("post-saves", saves);
    closeSaveModal();
    showMessage("Saved successfully!");
  }

  function handleDelete() {
    if (deleteConfirm) {
      saves.splice(currentSaveIndex, 1);
      GM_setValue("post-saves", saves);
      closeSaveModal();
      showMessage("Save deleted successfully!");
    } else {
      deleteConfirm = true;
      setTimeout(() => {
        deleteConfirm = false;
      }, 3000);
    }
  }

  function handleNewSave() {
    saves.push({
      name: newSaveName,
      content: postContent.value,
    });
    GM_setValue("post-saves", saves);
    closeNewSaveModal();
    showMessage("Save created successfully!");
  }

  function createAutosave() {
    if (!postContent.value) {
      return;
    }
    autosaves.push({
      name: new Date().toLocaleString(),
      content: postContent.value,
    });
    if (autosaves.length > 5) {
      autosaves.shift();
    }
    GM_setValue("post-autosaves", autosaves);
    showMessage("Autosave created!");
  }

  if (previewButton) {
    previewButton.addEventListener("click", createAutosave);
  }
  window.addEventListener("beforeunload", createAutosave, { once: true });
  document.addEventListener("turbolinks:visit", createAutosave, { once: true });
</script>

<div class="dropdown first">
  <button type="button" class="btn btn-default" data-target="#" data-toggle="dropdown" aria-expanded="false">Load <span class="caret"></span> </button>
  <ul class="dropdown-menu">
    {#each saves as save, index}
      <li>
        <button type="button" class="bp-dropdown-button" onclick={() => showLoadModal(save, index)}>Save {index + 1} - {save?.name} </button>
      </li>
    {/each}

    {#each autosaves as save, index}
      <li>
        <button type="button" class="bp-dropdown-button" onclick={() => showLoadModal(save, index)}>Autosave {index + 1} - {save?.name} </button>
      </li>
    {/each}

    {#if saves.length === 0 && autosaves.length === 0}
      <li>
        <span class="no-saves">No available saves</span>
      </li>
    {/if}
  </ul>
</div>

<div class="dropdown">
  <button type="button" class="btn btn-default" data-target="#" data-toggle="dropdown" aria-expanded="false">Save <span class="caret"></span> </button>
  <ul class="dropdown-menu">
    <li>
      <button class="bp-dropdown-button" type="button" onclick={() => showNewSaveModal()}>Create new save</button>
    </li>
    {#each saves as save, index}
      <li>
        <button class="bp-dropdown-button" type="button" onclick={() => showSaveModal(save, index)}>Save {index + 1} - {save?.name} </button>
      </li>
    {/each}
  </ul>
</div>

<span class="text-success bp-save-alert" class:show-alert={isMessageVisible}>{message}</span>

<Modal class="bp-load-screen" bind:open={isLoadModalVisible} onclose={closeLoadModal} width={500} alignTop>
  {#snippet heading()}Loading save: {currentSave?.name}{/snippet}
  Are you sure you want to load this save? Your current post will be replaced!
  <div class="form-group">
    <label for="bp-save-preview">Save preview:</label>
    <textarea id="bp-save-preview" class="bp-textarea form-control" rows="10" disabled>{currentSave?.content}</textarea>
  </div>
  {#snippet footer()}
    <button type="button" class="btn btn-default" onclick={closeLoadModal}>Cancel</button>
    <button type="button" class="btn btn-primary" onclick={handleLoad}>Load</button>
  {/snippet}
</Modal>

<Modal class="bp-save-screen" bind:open={isSaveModalVisible} onclose={closeSaveModal} width={500} alignTop>
  {#snippet heading()}Saving over save: {currentSave?.name}{/snippet}
  <div class="form-group">
    <label for="bp-new-save-name">Save name:</label>
    <input id="bp-new-save-name" class="form-control" type="text" bind:value={newSaveName} />
  </div>
  {#snippet footer()}
    <button type="button" class="btn btn-danger align-left" onclick={handleDelete}>
      {#if deleteConfirm}
        Are you sure?
      {:else}
        Delete
      {/if}
    </button>
    <button type="button" class="btn btn-default" onclick={closeSaveModal}>Cancel</button>
    <button type="button" class="btn btn-primary" onclick={handleSave}>Save</button>
  {/snippet}
</Modal>

<Modal class="bp-new-save-screen" title="Creating new save" bind:open={isNewSaveModalVisible} onclose={closeNewSaveModal} width={500} alignTop>
  <div class="form-group">
    <label for="bp-new-save-name">Name of new save: </label>
    <input id="bp-new-save-name" class="form-control" type="text" bind:value={newSaveName} />
  </div>
  {#snippet footer()}
    <button type="button" class="btn btn-default" onclick={closeNewSaveModal}>Cancel</button>
    <button type="button" class="btn btn-primary" onclick={handleNewSave}>Create</button>
  {/snippet}
</Modal>

<style lang="scss">
  :global(.bp-modal.bp-save-screen .modal-footer) {
    display: flex;
    justify-content: flex-end;
  }

  .align-left {
    margin-right: auto;
  }

  .dropdown {
    display: inline-block;

    .bp-dropdown-button {
      display: block;
      clear: both;
      appearance: none;
      border: none;
      background-color: transparent;
      padding: 3px 20px;
      width: 100%;
      color: #333333;
      font-weight: normal;
      line-height: 1.42857;
      text-align: left;
      white-space: nowrap;

      &:hover,
      &:focus {
        background-color: #f5f5f5;
        color: #262626;
        text-decoration: none;
      }
    }
  }

  .no-saves {
    padding: 3px 20px;
  }

  .bp-textarea {
    display: block;
  }

  .bp-save-alert {
    visibility: hidden;
    opacity: 0;
    transition-duration: 0.2s;
    transition-property: visibility, opacity;
    transition-timing-function: ease;
    width: 0;

    &.show-alert {
      visibility: visible;
      opacity: 1;
      width: auto;
    }
  }
</style>
