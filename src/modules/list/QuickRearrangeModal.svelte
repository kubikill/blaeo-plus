<script lang="ts">
  import Modal from "@/lib/Modal.svelte";
  import { ensureGameData } from "@/lib/gameData";
  import { sortGamesBy } from "@/lib/gameSort";
  import { findSteamId } from "@/lib/gameTable";
  import { getList, setList } from "@/lib/listService";
  import SortControls from "./SortControls.svelte";

  interface Props {
    listId: string;
    listName: string;
    gameContainer: HTMLElement;
  }

  let { listId, listName, gameContainer }: Props = $props();
  let showModal = $state(false);
  let sortBy = $state("name");
  let order = $state("asc");
  let ignoreLeadingArticles = $state(true);
  let rearranging = $state(false);
  let errorMessage = $state("");

  type RearrangeEntry = { id: string | undefined; steamId: number; name?: string; playtime?: number };

  function hideModal() {
    showModal = false;
  }

  async function getGames(): Promise<RearrangeEntry[]> {
    const gameElements = Array.from(gameContainer.querySelectorAll(".game")) as HTMLElement[];

    const gameArray: RearrangeEntry[] = gameElements.map((game) => {
      const steamId = findSteamId(game);

      if (steamId === undefined) {
        throw new Error(`Couldn't find the Steam ID of list entry ${game.dataset.item}`);
      }

      return { id: game.dataset.item, steamId };
    });

    if (sortBy === "name" || sortBy === "playtime") {
      const list = await getList(listId);
      const listGamesBySteamId = new Map(list.games.map((game) => [+game.steam_id, game]));

      for (let game of gameArray) {
        const listGame = listGamesBySteamId.get(game.steamId);
        game.name = listGame?.name;
        game.playtime = listGame?.playtime;
      }
    } else {
      await ensureGameData(
        gameArray.map((game) => game.steamId),
        [sortBy === "steamhunters" ? "steamhunters" : "hltb"],
      );
    }

    return gameArray;
  }

  async function rearrange() {
    rearranging = true;
    errorMessage = "";

    try {
      const gameArray = sortGamesBy(await getGames(), (game) => game, { sortBy, order, ignoreLeadingArticles });

      await setList(
        listId,
        gameArray.map((game) => game.id as string),
      );

      window.location.reload();
    } catch (error: any) {
      console.error("Quick rearrange failed", error);
      rearranging = false;
      errorMessage = error?.message || error?.statusText || (typeof error === "string" ? error : "") || "Unknown error";
    }
  }
</script>

<button class="bp-quick-rearrange btn btn-default" onclick={() => (showModal = true)}> Quick rearrange </button>

<Modal class="bp-quick-rearrange-modal" bind:open={showModal} onclose={hideModal}>
  {#snippet heading()}Quick rearranging "{listName}" list{/snippet}
  {#if errorMessage}
    <div class="alert alert-danger">Rearranging failed: {errorMessage}</div>
  {/if}
  {#if rearranging}
    <h3>Rearranging... The page will reload if successful.</h3>
  {:else}
    <SortControls idPrefix="bp-quick-rearrange" bind:sortBy bind:order bind:ignoreLeadingArticles />
  {/if}
  {#snippet footer()}
    <button type="button" class="btn btn-default" onclick={hideModal}>Cancel</button>
    <button type="button" class="btn btn-primary" disabled={rearranging} onclick={rearrange}>Rearrange</button>
  {/snippet}
</Modal>

<style lang="scss">
  :global(.bp-quick-rearrange-modal .bp-sort-controls .toggle-item) {
    margin-top: 10px;
    margin-bottom: 0;
  }
</style>
