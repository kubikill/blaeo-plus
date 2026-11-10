<script lang="ts">
  import GameInfoCells from "@/lib/GameInfoCells.svelte";
  import { ensureGameData } from "@/lib/gameData";
  import { setList } from "@/lib/listService";
  import { listBackups } from "@/lib/store.svelte";
  import { getUserGames, getUserName, userData } from "@/globals";
  import { progressClass, reformatBlaeoGameListToSteamIdColumn } from "@/lib/utilities";

  let restoreErrors: Record<string, string> = $state({});

  async function restoreBackup(event: MouseEvent, list: ListBackup) {
    const target = event.target as HTMLButtonElement;

    if (target.classList.contains("confirmed")) {
      return;
    }

    if (target.classList.contains("confirm")) {
      target.classList.add("confirmed");
      target.classList.remove("confirm");
      restoreErrors[list.dateIso + list.id] = "";

      try {
        getUserName();
        const libraryBySteamId = reformatBlaeoGameListToSteamIdColumn(await getUserGames(userData.name));
        const gameIds = list.games.flatMap((game) => {
          const libraryGame = libraryBySteamId[game.steam_id];
          return libraryGame ? [libraryGame.id] : [];
        });

        const skipped = list.games.length - gameIds.length;
        if (skipped > 0) {
          console.warn(`Restoring backup of list ${list.name}: skipping ${skipped} game(s) that are no longer in your library`);
        }

        await setList(list.id, gameIds);

        target.classList.add("done");
      } catch (error: any) {
        console.error(`Failed to restore backup of list ${list.name}`, error);
        restoreErrors[list.dateIso + list.id] = `Restoring failed${error?.status ? ` (${error.status} ${error.statusText ?? ""})` : ""}. Check the browser console for details.`;
      } finally {
        target.classList.remove("confirmed");
      }
    } else {
      target.classList.add("confirm");
      setTimeout(() => {
        target.classList.remove("confirm");
      }, 3000);
    }
  }

  function removeBackup(event: MouseEvent, list: ListBackup) {
    const target = event.target as HTMLButtonElement;

    if (target.classList.contains("confirm")) {
      listBackups.splice(listBackups.indexOf(list), 1);

      target.classList.remove("confirm");
    } else {
      target.classList.add("confirm");
      setTimeout(() => {
        target.classList.remove("confirm");
      }, 3000);
    }
  }

  let gameDataVersion = $state(0);

  $effect(() => {
    const steamIds = listBackups.flatMap((backup) => backup.games.map((game) => game.steam_id));
    ensureGameData(steamIds, ["hltb"])
      .catch((error) => console.error("BLAEO+: some HLTB data for list backups is unavailable", error))
      .then(() => gameDataVersion++);
  });

  let sortedList = $derived([...listBackups].sort((a, b) => (a.dateIso > b.dateIso ? -1 : 1)));
</script>

<div>
  <p>Backups are deleted automatically after 30 days.</p>
  {#each sortedList as list}
    <div>
      <h3><a href="https://www.backlog-assassins.net/lists/{list.id}/">{list.name}</a> - {list.games.length} games</h3>
      <p>Backup date: {list.date}</p>
      <details>
        <summary>Games</summary>
        <table class="game-table content">
          <colgroup>
            <col />
            <col style="width: 130px" />
            <col style="width: 130px" />
            <col style="width: 130px" />
          </colgroup>
          <thead>
            <tr>
              <th>Game</th>
              <th class="hltb-column">HLTB Main</th>
              <th class="hltb-column">HLTB Extra</th>
              <th class="hltb-column">HLTB 100%</th>
            </tr>
          </thead>
          <tbody>
            {#key gameDataVersion}
              {#each list.games as game}
                <tr class="game game-{progressClass(game.progress)}">
                  <GameInfoCells {game} />
                </tr>
              {/each}
            {/key}
          </tbody>
        </table>
      </details>
      <button class="btn btn-success" type="button" data-id={list.id} onclick={(event) => restoreBackup(event, list)}>
        <span class="done-message">Done!</span>
        <span class="confirmed-message">Restoring...</span>
        <span class="confirm-message">Are you sure?</span>
        <span class="normal-message">Restore</span>
      </button>
      <button class="btn btn-danger btn-delete" type="button" data-id={list.id} onclick={(event) => removeBackup(event, list)}>
        <span class="confirm-message">Are you sure?</span>
        <span class="normal-message">Remove</span>
      </button>
      {#if restoreErrors[list.dateIso + list.id]}
        <div class="alert alert-danger">{restoreErrors[list.dateIso + list.id]}</div>
      {/if}
    </div>
  {/each}

  {#if listBackups.length <= 0}
    <p>No backups found.</p>
  {/if}
</div>

<style lang="scss">
  details {
    summary {
      display: list-item;
      cursor: pointer;
      line-height: 1.3;
      font-size: 14px;
      margin-bottom: 8px;
    }

    &[open] {
      .content {
        animation: details-show 150ms ease-in-out;
      }
    }
  }

  .confirm-message {
    display: none;
  }
  .confirmed-message {
    display: none;
  }
  .done-message {
    display: none;
  }

  button:global(.confirm) {
    .confirm-message {
      display: inline-block;
    }
    .normal-message {
      display: none;
    }
  }

  button:global(.confirmed) {
    .confirmed-message {
      display: inline-block;
    }
    .normal-message {
      display: none;
    }
  }

  button:global(.done) {
    .done-message {
      display: inline-block;
    }
    .normal-message {
      display: none;
    }
  }

  span {
    pointer-events: none;
  }

  @keyframes details-show {
    from {
      transform: var(--details-translate, translateY(-0.5em));
      opacity: 0;
    }
  }
</style>
