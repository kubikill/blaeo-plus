<script lang="ts">
  import { optionsStore } from "@/lib/store";
  export let showModal = false;
  export let name: string;

  let note = "";

  function addToBlacklist() {
    $optionsStore.blacklist[name] = {
      note: note,
    };
    hideModal();
  }

  function hideModal() {
    showModal = false;
  }
</script>

<div class="bp-blacklist-modal" role="presentation" class:visible={showModal === true} on:click|self={hideModal}>
  <div class="modal-content">
    <div class="modal-header">
      <h2 class="modal-header-heading">Adding {name} to blacklist</h2>
      <button type="button" aria-label="Close" on:click={hideModal}>
        <i class="fa fa-close" />
      </button>
    </div>
    <div class="modal-body">
      <label for="bp-blacklist-modal-note">Note:</label>
      <textarea class="form-control" id="bp-blacklist-modal-note" bind:value={note} />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-default" on:click={hideModal}>Cancel</button>
      <button type="button" class="btn btn-primary" on:click={addToBlacklist}>Add</button>
    </div>
  </div>
</div>

<style lang="scss">
  .bp-blacklist-modal {
    position: fixed;
    top: 0;
    left: 0;
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
    display: flex;
    align-items: center;
    justify-content: center;

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
      max-height: 100%;
      width: 100%;
      max-width: 700px;
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

      h3 {
        margin-top: 0;
      }
    }
  }

  label {
    width: 100%;
  }

  textarea {
    width: 100%;
  }
</style>
