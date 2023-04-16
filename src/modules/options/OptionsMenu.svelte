<script>
  import { enqueueEntireLibrary } from "@/lib/hltbService";
  import { BP_VERSION, options } from "@/globals";
  import { GM_setValue } from "vite-plugin-monkey/dist/client";
  import OptionsItem from "./OptionsItem.svelte";
  import OptionsToggle from "./OptionsToggle.svelte";

  export let showOptions;

  function hideModal() {
    showOptions = false;
  }

  $: GM_setValue("bp-options", JSON.stringify(options));
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="bp-options-screen" class:visible={showOptions === true} on:click|self={hideModal}>
  <div class="modal-content">
    <div class="modal-header">
      <h2>BLAEO+ v{BP_VERSION} Settings</h2>
      <button type="button" aria-label="Close" on:click={hideModal}>
        <i class="fa fa-close" />
      </button>
    </div>
    <div class="modal-body">
      <p>Settings are saved automatically and are applied on refresh.</p>

      <OptionsItem title="Header" titleClass="h3">
        <OptionsToggle id="bp-options-modules-header-shortcuts" bind:boundValue={options.modules.header.shortcuts}>
          Add "New Post" shortcut to avatar dropdown
        </OptionsToggle>
        <OptionsToggle
          id="bp-options-modules-header-mobile-message-badge"
          bind:boundValue={options.modules.header.mobileMessageBadge}
        >
          Show unread messages badge on mobile header
        </OptionsToggle>
      </OptionsItem>

      <OptionsItem title="Games" titleClass="h3">
        <h4>Filters</h4>
        <OptionsToggle
          id="bp-options-modules-games-filters-progress"
          bind:boundValue={options.modules.games.filters.progress}>Add progress filters</OptionsToggle
        >
        <OptionsToggle id="bp-options-modules-games-filters-tags" bind:boundValue={options.modules.games.filters.tags}>
          Add tag filters
        </OptionsToggle>

        <OptionsToggle
          id="bp-options-modules-games-filters-modes"
          bind:boundValue={options.modules.games.filters.modes}
          bind:disabled={options.modules.games.hltbIntegration.enabled}
        >
          Add mode filters
          <div slot="description">Requires HLTB integration</div>
        </OptionsToggle>

        <h4>How Long to Beat Integration</h4>
        <OptionsToggle
          id="bp-options-modules-games-hltb-integration-enabled"
          bind:boundValue={options.modules.games.hltbIntegration.enabled}
        >
          Enable integration
        </OptionsToggle>
        <OptionsToggle
          id="bp-options-modules-games-hltb-integration-displaycolumns-main"
          bind:boundValue={options.modules.games.hltbIntegration.displayColumns.main}
        >
          Show "Main" time to beat column
        </OptionsToggle>
        <OptionsToggle
          id="bp-options-modules-games-hltb-integration-displaycolumns-extra"
          bind:boundValue={options.modules.games.hltbIntegration.displayColumns["+extra"]}
        >
          Show "Main + Extra" time to beat column
        </OptionsToggle>

        <OptionsToggle
          id="bp-options-modules-games-hltb-integration-displaycolumns-100"
          bind:boundValue={options.modules.games.hltbIntegration.displayColumns["100%"]}
        >
          Show "100%" time to beat column
        </OptionsToggle>

        <OptionsToggle
          id="bp-options-modules-games-hltb-integration-add-hltb-links"
          bind:boundValue={options.modules.games.hltbIntegration.addHltbLinks}
        >
          Add links to HLTB pages
        </OptionsToggle>
        <!-- <button class="toggle-item-sub" on:click={enqueueEntireLibrary}>Submit your library for enqueueing</button>
        <div class="toggle-item-sub">
          You can use this button to send your entire BLAEO library to the BLAEO+ backend for fetching times.
        </div> -->
      </OptionsItem>

      <!-- <OptionsItem title="Posts" titleClass="h3">
        <OptionsToggle id="bp-options-modules-posts-saving" bind:boundValue={options.modules.newPosts.saving}>
          Add saving/loading posts
        </OptionsToggle>
      </OptionsItem> -->
      <OptionsItem title="Comments" titleClass="h3">
        <OptionsToggle id="bp-options-modules-comments-previews" bind:boundValue={options.modules.comments.previews}>
          Add preview button
        </OptionsToggle>
      </OptionsItem>
    </div>
    <div class="modal-footer" />
  </div>
</div>

<style lang="scss">
  .bp-options-screen {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: #00000080;
    z-index: 2000;
    padding: 16px;
    visibility: hidden;

    @media (min-width: 768px) {
      padding: 64px;
    }

    &.visible {
      visibility: visible;
    }

    .modal-content {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      display: flex;

      > button {
        margin-left: auto;
        align-self: flex-start;
      }
    }

    .modal-body {
      flex: 1 0 0px;
      overflow: auto;
    }

    .toggle-item-sub {
      margin-left: 8px;
    }
  }

  .modal-header > h2 {
    margin: 0;
  }
</style>
