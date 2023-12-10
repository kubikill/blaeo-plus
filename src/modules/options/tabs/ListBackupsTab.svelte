<script lang="ts">
  import { hltbLogo } from "@/assets/icons";
  import { hltbData } from "@/lib/hltbService";
  import { setList } from "@/lib/listService";
  import { listBackupStore } from "@/lib/store";

  function getHltbString(game: { steam_id: string | number }, type: string | number) {
    let gameObj = hltbData[game.steam_id];

    if (gameObj) {
      let mainCompHours = Math.floor(+gameObj[type] / 3600);
      let mainCompMinutes = Math.floor((+gameObj[type] % 3600) / 60);

      let countWarning = "";
      if (gameObj[`${type}Count`] <= 10) {
        countWarning = "!";
      } else if (gameObj[`${type}Count`] <= 100) {
        countWarning = "~";
      }

      return `${countWarning}${mainCompHours}h ${mainCompMinutes}min`;
    }
  }

  async function restoreBackup(event: MouseEvent) {
    const target = event.target as HTMLButtonElement;

    if (target.classList.contains("confirm")) {
      target.classList.add("confirmed");
      target.classList.remove("confirm");

      const list = $listBackupStore[+target.dataset.index!];
      await setList(
        list.id,
        list.games.map((game) => game.id),
      );

      target.classList.add("done");
      target.classList.remove("confirmed");
    } else {
      target.classList.add("confirm");
      setTimeout(() => {
        target.classList.remove("confirm");
      }, 3000);
    }
  }

  function removeBackup(event: MouseEvent) {
    const target = event.target as HTMLButtonElement;

    if (target.classList.contains("confirm")) {
      $listBackupStore.splice(+target.dataset.index!, 1);

      $listBackupStore = $listBackupStore;
    } else {
      target.classList.add("confirm");
      setTimeout(() => {
        target.classList.remove("confirm");
      }, 3000);
    }
  }

  let sortedList = [] as ListBackup[];

  $: {
    sortedList = $listBackupStore.sort((a, b) => {
      return a.dateIso > b.dateIso ? -1 : 1;
    });
  }
</script>

<div>
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
            {#each list.games as game}
              <tr class={`game game-${game.progress}`}>
                <td>
                  {game.name}
                  <ul class="toolbar">
                    <li>
                      <a href="https://store.steampowered.com/app/{game.steam_id}" class="steam"><i></i></a>
                    </li>
                    <li class="bp-hltb-element" style="vertical-align: middle">
                      <a href="https://howlongtobeat.com/game/{hltbData[game.steam_id].hltbId}" aria-label="HLTB game page" title="HLTB game page">{@html hltbLogo}</a>
                    </li>
                  </ul>
                </td>

                {#if hltbData[game.steam_id].type.includes("sp")}
                  <td class="hltb-column">{getHltbString(game, "main")}</td>
                  <td class="hltb-column">{getHltbString(game, "extra")}</td>
                  <td class="hltb-column">{getHltbString(game, "everything")}</td>
                {:else}
                  <td class="hltb-column" colspan="3">
                    {#if hltbData[game.steam_id].type.includes("mp")}
                      MP: {getHltbString(game, "mp")}
                    {/if}
                    {#if hltbData[game.steam_id].type.includes("coop")}
                      Co-Op: {getHltbString(game, "coop")}
                    {/if}
                  </td>
                {/if}
              </tr>
            {/each}
          </tbody>
        </table>
      </details>
      <button class="btn btn-success" type="button" data-id={list.id} on:click={restoreBackup}>
        <span class="done-message">Done!</span>
        <span class="confirmed-message">Restoring...</span>
        <span class="confirm-message">Are you sure?</span>
        <span class="normal-message">Restore</span>
      </button>
      <button class="btn btn-danger btn-delete" type="button" data-id={list.id} on:click={removeBackup}>
        <span class="confirm-message">Are you sure?</span>
        <span class="normal-message">Remove</span>
      </button>
    </div>
  {/each}

  {#if $listBackupStore.length <= 0}
    <p>No backups found.</p>
  {/if}
</div>

<style lang="scss">
  h2 {
    margin: 0 0 4px;
  }

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
