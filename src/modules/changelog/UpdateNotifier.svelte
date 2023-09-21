<script lang="ts">
  import { BP_VERSION } from "@/globals";
  import Changelog from "./Changelog.svelte";
  import { blaeoPlusLogo } from "@/assets/icons";
  import OptionsToggle from "../options/OptionsToggle.svelte";
  import { lastVersionStore, optionsStore } from "@/lib/store";
  import { GM_setValue } from "vite-plugin-monkey/dist/client";
  import OptionsMenu from "../options/OptionsMenu.svelte";

  export let showModal = false;
  export let optionsMenu: OptionsMenu;

  function goToOptions() {
    optionsMenu.$set({ showOptions: true });
    hideModal();
  }

  function hideModal() {
    showModal = false;
    $lastVersionStore = BP_VERSION;
  }
</script>

<div class="bp-update-notifier-modal" class:visible={showModal === true}>
  <div class="modal-content">
    <div class="modal-header">
      <h2 class="modal-header-heading">{@html blaeoPlusLogo} BLAEO+ updated to v{BP_VERSION}!</h2>
      <button type="button" aria-label="Close" on:click={hideModal}>
        <i class="fa fa-close" />
      </button>
    </div>
    <div class="modal-body">
      <p>A new update for BLAEO+ has been installed. Changelog available below:</p>
      <Changelog />
    </div>
    <div class="modal-footer">
      <OptionsToggle id="bp-options-modules-misc-update-notifier" bind:boundValue={$optionsStore.modules.misc.updateNotifier}>Notify me about updates (can be later reenabled in options)</OptionsToggle>
      <button type="button" class="btn btn-default" on:click={goToOptions}>Settings</button>
      <button type="button" class="btn btn-primary" on:click={hideModal}>Close</button>
    </div>
  </div>
</div>

<style lang="scss">
  .bp-update-notifier-modal {
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

    :global(.toggle-row) {
      display: inline-flex;
      align-items: center;
      margin-bottom: 0;
      height: 34px;
      vertical-align: middle;
      margin-right: auto;
      text-align: left;
    }

    :global(.toggle-item) {
      margin-bottom: 0;
    }

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

      .modal-header-heading {
        display: flex;
      }

      :global(svg) {
        flex-shrink: 0;
        margin-right: 8px;
        height: 39px;
      }
    }

    .modal-body {
      overflow: auto;

      h3 {
        margin-top: 0;
      }

      ul {
        list-style: none;
        padding-left: 16px;

        li {
          display: flex;
          margin-bottom: 4px;

          &.info {
            margin-top: 12px;
            font-style: italic;
          }

          :global(svg) {
            margin-right: 8px;
          }

          :global(.icon) {
            margin-right: 28px;
          }
        }
      }
    }

    .modal-footer {
      display: flex;
    }
  }
</style>
