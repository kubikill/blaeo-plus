<script lang="ts">
  import { hltbLogo, steamHuntersLogo } from "@/assets/icons";
  import { formatHltbTime, getHltbGame, getHltbModes, getHltbStatus } from "@/lib/hltbService";
  import { formatSteamHuntersTime, getSteamHuntersUrl, steamHuntersTitle } from "@/lib/steamHunters";
  import { options } from "@/lib/store.svelte";

  let { game, timeSource = "hltb", noAchievements = false }: { game: { name: string; steam_id: number }; timeSource?: "hltb" | "steamhunters"; noAchievements?: boolean } = $props();

  const hltbGame = $derived(getHltbGame(game.steam_id));
</script>

<td>
  {game.name}
  <ul class="toolbar">
    <li>
      <a href="https://store.steampowered.com/app/{game.steam_id}" class="steam" aria-label="Steam store page" title="Steam store page"><i></i></a>
    </li>
    {#if hltbGame}
      <li class="bp-hltb-element" style="vertical-align: middle">
        <a href="https://howlongtobeat.com/game/{hltbGame.hltbId}" aria-label="HLTB game page" title="HLTB game page">{@html hltbLogo}</a>
      </li>
    {/if}
    {#if timeSource === "steamhunters" && options.modules.games.steamHuntersIntegration.enabled}
      <li class="bp-steamhunters-element" style="vertical-align: middle">
        <a href={getSteamHuntersUrl(game.steam_id)} aria-label="SteamHunters game page" title="SteamHunters game page">{@html steamHuntersLogo}</a>
      </li>
    {/if}
  </ul>
</td>

{#if timeSource === "steamhunters"}
  <td class="hltb-column" title={steamHuntersTitle(game.steam_id, noAchievements)}>{formatSteamHuntersTime(game.steam_id, noAchievements)}</td>
{:else if !hltbGame}
  <td class="hltb-column" colspan="3">{getHltbStatus(game.steam_id)}</td>
{:else if hltbGame.type.includes("sp")}
  <td class="hltb-column">{formatHltbTime(game.steam_id, "main")}</td>
  <td class="hltb-column">{formatHltbTime(game.steam_id, "extra")}</td>
  <td class="hltb-column">{formatHltbTime(game.steam_id, "everything")}</td>
{:else}
  <td class="hltb-column" colspan="3">
    {#each getHltbModes(hltbGame) as { field, label }}
      {label}: {formatHltbTime(game.steam_id, field)}
    {/each}
  </td>
{/if}
