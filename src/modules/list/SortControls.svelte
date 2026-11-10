<script lang="ts">
  import { options } from "@/lib/store.svelte";
  import Toggle from "svelte-switcher";

  interface Props {
    idPrefix: string;
    sortBy: string;
    order: string;
    ignoreLeadingArticles: boolean;
    alwaysShowSteamHunters?: boolean;
  }

  let { idPrefix, sortBy = $bindable(), order = $bindable(), ignoreLeadingArticles = $bindable(), alwaysShowSteamHunters = false }: Props = $props();
</script>

<div class="bp-sort-controls">
  <div>
    <label for="{idPrefix}-sortby">Sort by:</label>
    <select id="{idPrefix}-sortby" class="form-control" bind:value={sortBy}>
      <option value="name">Game name</option>
      <option value="playtime">Playtime</option>
      {#if options.modules.games.hltbIntegration.enabled}
        <option value="hltb-main">Main time to beat</option>
        <option value="hltb-extra">+Extra time to beat</option>
        <option value="hltb-100">100% time to beat</option>
      {/if}
      {#if alwaysShowSteamHunters || options.modules.games.steamHuntersIntegration.enabled}
        <option value="steamhunters">SteamHunters median time to complete</option>
      {/if}
    </select>
  </div>
  <div>
    <label for="{idPrefix}-order">Order:</label>
    <select id="{idPrefix}-order" class="form-control" bind:value={order}>
      <option value="asc">Ascending</option>
      <option value="desc">Descending</option>
    </select>
  </div>
  {#if sortBy === "name"}
    <div class="toggle-item">
      <Toggle bind:checked={ignoreLeadingArticles} />
      Ignore "A" and "The" at the start of game names
    </div>
  {/if}
</div>
