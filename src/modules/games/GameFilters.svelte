<script lang="ts">
  import { untrack } from "svelte";
  import ColorMultiSelect from "@/lib/ColorMultiSelect.svelte";
  import { PROGRESS_LABELS, type DeviceFilter, type Filters, type FilterOption, type GameStats, type Progress } from "./filterTypes";

  interface Props {
    progresses: readonly Progress[];
    availableTags: Map<string, TagOption>;
    availableSteamTags: Map<string, TagOption>;
    gameStats: GameStats;
    modes: FilterOption[];
    protonDbRatings: FilterOption[];
    deviceFilters: DeviceFilter[];
    showProgressFilter?: boolean;
    showTagsFilter?: boolean;
    showModesFilter?: boolean;
    showProtonDbFilter?: boolean;
    showSteamTagsFilter?: boolean;
    onfilterschanged: (filters: Filters, shownProgresses: Record<Progress, boolean>) => void;
  }

  let {
    progresses,
    availableTags,
    availableSteamTags,
    gameStats,
    modes,
    protonDbRatings,
    deviceFilters,
    showProgressFilter = true,
    showTagsFilter = true,
    showModesFilter = true,
    showProtonDbFilter = true,
    showSteamTagsFilter = true,
    onfilterschanged,
  }: Props = $props();

  function toSortedOptions(tags: Map<string, TagOption>, pseudoValues: string[]): FilterOption[] {
    const options = Array.from(tags, ([value, tag]) => ({ label: tag.label, color: tag.color, value }));
    const isPseudo = (option: FilterOption) => pseudoValues.includes(option.value);

    return options.sort((a, b) => +isPseudo(b) - +isPseudo(a) || (a.label < b.label ? -1 : a.label > b.label ? 1 : 0));
  }

  const tagOptions = $derived(toSortedOptions(availableTags, ["and-tags", "not-tags"]));
  const steamTagOptions = $derived(toSortedOptions(availableSteamTags, ["and-steam-tags", "not-steam-tags"]));
  const bySortValue = (a: FilterOption, b: FilterOption) => (a.sortValue ?? 0) - (b.sortValue ?? 0);

  let selected: Filters = $state({ tags: [], steamTags: [], modes: [], protonDbRatings: [], deviceStatuses: { deck: [], steamos: [], steammachine: [], steamframe: [] } });
  let shownProgresses = $state(untrack(() => Object.fromEntries(progresses.map((progress) => [progress, true]))) as Record<Progress, boolean>);

  $effect(() => {
    onfilterschanged($state.snapshot(selected) as Filters, $state.snapshot(shownProgresses));
  });
</script>

<div class="bp-filters-container">
  <h4>Filters</h4>
  {#if showProgressFilter}
    <div class="list-progress">
      {#each progresses as progress}
        <button
          class="progress-bar game-{progress}"
          class:disabled={!shownProgresses[progress]}
          class:hidden={gameStats[progress] == 0}
          title="{PROGRESS_LABELS[progress]}: {gameStats[progress]} of {gameStats.total} games (click to show/hide)"
          style:width={`${gameStats[`${progress}-percent`]}%`}
          onclick={() => (shownProgresses[progress] = !shownProgresses[progress])}
        >
          {gameStats[`${progress}-percent`]}% {PROGRESS_LABELS[progress]}
        </button>
      {/each}
    </div>
  {/if}
  <div class="bp-filters-row">
    {#if showTagsFilter}
      <div class="bp-filters-wrapper bp-filters-tags">
        <ColorMultiSelect bind:selected={selected.tags} options={tagOptions} outerDivClass="bp-tag-select" placeholder={"Tags"} />
      </div>
    {/if}
    {#if showSteamTagsFilter}
      <div class="bp-filters-wrapper bp-filters-steam-tags">
        <ColorMultiSelect bind:selected={selected.steamTags} options={steamTagOptions} outerDivClass="bp-steam-tag-select" placeholder={"Steam tags"} />
      </div>
    {/if}
  </div>
  <div class="bp-filters-row">
    {#if showModesFilter}
      <div class="bp-filters-wrapper bp-filters-modes">
        <ColorMultiSelect bind:selected={selected.modes} options={modes} outerDivClass="bp-tag-select" placeholder={"Modes"} sortSelected={bySortValue} />
      </div>
    {/if}
    {#if showProtonDbFilter}
      <div class="bp-filters-wrapper bp-filters-protondb">
        <ColorMultiSelect bind:selected={selected.protonDbRatings} options={protonDbRatings} outerDivClass="bp-protondbstatuses-select" placeholder={"ProtonDB ratings"} sortSelected={bySortValue} />
      </div>
    {/if}
    {#each deviceFilters as { id, placeholder, options } (id)}
      <div class="bp-filters-wrapper bp-filters-device">
        <ColorMultiSelect bind:selected={selected.deviceStatuses[id]} {options} outerDivClass="bp-protondbstatuses-select" {placeholder} sortSelected={bySortValue} />
      </div>
    {/each}
  </div>
</div>

<style lang="scss" global>
  .bp-filters-container {
    display: flex;
    flex-wrap: wrap;
    column-gap: 8px;

    button {
      appearance: none;
      border: none;
      padding-right: 0;
    }

    .bp-filters-row {
      display: flex;
      flex-wrap: wrap;
      column-gap: 8px;
      width: 100%;
    }

    .bp-filters-wrapper {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 10px;

      div.multiselect {
        margin-bottom: 8px !important;
        flex-grow: 1;

        &.bp-progress-select {
          width: 100%;

          @media (min-width: 600px) {
            width: 270px;
            margin-right: 8px;
            flex-shrink: 0;
          }
        }
      }
    }
  }

  #games {
    &.hide-wont-play {
      .game-wont-play {
        display: none;
      }
    }

    &.hide-never-played {
      .game-never-played {
        display: none;
      }
    }

    &.hide-unfinished {
      .game-unfinished {
        display: none;
      }
    }

    &.hide-beaten {
      .game-beaten {
        display: none;
      }
    }

    &.hide-completed {
      .game-completed {
        display: none;
      }
    }
    &.hide-uncategorized {
      .game-uncategorized {
        display: none;
      }
    }
  }

  div.list-progress {
    display: flex;
    width: 100%;

    .game-uncategorized {
      background-color: #ddd;

      &.disabled {
        background-color: #eee;
      }
    }

    &:hover {
      .game-uncategorized {
        color: #555;
      }
    }
  }

  .bp-filters-tags,
  .bp-filters-steam-tags {
    width: 100%;
    @media (min-width: 1024px) {
      width: 40%;
      flex-grow: 1;
    }
  }

  .bp-filters-modes,
  .bp-filters-protondb,
  .bp-filters-device {
    width: 100%;
    @media (min-width: 768px) {
      width: 40%;
      flex-grow: 1;
    }

    @media (min-width: 1024px) {
      width: 30%;
    }
  }
</style>
