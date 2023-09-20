<script lang="ts">
  import { GM_setValue } from "vite-plugin-monkey/dist/client";
  import OptionsItem from "../OptionsItem.svelte";
  import OptionsToggle from "../OptionsToggle.svelte";

  export let options: Options;

  $: GM_setValue("bp-options", JSON.stringify(options));
</script>

<div>
  <p>Settings are saved automatically and are applied on refresh.</p>

  <OptionsItem title="Header" titleClass="h3">
    <OptionsToggle id="bp-options-modules-header-shortcuts" bind:boundValue={options.modules.header.shortcuts}>Add "New Post" shortcut to avatar dropdown</OptionsToggle>
    <OptionsToggle id="bp-options-modules-header-mobile-message-badge" bind:boundValue={options.modules.header.mobileMessageBadge}>Show unread messages link on mobile header without having to expand it</OptionsToggle>
  </OptionsItem>

  <OptionsItem title="Games" titleClass="h3">
    <h4>Integrations</h4>

    <OptionsToggle id="bp-options-modules-games-hltb-integration-enabled" bind:boundValue={options.modules.games.hltbIntegration.enabled}>
      Enable How Long to Beat integration
      <div slot="description">
        <p>Display how long it takes to beat games on any games page on BLAEO. Currently works only when using table or list view.</p>
        <OptionsToggle id="bp-options-modules-games-hltb-integration-displaycolumns-main" bind:boundValue={options.modules.games.hltbIntegration.displayColumns.main}>Show "Main" time to beat column</OptionsToggle>
        <OptionsToggle id="bp-options-modules-games-hltb-integration-displaycolumns-extra" bind:boundValue={options.modules.games.hltbIntegration.displayColumns["+extra"]}>Show "Main + Extra" time to beat column</OptionsToggle>

        <OptionsToggle id="bp-options-modules-games-hltb-integration-displaycolumns-100" bind:boundValue={options.modules.games.hltbIntegration.displayColumns["100%"]}>Show "100%" time to beat column</OptionsToggle>

        <OptionsToggle id="bp-options-modules-games-hltb-integration-add-hltb-links" bind:boundValue={options.modules.games.hltbIntegration.addHltbLinks}>Add links to HLTB pages</OptionsToggle>
        <OptionsToggle id="bp-options-modules-games-hltb-integration-one-column-mode" bind:boundValue={options.modules.games.hltbIntegration.oneColumnMode}>Show times in one column in table view</OptionsToggle>
      </div>
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-protondb-integration-enabled" bind:boundValue={options.modules.games.protonDbIntegration.enabled}>
      Enable ProtonDB integration
      <div slot="description">
        <p>Display ProtonDB ratings for games on any games page on BLAEO. Currently works only when using table or list view.</p>
        <OptionsToggle id="bp-options-modules-games-protondb-integration-add-protondb-links" bind:boundValue={options.modules.games.protonDbIntegration.addProtonDbLinks}>Add links to ProtonDB pages</OptionsToggle>
      </div>
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-protondb-integration-enabled" bind:boundValue={options.modules.games.deckVerifiedIntegration.enabled}>
      Enable Steam Deck Verified integration
      <div slot="description">
        <p>Display Steam Deck Verified ratings for games on any games page on BLAEO. Currently works only when using table or list view.</p>
      </div>
    </OptionsToggle>

    <h4>Filters</h4>

    <OptionsToggle id="bp-options-modules-games-filters-progress" bind:boundValue={options.modules.games.filters.progress}>Add progress filters</OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-filters-tags" bind:boundValue={options.modules.games.filters.tags}>
      Add tag filters
      <div slot="description">
        <p>
          Adds filtering games by tags added on BLAEO. Currently works only when using table or list view.<br />
        </p>
      </div>
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-filters-modes" bind:boundValue={options.modules.games.filters.modes} bind:disabled={options.modules.games.hltbIntegration.enabled}>
      Add mode filters
      <div slot="description">
        <p>
          Adds filtering games by singleplayer, multiplayer or coop.<br />
          Requires How Long to Beat integration.
        </p>
      </div>
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-filters-protondb-ratings" bind:boundValue={options.modules.games.filters.protonDbRatings} bind:disabled={options.modules.games.protonDbIntegration.enabled}>
      Add ProtonDB rating filters
      <div slot="description">
        <p>
          Adds filtering games by ProtonDB ratings.<br />
          Requires ProtonDB integration.
        </p>
      </div>
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-filters-deckverified-statuses" bind:boundValue={options.modules.games.filters.deckVerifiedStatuses} bind:disabled={options.modules.games.deckVerifiedIntegration.enabled}>
      Add Deck Verified status filters
      <div slot="description">
        <p>
          Adds filtering games by Steam Deck Verified statuses.<br />
          Requires Steam Deck Verified integration.
        </p>
      </div>
    </OptionsToggle>
    <!-- <button class="toggle-item-sub" on:click={enqueueEntireLibrary}>Submit your library for enqueueing</button>
        <div class="toggle-item-sub">
          You can use this button to send your entire BLAEO library to the BLAEO+ backend for fetching times.
        </div> -->
  </OptionsItem>

  <OptionsItem title="Posts" titleClass="h3">
    <OptionsToggle id="bp-options-modules-posts-mobile-layout" bind:boundValue={options.modules.posts.mobileLayout}>Enable alternative post layout on mobile for more horizontal space</OptionsToggle>
  </OptionsItem>

  <OptionsItem title="New post" titleClass="h3">
    <OptionsToggle id="bp-options-modules-newposts-saving" bind:boundValue={options.modules.newPosts.saving}>
      Add saving/loading post drafts
      <div slot="description">
        <p>
          Adds a save/load feature for post drafts. Post drafts will also be saved automatically on preview or when leaving the page.<br />
        </p>
      </div>
    </OptionsToggle>
  </OptionsItem>

  <OptionsItem title="Comments" titleClass="h3">
    <OptionsToggle id="bp-options-modules-comments-previews" bind:boundValue={options.modules.comments.previews}>Add preview comment button</OptionsToggle>
    <OptionsToggle id="bp-options-modules-comments-mobile-layout" bind:boundValue={options.modules.comments.mobileLayout}>Enable alternative comment layout on mobile for more horizontal space</OptionsToggle>
  </OptionsItem>
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
    }

    .toggle-item-sub {
      margin-left: 8px;
    }
  }
</style>
