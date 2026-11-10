<script lang="ts">
  import Modal from "@/lib/Modal.svelte";
  import { options } from "@/lib/store.svelte";
  interface Props {
    showModal?: boolean;
    name: string;
  }

  let { showModal = $bindable(false), name }: Props = $props();

  let note = $state("");

  function addToBlacklist() {
    options.blacklist[name] = {
      note: note,
    };
    hideModal();
  }

  function hideModal() {
    showModal = false;
  }
</script>

<Modal class="bp-blacklist-modal" bind:open={showModal} onclose={hideModal}>
  {#snippet heading()}Adding {name} to blacklist{/snippet}
  <label for="bp-blacklist-modal-note">Note:</label>
  <textarea class="form-control" id="bp-blacklist-modal-note" bind:value={note}></textarea>
  {#snippet footer()}
    <button type="button" class="btn btn-default" onclick={hideModal}>Cancel</button>
    <button type="button" class="btn btn-primary" onclick={addToBlacklist}>Add</button>
  {/snippet}
</Modal>

<style lang="scss">
  label,
  textarea {
    width: 100%;
  }
</style>
