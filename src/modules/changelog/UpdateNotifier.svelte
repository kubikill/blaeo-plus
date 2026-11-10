<script lang="ts">
  import Modal from "@/lib/Modal.svelte";
  import { BP_VERSION } from "@/globals";
  import Changelog from "./Changelog.svelte";
  import { blaeoPlusLogo } from "@/assets/icons";
  import OptionsToggle from "../options/OptionsToggle.svelte";
  import { lastChangelogVersion, options } from "@/lib/store.svelte";

  interface Props {
    optionsMenu?: { open(): void } | null;
  }

  let { optionsMenu = null }: Props = $props();
  let showModal = $state(false);

  export function open() {
    showModal = true;
  }

  function goToOptions() {
    optionsMenu?.open();
    hideModal();
  }

  function hideModal() {
    showModal = false;
    lastChangelogVersion.value = BP_VERSION;
  }
</script>

<Modal class="bp-update-notifier-modal" bind:open={showModal} onclose={hideModal} width={800} closeOnBackdrop={false}>
  {#snippet heading()}{@html blaeoPlusLogo} BLAEO+ updated to v{BP_VERSION}!{/snippet}
  <p>A new update for BLAEO+ has been installed. Changelog available below:</p>
  <Changelog />
  {#snippet footer()}
    <OptionsToggle id="bp-options-modules-misc-update-notifier" bind:boundValue={options.modules.misc.updateNotifier}>Show changelog when new update is installed (can be later reenabled in options)</OptionsToggle>
    <button type="button" class="btn btn-default" onclick={goToOptions}>Settings</button>
    <button type="button" class="btn btn-primary" onclick={hideModal}>Close</button>
  {/snippet}
</Modal>

<style lang="scss">
  :global(.bp-modal.bp-update-notifier-modal .modal-footer) {
    display: flex;
  }

  :global(.bp-update-notifier-modal .toggle-row) {
    display: inline-flex;
    align-items: center;
    margin-right: auto;
    margin-bottom: 0;
    height: 34px;
    vertical-align: middle;
    text-align: left;
  }

  :global(.bp-update-notifier-modal .toggle-item) {
    margin-bottom: 0;
  }
</style>
