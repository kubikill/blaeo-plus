<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import MultiSelect from "svelte-multiselect";

  export let filters = {
    progresses: [],
    modes: [],
    availableTags: [],
    tags: [],
  };
  export let gameStats: {
    "wont-play": number;
    "wont-play-percent": string;
    "never-played": number;
    "never-played-percent": string;
    unfinished: number;
    "unfinished-percent": string;
    beaten: number;
    "beaten-percent": string;
    completed: number;
    "completed-percent": string;
    uncategorized: number;
    "uncategorized-percent": string;
    total: number;
  };

  export let progresses;
  export let modes;
  export let showProgressFilter = true;
  export let showTagsFilter = true;
  export let showModesFilter = true;

  const dispatch = createEventDispatcher();

  function changeTag() {
    filters.tags = selectedTags;
    dispatch("filters-changed");
  }

  const availableTags = Array.from(filters.availableTags, (tag) => {
    return {
      label: tag[1].label,
      color: tag[1].color,
      value: tag[0],
    };
  });

  availableTags.sort((a, b) => {
    if (a.value === "not-tags" || a.value === "and-tags") {
      return -1;
    }
    if (a.label < b.label) {
      return -1;
    }
    if (a.label > b.label) {
      return 1;
    }
    return 0;
  });

  let selectedTags = [];
  let selectedModes = [];

  function changeMode() {
    filters.modes = selectedModes;
    dispatch("filters-changed");
  }

  function toggleProgress(progress) {
    progresses[progress] = !progresses[progress];
    dispatch("filters-changed");
  }
</script>

<div class="bp-filters-container">
  <h4>Filters</h4>
  {#if showProgressFilter}
    <div class="list-progress">
      <button
        class="progress-bar game-wont-play"
        class:disabled={!progresses["wont-play"]}
        class:hidden={gameStats["wont-play"] == 0}
        title="won't play: {gameStats['wont-play']} of {gameStats.total} games (click to show/hide)"
        style:width={`${gameStats["wont-play-percent"]}%`}
        on:click={() => toggleProgress("wont-play")}
      >
        {gameStats["wont-play-percent"]}% won't play
      </button>
      <button
        class="progress-bar game-never-played"
        class:disabled={!progresses["never-played"]}
        class:hidden={gameStats["never-played"] == 0}
        title="never played: {gameStats['never-played']} of {gameStats.total} games (click to show/hide)"
        style:width={`${gameStats["never-played-percent"]}%`}
        on:click={() => toggleProgress("never-played")}
      >
        {gameStats["never-played-percent"]}% never played
      </button>
      <button
        class="progress-bar game-unfinished"
        class:disabled={!progresses["unfinished"]}
        class:hidden={gameStats["unfinished"] == 0}
        title="unfinished: {gameStats.unfinished} of {gameStats.total} games (click to show/hide)"
        style:width={`${gameStats["unfinished-percent"]}%`}
        on:click={() => toggleProgress("unfinished")}
      >
        {gameStats["unfinished-percent"]}% unfinished
      </button>
      <button
        class="progress-bar game-beaten"
        class:disabled={!progresses["beaten"]}
        class:hidden={gameStats["beaten"] == 0}
        title="beaten: {gameStats.beaten} of {gameStats.total} games (click to show/hide)"
        style:width={`${gameStats["beaten-percent"]}%`}
        on:click={() => toggleProgress("beaten")}
      >
        {gameStats["beaten-percent"]}% beaten
      </button>
      <button
        class="progress-bar game-completed"
        class:disabled={!progresses["completed"]}
        class:hidden={gameStats["completed"] == 0}
        title="completed: {gameStats.completed} of {gameStats.total} games (click to show/hide)"
        style:width={`${gameStats["completed-percent"]}%`}
        on:click={() => toggleProgress("completed")}
      >
        {gameStats["completed-percent"]}% completed
      </button>
      <button
        class="progress-bar game-uncategorized"
        class:disabled={!progresses["uncategorized"]}
        class:hidden={gameStats["uncategorized"] == 0}
        title="uncategorized: {gameStats.uncategorized} of {gameStats.total} games (click to show/hide)"
        style:width={`${gameStats["uncategorized-percent"]}%`}
        on:click={() => toggleProgress("uncategorized")}
      >
        {gameStats["uncategorized-percent"]}% uncategorized
      </button>
    </div>
  {/if}
  {#if showTagsFilter}
    <div class="bp-filters-wrapper">
      <MultiSelect
        bind:selected={selectedTags}
        on:change={changeTag}
        options={availableTags}
        outerDivClass="bp-tag-select"
        placeholder={"Tags"}
        selectedOptionsDraggable={false}
      >
        <div let:option slot="option" class="" style:border-left={`7px solid ${option.color}`}>
          {option.label}
        </div>
      </MultiSelect>
    </div>
  {/if}
  {#if showModesFilter}
    <div class="bp-filters-wrapper">
      <MultiSelect
        bind:selected={selectedModes}
        on:change={changeMode}
        options={modes}
        outerDivClass="bp-tag-select"
        placeholder={"Modes"}
        sortSelected={(a, b) => a.sortValue - b.sortValue}
        selectedOptionsDraggable={false}
      >
        <div let:option slot="option" class="" style:border-left={`7px solid ${option.color}`}>
          {option.label}
        </div>
      </MultiSelect>
    </div>
  {/if}
</div>

<style lang="scss" global>
  .bp-filters-container {
    button {
      appearance: none;
      border: none;
      padding-right: 0;
    }
    .bp-filters-wrapper {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 10px;

      div.multiselect {
        margin-bottom: 8px !important;
        &.bp-progress-select {
          width: 100%;

          @media (min-width: 600px) {
            width: 270px;
            margin-right: 8px;
            flex-shrink: 0;
          }
        }

        &.bp-tag-select {
          flex-grow: 1;
        }

        > ul.options > li {
          padding: 0 !important;

          > div {
            padding: 6px 8px;
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
</style>
