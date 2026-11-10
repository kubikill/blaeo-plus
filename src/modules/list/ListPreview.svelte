<script lang="ts">
  import GameInfoCells from "@/lib/GameInfoCells.svelte";
  import { formatDuration, progressClass } from "@/lib/utilities";

  let { list, timeSource = "hltb", noAchievementIds, gameTimes }: { list: AutomaticHltbTagInfo; timeSource?: "hltb" | "steamhunters"; noAchievementIds: Set<number>; gameTimes: Map<number, ListMakerGameTime> } = $props();

  function formatUsedTime(steamId: number): string {
    const time = gameTimes.get(steamId);

    return time ? `${formatDuration(time.seconds, time.count)} (${time.label})` : "—";
  }

  let statusClass: Record<string, string> = {
    "+": "added",
    "-": "removed",
    "/": "unchanged",
  };

  let statusContent: Record<string, string> = {
    "+": "<i class='fa fa-plus'></i>",
    "-": "<i class='fa fa-minus'></i>",
    "/": "=",
  };

  let oldNames = $derived(new Set(list.oldList?.games.map((game) => game.name)));
  let newNames = $derived(new Set(list.newGames.map((game) => game.name)));
  let currentNames = $derived(new Set(list.games.map((game) => game.name)));

  function getStatus(game: { name: string }) {
    if (oldNames.has(game.name)) {
      return "/";
    } else if (newNames.has(game.name)) {
      return "+";
    } else {
      return "-";
    }
  }

  const statusOrder: Record<string, number> = { "+": 0, "-": 1, "/": 2 };

  let games = $derived(list.games.map((game) => ({ ...game, status: getStatus(game) })).sort((a, b) => statusOrder[a.status] - statusOrder[b.status]));

  let removedGames = $derived((list.oldList?.games ?? []).filter((oldGame) => !currentNames.has(oldGame.name)).map((game) => ({ ...game, status: "-" })));
</script>

{#snippet row(game: { name: string; steam_id: number; progress?: string; status: string })}
  <tr class={`game game-${progressClass(game.progress)} game-${statusClass[game.status]}`}>
    <td><span class="game-status">{@html statusContent[game.status]}</span></td>
    <GameInfoCells {game} {timeSource} noAchievements={noAchievementIds.has(game.steam_id)} />
    <td class="hltb-column">{formatUsedTime(game.steam_id)}</td>
  </tr>
{/snippet}

<div>
  <p>{list.newGames.length} games will be added</p>
  <p>{removedGames.length} games will be removed</p>
  <p>{list.games.length} total games after submitting</p>
  <table class="game-table">
    <colgroup>
      <col style="width: 40px" />
      <col />
      {#if timeSource === "steamhunters"}
        <col style="width: 110px" />
      {:else}
        <col style="width: 100px" />
        <col style="width: 100px" />
        <col style="width: 100px" />
      {/if}
      <col style="width: 140px" />
    </colgroup>
    <thead>
      <tr>
        <th></th>
        <th>Game</th>
        {#if timeSource === "steamhunters"}
          <th class="hltb-column">SH median</th>
        {:else}
          <th class="hltb-column">HLTB Main</th>
          <th class="hltb-column">HLTB Extra</th>
          <th class="hltb-column">HLTB 100%</th>
        {/if}
        <th class="hltb-column">Time used</th>
      </tr>
    </thead>
    <tbody>
      {#each games as game}
        {@render row(game)}
      {/each}
      {#each removedGames as game}
        {@render row(game)}
      {/each}
    </tbody>
  </table>
</div>

<style lang="scss">
  .game > td:first-child {
    text-align: center;
  }

  .game-status {
    border-radius: 9999px;
    padding: 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
  }

  .game-added {
    .game-status {
      background-color: #5cb85c;
    }
  }

  .game-removed {
    .game-status {
      background-color: #d9534f;
    }
  }
</style>
