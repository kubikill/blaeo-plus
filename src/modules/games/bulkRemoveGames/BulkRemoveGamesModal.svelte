<script lang="ts">
  import Modal from "@/lib/Modal.svelte";
  import { untrack } from "svelte";
  import { deleteGame } from "@/lib/blaeoGameService";
  import RequestErrorDetails from "@/lib/RequestErrorDetails.svelte";
  import RequestProgress from "@/lib/RequestProgress.svelte";

  type MissingGame = {
    id: string;
    name: string;
    status: string;
    playtime: string | undefined;
    achievements: string | undefined;
    markedForDeletion: boolean;
  };

  let { games: initialGames = [] }: { games?: MissingGame[] } = $props();

  let games = $state(untrack(() => initialGames));

  let requestError = $state.raw<unknown>(null);
  let showModal = $state(false);

  let progress = $state(0);
  let progressTotal = $state(0);
  let removingStats = $state({
    success: 0,
    notFound: 0,
    forbidden: 0,
    failed: 0,
  });
  let currentlyRemovedGame = $state("");

  let status = $state("selecting");

  function hideModal() {
    showModal = false;

    setTimeout(() => {
      status = "selecting";
      progress = 0;
      progressTotal = 0;
      currentlyRemovedGame = "";
      requestError = null;
      removingStats = {
        success: 0,
        notFound: 0,
        forbidden: 0,
        failed: 0,
      };
    }, 200);
  }

  let lastClickedIndex: number | null = null;

  function selectRange(event: MouseEvent & { currentTarget: HTMLInputElement }, index: number) {
    if (event.shiftKey && lastClickedIndex !== null && lastClickedIndex < games.length) {
      const checked = event.currentTarget.checked;

      for (let i = Math.min(index, lastClickedIndex); i <= Math.max(index, lastClickedIndex); i++) {
        games[i].markedForDeletion = checked;
      }
    }

    lastClickedIndex = index;
  }

  function markAllGames(markedForDeletion: boolean) {
    for (let game of games) {
      game.markedForDeletion = markedForDeletion;
    }
  }

  async function deleteSelectedGames() {
    const gamesToDelete = games.filter((game) => game.markedForDeletion);

    if (gamesToDelete.length === 0) {
      return;
    }

    status = "removing";

    progress = 0;
    progressTotal = gamesToDelete.length;

    for (let game of gamesToDelete) {
      currentlyRemovedGame = game.name;

      const canContinue = await tryDeleteGame(game.id);

      if (!canContinue) {
        return;
      }

      progress++;
    }

    status = "finished";
  }

  async function tryDeleteGame(gameId: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      try {
        await deleteGame(gameId);
        removingStats.success++;
        resolve(true);
      } catch (deleteError: any) {
        console.error(deleteError);
        switch (deleteError.status) {
          case 403:
            removingStats.forbidden++;
            break;
          case 404:
            removingStats.notFound++;
            break;
          default:
            status = "error";
            requestError = deleteError;
            resolve(false);
            return;
        }
        resolve(true);
      }
    });
  }
</script>

<button class="bp-bulk-remove-games btn btn-default" onclick={() => (showModal = true)}>Bulk remove games</button>

<Modal class="bp-bulk-remove-games-modal" title="Bulk remove games" bind:open={showModal} onclose={hideModal}>
  {#if status === "selecting"}
    <div class="btn-row">
      <button class="btn btn-default" type="button" onclick={() => markAllGames(true)}>Select all</button>
      <button class="btn btn-default" type="button" onclick={() => markAllGames(false)}>Deselect all</button>
      <span class="range-hint">Hold Shift while clicking a checkbox to select or deselect every game up to the previously clicked one.</span>
    </div>
    <table class="game-table">
      <thead>
        <tr>
          <th>Delete</th>
          <th>Game</th>
          <th>Achievements</th>
          <th>Playtime</th>
        </tr>
      </thead>
      <tbody>
        {#each games as game, index}
          <tr class="game game-{game.status}">
            <td class="checkbox-cell">
              <div class="checkbox">
                <label>
                  <input type="checkbox" bind:checked={game.markedForDeletion} onclick={(event) => selectRange(event, index)} />
                </label>
              </div>
            </td>
            <td>{game.name}</td>
            <td>{@html game.achievements}</td>
            <td>{@html game.playtime}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else if status === "removing"}
    <p><i class="fa fa-spinner"></i> Removing games from BLAEO...</p>
    <p>Currently removing: {currentlyRemovedGame}</p>
    <RequestProgress {progress} total={progressTotal} />
  {:else if status === "finished"}
    <h2>Done!</h2>
    <ul>
      <li>{removingStats.success} games have been successfully removed.</li>
      <li>{removingStats.notFound} failed due to a not found error. (Were they removed earlier?)</li>
      <li>{removingStats.forbidden} failed due to a forbidden error. (Happens when you try to remove a game that BLAEO doesn't consider as missing)</li>
    </ul>
  {:else if status === "error"}
    <h3>An error has occured. View details below.</h3>
    <ul>
      <li>{removingStats.success} games have been successfully removed.</li>
      <li>{removingStats.notFound} failed due to a not found error. (Were they removed earlier?)</li>
      <li>{removingStats.forbidden} failed due to a forbidden error. (Happens when you try to remove a game that BLAEO doesn't consider as missing)</li>
    </ul>
    <p>Error occured while removing {currentlyRemovedGame}.</p>
    <RequestErrorDetails error={requestError} />
  {/if}
  {#snippet footer()}
    {#if ["selecting", "finished"].includes(status)}
      <button type="button" class="btn btn-default" onclick={hideModal}>Close</button>
    {/if}
    {#if status === "selecting"}
      <button type="button" class="btn btn-danger" disabled={!games.find((game) => game.markedForDeletion)} onclick={deleteSelectedGames}>Remove selected</button>
    {/if}
  {/snippet}
</Modal>

<style lang="scss">
  .checkbox {
    margin: 0;

    input {
      height: 20px;
      width: 20px;
      margin: 0 0 0 -20px;
    }
  }

  .btn-row {
    margin-bottom: 20px;
  }

  .range-hint {
    display: block;
    margin-top: 6px;
    color: #555;
    font-size: 12px;
  }

  .checkbox-cell {
    user-select: none;
  }

  h2 {
    margin-top: 0;
    margin-bottom: 8px;
  }
</style>
