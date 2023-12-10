<script lang="ts">
  import { blaeoPlusLogo } from "@/assets/icons";
  import OptionsTab from "./tabs/OptionsTab.svelte";
  import Tabs from "@/lib/Tabs.svelte";
  import AboutTab from "./tabs/AboutTab.svelte";
  import ChangelogTab from "./tabs/ChangelogTab.svelte";
  import BlacklistTab from "./tabs/BlacklistTab.svelte";
  import ListBackupsTab from "./tabs/ListBackupsTab.svelte";
  export let showOptions: boolean;

  let activeTab = 0;

  function hideModal() {
    showOptions = false;
    setTimeout(() => {
      activeTab = 0;
    }, 1000);
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="bp-options-screen" role="presentation" class:visible={showOptions === true} on:click|self={hideModal}>
  <div class="modal-content">
    <div class="modal-header">
      <h2 class="modal-header-heading">{@html blaeoPlusLogo} BLAEO+ Settings</h2>
      <button type="button" aria-label="Close" on:click={hideModal}>
        <i class="fa fa-close" />
      </button>
    </div>
    <div class="modal-body">
      <Tabs
        tabs={[
          { name: "Options", content: OptionsTab },
          { name: "Blacklist", content: BlacklistTab },
          { name: "List backups", content: ListBackupsTab },
          { name: "Changelog", content: ChangelogTab },
          { name: "About", content: AboutTab },
        ]}
        bind:activeTab
      />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-default" on:click={hideModal}>Close</button>
    </div>
  </div>
</div>

<style lang="scss">
  .bp-options-screen {
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

    @media (min-width: 768px) {
      padding: 32px 64px;
    }

    &.visible {
      visibility: visible;
      opacity: 1;
    }

    .modal-content {
      display: flex;
      flex-direction: column;
      max-height: 100%;
      max-width: 800px;
      margin: 0 auto;
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
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .toggle-item-sub {
      margin-left: 8px;
    }
  }
</style>
