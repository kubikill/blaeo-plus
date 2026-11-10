<script lang="ts">
  import { cachedGameCount, refreshCachedGameData, type Dataset } from "@/lib/gameData";
  import { syncExcludedGames } from "@/lib/hltbService";
  import { cacheUpdates } from "@/lib/store.svelte";

  const datasets: { dataset: Dataset; label: string }[] = [
    { dataset: "hltb", label: "HLTB times" },
    { dataset: "linux", label: "ProtonDB & Steam Deck ratings" },
    { dataset: "steamspy", label: "Steam store tags" },
    { dataset: "steamhunters", label: "SteamHunters times" },
    { dataset: "steamos", label: "SteamOS ratings" },
    { dataset: "steammachine", label: "Steam Machine ratings" },
    { dataset: "steamframe", label: "Steam Frame ratings" },
  ];

  let updating: Record<string, boolean> = $state({});
  let counts: Record<string, number> = $state({});

  async function updateCounts() {
    for (const { dataset } of datasets) {
      counts[dataset] = await cachedGameCount(dataset);
    }
  }

  updateCounts();

  async function update(name: string, run: () => Promise<unknown>) {
    updating[name] = true;

    try {
      await run();
    } catch (error) {
      console.error(`BLAEO+: ${name} cache update failed`, error);
    } finally {
      updating[name] = false;
      updateCounts();
    }
  }
</script>

<div>
  {#each datasets as { dataset, label }}
    <h3>{label}</h3>
    <p>Cached for {counts[dataset] ?? "…"} games</p>
    <button type="button" class="btn btn-primary" onclick={() => update(dataset, () => refreshCachedGameData(dataset))} disabled={updating[dataset]}>Refresh</button>
  {/each}
  <h3>HLTB excluded games</h3>
  <p>Last update: {cacheUpdates.excludedGames}</p>
  <button type="button" class="btn btn-primary" onclick={() => update("excludedGames", syncExcludedGames)} disabled={updating.excludedGames}>Force update</button>
</div>
