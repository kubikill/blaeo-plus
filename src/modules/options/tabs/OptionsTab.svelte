<script lang="ts">
  import { userData } from "@/globals";
  import OptionsItem from "../OptionsItem.svelte";
  import OptionsToggle from "../OptionsToggle.svelte";

  import { options } from "@/lib/store.svelte";
  import { PROGRESSES, PROGRESS_LABELS } from "@/modules/games/filterTypes";
</script>

<div>
  <p>Settings are saved automatically and are applied on refresh.</p>

  <OptionsItem title="Header" titleClass="h3">
    <OptionsToggle id="bp-options-modules-header-shortcuts" bind:boundValue={options.modules.header.shortcuts}>Add "New Post" shortcut to avatar dropdown</OptionsToggle>
    <OptionsToggle id="bp-options-modules-header-uncategorized-games-shortcut" bind:boundValue={options.modules.header.uncategorizedGamesShortcut}>Add a uncategorized games link to the "My games" dropdown</OptionsToggle>
    <OptionsToggle id="bp-options-modules-header-missing-games-shortcut" bind:boundValue={options.modules.header.missingGamesShortcut}>Add a missing games link to the "My games" dropdown</OptionsToggle>
    <OptionsToggle id="bp-options-modules-header-mobile-message-badge" bind:boundValue={options.modules.header.mobileMessageBadge}>Show unread messages link on mobile header without having to expand it</OptionsToggle>
  </OptionsItem>

  <OptionsItem title="Games" titleClass="h3">
    <h4>Integrations</h4>

    <OptionsToggle id="bp-options-modules-games-hltb-integration-enabled" bind:boundValue={options.modules.games.hltbIntegration.enabled} hasSuboptions>
      Enable How Long to Beat integration
      {#snippet description()}
        <div>
          <p>Display how long it takes to beat games on any games page on BLAEO. Currently works only when using table or list view.</p>
          <OptionsToggle id="bp-options-modules-games-hltb-integration-displaycolumns-main" bind:boundValue={options.modules.games.hltbIntegration.displayColumns.main}>Show "Main" time to beat column</OptionsToggle>
          <OptionsToggle id="bp-options-modules-games-hltb-integration-displaycolumns-extra" bind:boundValue={options.modules.games.hltbIntegration.displayColumns["+extra"]}>Show "Main + Extra" time to beat column</OptionsToggle>

          <OptionsToggle id="bp-options-modules-games-hltb-integration-displaycolumns-100" bind:boundValue={options.modules.games.hltbIntegration.displayColumns["100%"]}>Show "100%" time to beat column</OptionsToggle>

          <OptionsToggle id="bp-options-modules-games-hltb-integration-add-hltb-links" bind:boundValue={options.modules.games.hltbIntegration.addHltbLinks}>Add links to HLTB pages</OptionsToggle>
          <OptionsToggle id="bp-options-modules-games-hltb-integration-report-buttons" bind:boundValue={options.modules.games.hltbIntegration.reportButtons}>Show buttons to report wrong HLTB links and non-games</OptionsToggle>
          <OptionsToggle id="bp-options-modules-games-hltb-integration-one-column-mode" bind:boundValue={options.modules.games.hltbIntegration.oneColumnMode}>Show times in one column in table view</OptionsToggle>
        </div>
      {/snippet}
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-protondb-integration-enabled" bind:boundValue={options.modules.games.protonDbIntegration.enabled}>
      Enable ProtonDB integration
      {#snippet description()}
        <div>
          <p>Display ProtonDB ratings for games on any games page on BLAEO, linking to their ProtonDB pages. Currently works only when using table or list view.</p>
        </div>
      {/snippet}
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-deckverified-integration-enabled" bind:boundValue={options.modules.games.deckVerifiedIntegration.enabled}>
      Enable Steam Deck Verified integration
      {#snippet description()}
        <div>
          <p>Display Steam Deck Verified ratings for games on any games page on BLAEO. Currently works only when using table or list view.</p>
        </div>
      {/snippet}
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-steamos-integration-enabled" bind:boundValue={options.modules.games.steamOsIntegration.enabled}>
      Enable SteamOS compatibility integration
      {#snippet description()}
        <div>
          <p>Display SteamOS compatibility ratings for games on any games page on BLAEO. Currently works only when using table or list view.</p>
        </div>
      {/snippet}
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-steammachine-integration-enabled" bind:boundValue={options.modules.games.steamMachineIntegration.enabled}>
      Enable Steam Machine compatibility integration
      {#snippet description()}
        <div>
          <p>Display Steam Machine compatibility ratings for games on any games page on BLAEO. Currently works only when using table or list view.</p>
        </div>
      {/snippet}
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-steamframe-integration-enabled" bind:boundValue={options.modules.games.steamFrameIntegration.enabled}>
      Enable Steam Frame compatibility integration
      {#snippet description()}
        <div>
          <p>Display Steam Frame compatibility ratings for games on any games page on BLAEO. Currently works only when using table or list view.</p>
        </div>
      {/snippet}
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-steamstore-integration-enabled" bind:boundValue={options.modules.games.steamStoreIntegration.enabled} hasSuboptions>
      Enable Steam store integration
      {#snippet description()}
        <div>
          <p>Display Steam tags for games on any games page on BLAEO. Currently works only when using table or list view.</p>
          <p>Hide Steam tags for games marked as the following (they can still be filtered by Steam tags):</p>
          {#each PROGRESSES as progress}
            <OptionsToggle id="bp-options-modules-games-steamstore-integration-hide-tags-{progress}" bind:boundValue={options.modules.games.steamStoreIntegration.hideTagsForProgress[progress]}>{PROGRESS_LABELS[progress]}</OptionsToggle>
          {/each}
        </div>
      {/snippet}
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-steamhunters-integration-enabled" bind:boundValue={options.modules.games.steamHuntersIntegration.enabled} hasSuboptions>
      Enable SteamHunters integration
      {#snippet description()}
        <div>
          <p>Display the median time to complete (100% achievements) each game, on any games page on BLAEO. Currently works only when using table or list view. Also allows listing games by median time to complete in the HLTB list maker.</p>
          <OptionsToggle id="bp-options-modules-games-steamhunters-integration-add-links" bind:boundValue={options.modules.games.steamHuntersIntegration.addSteamHuntersLinks}>Add links to SteamHunters pages</OptionsToggle>
        </div>
      {/snippet}
    </OptionsToggle>

    <h4>Filters</h4>

    <OptionsToggle id="bp-options-modules-games-filters-progress" bind:boundValue={options.modules.games.filters.progress}>Add progress filters</OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-filters-tags" bind:boundValue={options.modules.games.filters.tags}>
      Add tag filters
      {#snippet description()}
        <div>
          <p>
            Adds filtering games by tags added on BLAEO. Currently works only when using table or list view.<br />
          </p>
        </div>
      {/snippet}
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-filters-modes" bind:boundValue={options.modules.games.filters.modes} enabled={options.modules.games.hltbIntegration.enabled}>
      Add mode filters
      {#snippet description()}
        <div>
          <p>
            Adds filtering games by singleplayer, multiplayer or coop.<br />
            Requires How Long to Beat integration.
          </p>
        </div>
      {/snippet}
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-filters-protondb-ratings" bind:boundValue={options.modules.games.filters.protonDbRatings} enabled={options.modules.games.protonDbIntegration.enabled}>
      Add ProtonDB rating filters
      {#snippet description()}
        <div>
          <p>
            Adds filtering games by ProtonDB ratings.<br />
            Requires ProtonDB integration.
          </p>
        </div>
      {/snippet}
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-filters-deckverified-statuses" bind:boundValue={options.modules.games.filters.deckVerifiedStatuses} enabled={options.modules.games.deckVerifiedIntegration.enabled}>
      Add Deck Verified status filters
      {#snippet description()}
        <div>
          <p>
            Adds filtering games by Steam Deck Verified statuses.<br />
            Requires Steam Deck Verified integration.
          </p>
        </div>
      {/snippet}
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-filters-steamos-statuses" bind:boundValue={options.modules.games.filters.steamOsStatuses} enabled={options.modules.games.steamOsIntegration.enabled}>
      Add SteamOS status filters
      {#snippet description()}
        <div>
          <p>
            Adds filtering games by SteamOS compatibility statuses.<br />
            Requires SteamOS compatibility integration.
          </p>
        </div>
      {/snippet}
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-filters-steammachine-statuses" bind:boundValue={options.modules.games.filters.steamMachineStatuses} enabled={options.modules.games.steamMachineIntegration.enabled}>
      Add Steam Machine status filters
      {#snippet description()}
        <div>
          <p>
            Adds filtering games by Steam Machine compatibility statuses.<br />
            Requires Steam Machine compatibility integration.
          </p>
        </div>
      {/snippet}
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-filters-steamframe-statuses" bind:boundValue={options.modules.games.filters.steamFrameStatuses} enabled={options.modules.games.steamFrameIntegration.enabled}>
      Add Steam Frame status filters
      {#snippet description()}
        <div>
          <p>
            Adds filtering games by Steam Frame compatibility statuses.<br />
            Requires Steam Frame compatibility integration.
          </p>
        </div>
      {/snippet}
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-filters-steam-tags" bind:boundValue={options.modules.games.filters.steamTags} enabled={options.modules.games.steamStoreIntegration.enabled}>
      Add Steam tags filters
      {#snippet description()}
        <div>
          <p>
            Adds filtering games by Steam tags.<br />
            Requires Steam store integration.
          </p>
        </div>
      {/snippet}
    </OptionsToggle>

    <h4>Lists</h4>

    <OptionsToggle id="bp-options-modules-games-lists-quick-rearrange" bind:boundValue={options.modules.games.lists.quickRearrange}>
      Add quick rearrange button
      {#snippet description()}
        <div>
          <p>
            Adds a button to quickly rearrange games by name, playtime, HLTB time to beat or SteamHunters median time to complete.<br />
            HLTB or SteamHunters integration must be enabled in order to sort by their times.
          </p>
          <p>To use quick rearrange, go to the chosen list's rearrange page then click the "Quick rearrange" button at the top of the page.</p>
        </div>
      {/snippet}
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-lists-rearrange-buttons" bind:boundValue={options.modules.games.lists.rearrangeButtons}>
      Add quick add and remove buttons when rearranging a list
      {#snippet description()}
        <div>
          <p>Adds a "×" button to each game on the list's rearrange page that removes it from the list, and a "+" button to each game in the add section that moves it to the end of the list.</p>
        </div>
      {/snippet}
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-lists-automatic-hltb" bind:boundValue={options.modules.games.lists.automaticHltb} enabled={options.modules.games.hltbIntegration.enabled}>
      Add "add games by HLTB times" button
      {#snippet description()}
        <div>
          <p>
            Adds a button to automatically add games to multiple lists by HLTB time to beat.<br />
            Also allows MP-only and endless games to be ignored/added to separate lists.<br />
            Requires HLTB integration to be enabled.
          </p>
          <p>To use this feature, go to your <a href="/settings/lists">"Manage lists"</a> settings page.</p>
        </div>
      {/snippet}
    </OptionsToggle>

    <h4>Other</h4>

    <OptionsToggle id="bp-options-modules-games-other-bulk-remove-missing-games" bind:boundValue={options.modules.games.other.bulkRemoveMissingGames}>
      Add "bulk remove missing games" button
      {#snippet description()}
        <div>
          <p>
            Adds a button to remove games classified on BLAEO as missing in bulk.<br />
          </p>
          <p>To use this feature, go to your <a href="/users/{userData.name}/games/missing">missing games</a> on BLAEO.</p>
        </div>
      {/snippet}
    </OptionsToggle>

    <OptionsToggle id="bp-options-modules-games-other-full-width-table" bind:boundValue={options.modules.games.other.fullWidthTable}>
      Add full width game table view
      {#snippet description()}
        <div>
          <p>
            Changes the games list table views to use full screen width.<br />
          </p>
        </div>
      {/snippet}
    </OptionsToggle>
  </OptionsItem>

  <OptionsItem title="Posts" titleClass="h3">
    <OptionsToggle id="bp-options-modules-posts-mobile-layout" bind:boundValue={options.modules.posts.mobileLayout}>Enable alternative post layout on mobile for more horizontal space</OptionsToggle>
  </OptionsItem>

  <OptionsItem title="New post" titleClass="h3">
    <OptionsToggle id="bp-options-modules-newposts-saving" bind:boundValue={options.modules.newPosts.saving}>
      Add saving/loading post drafts
      {#snippet description()}
        <div>
          <p>
            Adds a save/load feature for post drafts. Post drafts will also be saved automatically on preview or when leaving the page.<br />
          </p>
        </div>
      {/snippet}
    </OptionsToggle>
  </OptionsItem>

  <OptionsItem title="Comments" titleClass="h3">
    <OptionsToggle id="bp-options-modules-comments-previews" bind:boundValue={options.modules.comments.previews}>Add preview comment button</OptionsToggle>
    <OptionsToggle id="bp-options-modules-comments-mobile-layout" bind:boundValue={options.modules.comments.mobileLayout}>Enable alternative comment layout on mobile for more horizontal space</OptionsToggle>
  </OptionsItem>

  <OptionsItem title="Users" titleClass="h3">
    <OptionsToggle id="bp-options-modules-users-blacklist-enabled" bind:boundValue={options.modules.users.blacklist.enabled} hasSuboptions>
      Enable blacklists
      {#snippet description()}
        <div>
          <p>
            Allows users to be blacklisted, which will hide or collapse their posts and/or comments.<br />
            Note that the inbox will still notify you if a blocked user replies to you and if comments are set to be hidden, they'll be collapsed instead.
          </p>
          <p>Users can be blocked by visiting their profile and clicking the blacklist button next to the subscribe button under the profile description.</p>
          <div>
            <select id="bp-options-modules-users-blacklist-post-behavior" bind:value={options.modules.users.blacklist.postBehavior}>
              <option value="hide">Hide</option>
              <option value="collapse">Collapse</option>
              <option value="collapse-with-uncollapse">Collapse w/ uncollapse</option>
              <option value="none">None</option>
            </select>
            <label for="bp-options-modules-users-blacklist-post-behavior">Behavior of posts from blacklisted users</label>
          </div>
          <div>
            <select id="bp-options-modules-users-blacklist-comment-behavior" bind:value={options.modules.users.blacklist.commentBehavior}>
              <option value="hide">Hide</option>
              <option value="collapse">Collapse</option>
              <option value="collapse-with-uncollapse">Collapse w/ uncollapse</option>
              <option value="none">None</option>
            </select>
            <label for="bp-options-modules-users-blacklist-comment-behavior">Behavior of comments from blacklisted users</label>
          </div>
        </div>
      {/snippet}
    </OptionsToggle>
  </OptionsItem>

  <OptionsItem title="Misc" titleClass="h3">
    <OptionsToggle id="bp-options-modules-misc-update-notifier" bind:boundValue={options.modules.misc.updateNotifier}>Show changelog when new update is installed</OptionsToggle>
  </OptionsItem>
</div>

<style lang="scss">
  label {
    font-weight: 400;
  }
</style>
