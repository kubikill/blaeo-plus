<script lang="ts">
  import { onDestroy } from "svelte";
  import { GM_getValue, GM_setValue } from "vite-plugin-monkey/dist/client";

  let saves = GM_getValue("post-saves", [{ name: "test" }]) as blaeoPlusSave[];
  let autosaves = GM_getValue("post-autosaves", []) as blaeoPlusSave[];
  let isLoadModalVisible = false;
  let isSaveModalVisible = false;
  let isNewSaveModalVisible = false;
  let newSaveName = "";
  let currentSave: blaeoPlusSave;
  let currentSaveIndex = 0;
  let deleteConfirm = false;
  let message = "";
  let isMessageVisible = false;
  const postContent = document.querySelector("form#new_post #post_text") as HTMLTextAreaElement;
  const previewButton = document.querySelector("form#new_post #get-preview");

  function showMessage(newMessage) {
    message = newMessage;
    isMessageVisible = true;
    setTimeout(() => {
      isMessageVisible = false;
    }, 5000);
  }

  function showLoadModal(save: blaeoPlusSave, index: number) {
    isLoadModalVisible = true;
    currentSave = save;
    currentSaveIndex = index;
  }

  function showSaveModal(save: blaeoPlusSave, index: number) {
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
    saves = saves;
    showMessage("Saved successfully!");
  }

  function handleDelete() {
    if (deleteConfirm) {
      saves.splice(currentSaveIndex, 1);
      GM_setValue("post-saves", saves);
      closeSaveModal();
      saves = saves;
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
    saves = saves;
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
    autosaves = autosaves;
    showMessage("Autosave created!");
  }

  previewButton.addEventListener("click", createAutosave);
  window.addEventListener("beforeunload", createAutosave, { once: true });
  document.addEventListener("turbolinks:visit", createAutosave, { once: true });
</script>

<div class="dropdown first">
  <button type="button" class="btn btn-default" data-target="#" data-toggle="dropdown" aria-expanded="false"
    >Load <span class="caret" />
  </button>
  <ul class="dropdown-menu">
    {#each saves as save, index}
      <li>
        <button type="button" class="bp-dropdown-button" on:click={() => showLoadModal(save, index)}
          >Save {index + 1} - {save?.name}
        </button>
      </li>
    {/each}

    {#each autosaves as save, index}
      <li>
        <button type="button" class="bp-dropdown-button" on:click={() => showLoadModal(save, index)}
          >Autosave {index + 1} - {save?.name}
        </button>
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
  <button type="button" class="btn btn-default" data-target="#" data-toggle="dropdown" aria-expanded="false"
    >Save <span class="caret" />
  </button>
  <ul class="dropdown-menu">
    <li>
      <button class="bp-dropdown-button" type="button" on:click={() => showNewSaveModal()}>Create new save</button>
    </li>
    {#each saves as save, index}
      <li>
        <button class="bp-dropdown-button" type="button" on:click={() => showSaveModal(save, index)}
          >Save {index + 1} - {save?.name}
        </button>
      </li>
    {/each}
  </ul>
</div>

<span class="text-success bp-save-alert" class:show-alert={isMessageVisible}>{message}</span>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="bp-load-screen bp-modal" class:visible={isLoadModalVisible} on:click|self={closeLoadModal}>
  <div class="modal-content">
    <div class="modal-header">
      <h2>Loading save: {currentSave?.name}</h2>
      <button type="button" class="close" aria-label="Close" on:click={closeLoadModal}>
        <span aria-hidden="true">× </span>
      </button>
    </div>
    <div class="modal-body">
      Are you sure you want to load this save? Your current post will be replaced!
      <div class="form-group">
        <label for="bp-save-preview">Save preview:</label>
        <textarea id="bp-save-preview" class="bp-textarea form-control" rows="10" disabled
          >{currentSave?.content}</textarea
        >
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-default" on:click={closeLoadModal}>Cancel</button>
      <button type="button" class="btn btn-primary" on:click={handleLoad}>Load</button>
    </div>
  </div>
</div>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="bp-save-screen bp-modal" class:visible={isSaveModalVisible} on:click|self={closeSaveModal}>
  <div class="modal-content">
    <div class="modal-header">
      <h2>Saving over save: {currentSave?.name}</h2>
      <button type="button" class="close" aria-label="Close" on:click={closeSaveModal}>
        <span aria-hidden="true">×</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="bp-new-save-name">Save name:</label>
        <input id="bp-new-save-name" class="form-control" type="text" bind:value={newSaveName} />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-danger align-left" on:click={handleDelete}>
        {#if deleteConfirm}
          Are you sure?
        {:else}
          Delete
        {/if}
      </button>
      <button type="button" class="btn btn-default" on:click={closeSaveModal}>Cancel</button>
      <button type="button" class="btn btn-primary" on:click={handleSave}>Save</button>
    </div>
  </div>
</div>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="bp-new-save-screen bp-modal" class:visible={isNewSaveModalVisible} on:click|self={closeNewSaveModal}>
  <div class="modal-content">
    <div class="modal-header">
      <h2>Creating new save</h2>
      <button type="button" class="close" aria-label="Close" on:click={closeNewSaveModal}>
        <span aria-hidden="true">×</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="bp-new-save-name">Name of new save: </label>
        <input id="bp-new-save-name" class="form-control" type="text" bind:value={newSaveName} />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-default" on:click={closeNewSaveModal}>Cancel</button>
      <button type="button" class="btn btn-primary" on:click={handleNewSave}>Create</button>
    </div>
  </div>
</div>

<style lang="scss">
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

  .bp-modal {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    justify-content: center;
    align-items: flex-start;
    visibility: hidden;
    opacity: 0;
    z-index: 2000;
    transition-duration: 0.2s;
    transition-property: visibility, opacity;
    transition-timing-function: ease;
    background-color: #00000080;
    padding: 16px;
    width: 100%;
    height: 100%;

    @media (min-width: 768px) {
      padding: 64px;
    }

    &.visible {
      visibility: visible;
      opacity: 1;
    }

    .modal-content {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 500px;
      height: auto;
    }

    .modal-header {
      display: flex;

      > button {
        align-self: flex-start;
        margin-left: auto;
      }

      > h2 {
        margin: 0;
      }
    }

    .modal-body {
      overflow: auto;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;

      .align-left {
        margin-right: auto;
      }
    }
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
