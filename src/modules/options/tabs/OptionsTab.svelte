<script lang="ts">
  import { userData } from "@/globals";
  import OptionsItem from "../OptionsItem.svelte";
  import OptionsToggle from "../OptionsToggle.svelte";

  import { optionsStore } from "@/lib/store";
</script>

<div>
  <p>Settings are saved automatically and are applied on refresh.</p>

  <OptionsItem title="Header" titleClass="h3">
    <OptionsToggle id="bp-options-modules-header-shortcuts" bind:boundValue={$optionsStore.modules.header.shortcuts}>Add "New Post" shortcut to avatar dropdown</OptionsToggle>
    <OptionsToggle id="bp-options-modules-header-uncategorized-games-shortcut" bind:boundValue={$optionsStore.modules.header.uncategorizedGamesShortcut}>Add a uncategorized games link to the "My games" dropdown</OptionsToggle>
    <OptionsToggle id="bp-options-modules-header-missing-games-shortcut" bind:boundValue={$optionsStore.modules.header.missingGamesShortcut}>Add a missing games link to the "My games" dropdown</OptionsToggle>
    <OptionsToggle id="bp-options-modules-header-mobile-message-badge" bind:boundValue={$optionsStore.modules.header.mobileMessageBadge}>Show unread messages link on mobile header without having to expand it</OptionsToggle>
  </OptionsItem>

  <OptionsItem title="Games" titleClass="h3">
    <h4>Integrations</h4>

    <OptionsToggle id="bp-options-modules-games-hltb-integration-enabled" bind:boundValue={$optionsStore.modules.games.hltbIntegration.enabled}>
      Enable How Long to Beat integration
      <div slot="description">
        <p>Display how long it takes to beat games on any games page on BLAEO. Currently works only when using table or list view.</p>
        <OptionsToggle id="bp-options-modules-games-hltb-integration-displaycolumns-main" bind:boundValue={$optionsStore.modules.games.hltbIntegration.displayColumns.main}>Show "Main" time to beat column</OptionsToggle>
        <OptionsToggle id="bp-options-modules-games-hltb-integration-displaycolumns-extra" bind:boundValue={$optionsStore.modules.games.hltbIntegration.displayColumns["+extra"]}>Show "Main + Extra" time to beat column</OptionsToggle>

        <OptionsToggle id="bp-options-modules-games-hltb-integration-displaycolumns-100" bind:boundValue={$optionsStore.modules.games.hltbIntegration.displayColumns["100%"]}>Show "100%" time to beat column</OptionsToggle>

        <OptionsToggle id="bp-options-modules-games-hltb-integration-add-hltb-links" bind:boundValue={$optionsStore.modules.games.hltbIntegration.addHltbLinks}>Add links to HLTB pages</OptionsToggle>
        <OptionsToggle id="bp-options-modules-games-hltb-integration-one-column-mode" bind:boundValue={$optionsStore.modules.games.hltbIntegration.oneColumnMode}>Show times in one column in table view</OptionsToggle>
      </div>
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-protondb-integration-enabled" bind:boundValue={$optionsStore.modules.games.protonDbIntegration.enabled}>
      Enable ProtonDB integration
      <div slot="description">
        <p>Display ProtonDB ratings for games on any games page on BLAEO. Currently works only when using table or list view.</p>
        <OptionsToggle id="bp-options-modules-games-protondb-integration-add-protondb-links" bind:boundValue={$optionsStore.modules.games.protonDbIntegration.addProtonDbLinks}>Add links to ProtonDB pages</OptionsToggle>
      </div>
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-deckverified-integration-enabled" bind:boundValue={$optionsStore.modules.games.deckVerifiedIntegration.enabled}>
      Enable Steam Deck Verified integration
      <div slot="description">
        <p>Display Steam Deck Verified ratings for games on any games page on BLAEO. Currently works only when using table or list view.</p>
      </div>
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-steamstore-integration-enabled" bind:boundValue={$optionsStore.modules.games.steamStoreIntegration.enabled}>
      Enable Steam store integration
      <div slot="description">
        <p>Display Steam tags for games on any games page on BLAEO. Currently works only when using table or list view.</p>
      </div>
    </OptionsToggle>

    <h4>Filters</h4>

    <OptionsToggle id="bp-options-modules-games-filters-progress" bind:boundValue={$optionsStore.modules.games.filters.progress}>Add progress filters</OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-filters-tags" bind:boundValue={$optionsStore.modules.games.filters.tags}>
      Add tag filters
      <div slot="description">
        <p>
          Adds filtering games by tags added on BLAEO. Currently works only when using table or list view.<br />
        </p>
      </div>
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-filters-modes" bind:boundValue={$optionsStore.modules.games.filters.modes} bind:disabled={$optionsStore.modules.games.hltbIntegration.enabled}>
      Add mode filters
      <div slot="description">
        <p>
          Adds filtering games by singleplayer, multiplayer or coop.<br />
          Requires How Long to Beat integration.
        </p>
      </div>
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-filters-protondb-ratings" bind:boundValue={$optionsStore.modules.games.filters.protonDbRatings} bind:disabled={$optionsStore.modules.games.protonDbIntegration.enabled}>
      Add ProtonDB rating filters
      <div slot="description">
        <p>
          Adds filtering games by ProtonDB ratings.<br />
          Requires ProtonDB integration.
        </p>
      </div>
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-filters-deckverified-statuses" bind:boundValue={$optionsStore.modules.games.filters.deckVerifiedStatuses} bind:disabled={$optionsStore.modules.games.deckVerifiedIntegration.enabled}>
      Add Deck Verified status filters
      <div slot="description">
        <p>
          Adds filtering games by Steam Deck Verified statuses.<br />
          Requires Steam Deck Verified integration.
        </p>
      </div>
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-filters-steam-tags" bind:boundValue={$optionsStore.modules.games.filters.steamTags} bind:disabled={$optionsStore.modules.games.steamStoreIntegration.enabled}>
      Add Steam tags filters
      <div slot="description">
        <p>
          Adds filtering games by Steam tags.<br />
          Requires Steam store integration.
        </p>
      </div>
    </OptionsToggle>

    <h4>Lists</h4>

    <OptionsToggle id="bp-options-modules-games-lists-quick-rearrange" bind:boundValue={$optionsStore.modules.games.lists.quickRearrange}>
      Add quick rearrange button
      <div slot="description">
        <p>
          Adds a button to quickly rearrange games by name, playtime or HLTB time to beat.<br />
          HLTB integration must be enabled in order to sort by HLTB time to beat.
        </p>
        <p>To use quick rearrange, go to the chosen list's rearrange page then click the "Quick rearrange" button at the top of the page.</p>
      </div>
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-lists-automatic-hltb" bind:boundValue={$optionsStore.modules.games.lists.automaticHltb} bind:disabled={$optionsStore.modules.games.hltbIntegration.enabled}>
      Add "add games by HLTB times" button
      <div slot="description">
        <p>
          Adds a button to automatically add games to multiple lists by HLTB time to beat.<br />
          Also allows MP-only and endless games to be ignored/added to separate lists.<br />
          Requires HLTB integration to be enabled.
        </p>
        <p>To use this feature, go to your <a href="/settings/lists">"Manage lists"</a> settings page.</p>
      </div>
    </OptionsToggle>

    <h4>Other</h4>

    <OptionsToggle id="bp-options-modules-games-other-bulk-remove-missing-games" bind:boundValue={$optionsStore.modules.games.other.bulkRemoveMissingGames}>
      Add "bulk remove missing games" button
      <div slot="description">
        <p>
          Adds a button to remove games classified on BLAEO as missing in bulk.<br />
        </p>
        <p>To use this feature, go to your <a href="/users/{userData.name}/games/missing">missing games</a> on BLAEO.</p>
      </div>
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-other-full-width-table" bind:boundValue={$optionsStore.modules.games.other.fullWidthTable}>
      Add full width game table view
      <div slot="description">
        <p>
          Changes the games list table views to use full screen width.<br />
        </p>
      </div>
    </OptionsToggle>

    <!-- <button class="toggle-item-sub" on:click={enqueueEntireLibrary}>Submit your library for enqueueing</button>
        <div class="toggle-item-sub">
          You can use this button to send your entire BLAEO library to the BLAEO+ backend for fetching times.
        </div> -->
  </OptionsItem>

  <OptionsItem title="Posts" titleClass="h3">
    <OptionsToggle id="bp-options-modules-posts-mobile-layout" bind:boundValue={$optionsStore.modules.posts.mobileLayout}>Enable alternative post layout on mobile for more horizontal space</OptionsToggle>
  </OptionsItem>

  <OptionsItem title="New post" titleClass="h3">
    <OptionsToggle id="bp-options-modules-newposts-saving" bind:boundValue={$optionsStore.modules.newPosts.saving}>
      Add saving/loading post drafts
      <div slot="description">
        <p>
          Adds a save/load feature for post drafts. Post drafts will also be saved automatically on preview or when leaving the page.<br />
        </p>
      </div>
    </OptionsToggle>
  </OptionsItem>

  <OptionsItem title="Comments" titleClass="h3">
    <OptionsToggle id="bp-options-modules-comments-previews" bind:boundValue={$optionsStore.modules.comments.previews}>Add preview comment button</OptionsToggle>
    <OptionsToggle id="bp-options-modules-comments-mobile-layout" bind:boundValue={$optionsStore.modules.comments.mobileLayout}>Enable alternative comment layout on mobile for more horizontal space</OptionsToggle>
  </OptionsItem>

  <OptionsItem title="Users" titleClass="h3">
    <OptionsToggle id="bp-options-modules-users-blacklist-enabled" bind:boundValue={$optionsStore.modules.users.blacklist.enabled}>
      Enable blacklists
      <div slot="description">
        <p>
          Allows users to be blacklisted, which will hide or collapse their posts and/or comments.<br />
          Note that the inbox will still notify you if a blocked user replies to you and if comments are set to be hidden, they'll be collapsed instead.
        </p>
        <p>Users can be blocked by visiting their profile and clicking the blacklist button next to the subscribe button under the profile description.</p>
        <div>
          <select id="bp-options-modules-users-blacklist-post-behavior" bind:value={$optionsStore.modules.users.blacklist.postBehavior}>
            <option value="hide">Hide</option>
            <option value="collapse">Collapse</option>
            <option value="collapse-with-uncollapse">Collapse w/ uncollapse</option>
            <option value="none">None</option>
          </select>
          <label for="bp-options-modules-users-blacklist-post-behavior">Behavior of posts from blacklisted users</label>
        </div>
        <div>
          <select id="bp-options-modules-users-blacklist-comment-behavior" bind:value={$optionsStore.modules.users.blacklist.commentBehavior}>
            <option value="hide">Hide</option>
            <option value="collapse">Collapse</option>
            <option value="collapse-with-uncollapse">Collapse w/ uncollapse</option>
            <option value="none">None</option>
          </select>
          <label for="bp-options-modules-users-blacklist-comment-behavior">Behavior of comments from blacklisted users</label>
        </div>
      </div>
    </OptionsToggle>
  </OptionsItem>

  <OptionsItem title="Misc" titleClass="h3">
    <OptionsToggle id="bp-options-modules-misc-update-notifier" bind:boundValue={$optionsStore.modules.misc.updateNotifier}>Notify me about updates</OptionsToggle>
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

  label {
    font-weight: 400;
  }
</style>
