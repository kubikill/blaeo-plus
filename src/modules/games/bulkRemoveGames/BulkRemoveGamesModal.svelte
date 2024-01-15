<script lang="ts">
  import { deleteGame } from "@/lib/blaeoGameService";

  export let games: {
    id: string;
    name: string;
    status: string;
    playtime: string | undefined;
    achievements: string | undefined;
    markedForDeletion: boolean;
  }[] = [];

  let error = {
    status: "",
    statusText: "",
    responseText: "",
    error: "",
  };
  let showModal = false;

  let progress = 0;
  let progressTotal = 0;
  let removingStats = {
    success: 0,
    notFound: 0,
    forbidden: 0,
    failed: 0,
  };
  let currentlyRemovedGame = "";
  let submittingTakesTooLong = false;
  let submittingTakesTooLongTimeout: NodeJS.Timeout | undefined;

  let status = "selecting";

  function hideModal() {
    showModal = false;

    setTimeout(() => {
      status = "selecting";
      progress = 0;
      progressTotal = 0;
      currentlyRemovedGame = "";
      submittingTakesTooLong = false;
      submittingTakesTooLongTimeout = undefined;
      error = {
        status: "",
        statusText: "",
        responseText: "",
        error: "",
      };
      removingStats = {
        success: 0,
        notFound: 0,
        forbidden: 0,
        failed: 0,
      };
    }, 200);
  }

  function selectAllGames() {
    games = games.map((game) => {
      game.markedForDeletion = true;
      return game;
    });
  }

  function deselectAllGames() {
    games = games.map((game) => {
      game.markedForDeletion = false;
      return game;
    });
  }

  async function deleteSelectedGames() {
    status = "removing";

    const gamesToDelete = games.filter((game) => game.markedForDeletion);

    if (gamesToDelete.length === 0) {
      return;
    }

    progress = 0;
    progressTotal = gamesToDelete.length;

    for (let game of gamesToDelete) {
      currentlyRemovedGame = game.name;

      submittingTakesTooLongTimeout = setTimeout(() => {
        submittingTakesTooLong = true;
      }, 8000);

      await tryDeleteGame(game.id);

      clearTimeout(submittingTakesTooLongTimeout);
      submittingTakesTooLong = false;
      progress++;
    }

    status = "finished";
  }

  async function tryDeleteGame(gameId: string) {
    return new Promise(async (resolve, reject) => {
      try {
        await deleteGame(gameId);
        removingStats.success++;
        resolve(true);
      } catch (requestError: any) {
        console.error(requestError);
        switch (requestError.status) {
          case 403:
            removingStats.forbidden++;
            break;
          case 404:
            removingStats.notFound++;
            break;
          default:
            status = "error";
            error.status = requestError.status ?? "";
            error.statusText = requestError.statusText ?? "";
            error.responseText = requestError.responseText ?? "";
            error.error = requestError;
            reject(false);
            return;
        }
        resolve(true);
      }
    });
  }
</script>

<button class="bp-bulk-remove-games btn btn-default" on:click={() => (showModal = true)}>Bulk remove games</button>

<div class="bp-bulk-remove-games-modal" role="presentation" class:visible={showModal === true} on:click|self={hideModal}>
  <div class="modal-content">
    <div class="modal-header">
      <h2 class="modal-header-heading">Bulk remove games</h2>
      <button type="button" aria-label="Close" on:click={hideModal}>
        <i class="fa fa-close" />
      </button>
    </div>
    <div class="modal-body">
      {#if status === "selecting"}
        <div class="btn-row">
          <button class="btn btn-default" type="button" on:click={selectAllGames}>Select all</button>
          <button class="btn btn-default" type="button" on:click={deselectAllGames}>Deselect all</button>
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
            {#each games as game}
              <tr class="game game-{game.status}">
                <td>
                  <div class="checkbox">
                    <label>
                      <input type="checkbox" bind:checked={game.markedForDeletion} />
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
        <div class="progress">
          <div class="progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax={progressTotal} style="width: {(progress / progressTotal) * 100}%">
            {progress} / {progressTotal}
          </div>
        </div>
        {#if submittingTakesTooLong}
          <div class="alert alert-info">
            <p><i class="fa fa-info-circle"></i> This is taking too long. BLAEO might be down/under heavy load, your browser might be silently blocking the request or your internet might be slow.</p>
            <p>You can try using a different userscript extension (Violentmonkey or Tampermonkey) or a different browser.</p>
            <p>If it still doesn't work, please report this issue on <a href={SUPPORT_URL}>BLAEO+'s group thread</a> and please share which browser are you using and which userscript extension.</p>
          </div>
        {/if}
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
        <p>Status: {error.status} {error.statusText}</p>
        <pre><code>{error.responseText}</code></pre>
        <p>If this problem continues, please report this issue on <a href={SUPPORT_URL}>BLAEO+'s group thread</a> and share the error details.</p>
      {/if}
    </div>
    <div class="modal-footer">
      {#if ["selecting", "finished"].includes(status)}
        <button type="button" class="btn btn-default" on:click={hideModal}>Close</button>
      {/if}
      {#if status === "selecting"}
        <button type="button" class="btn btn-danger" disabled={!games.find((game) => game.markedForDeletion)} on:click={deleteSelectedGames}>Remove selected</button>
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  .bp-bulk-remove-games-modal {
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
    display: flex;
    align-items: center;
    justify-content: center;

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
      width: 100%;
      max-width: 700px;
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

      h3 {
        margin-top: 0;
      }
    }

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

    h2 {
      margin-top: 0;
      margin-bottom: 8px;
    }
  }
</style>
