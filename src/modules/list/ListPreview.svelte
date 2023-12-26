<script lang="ts">
  import { hltbLogo } from "@/assets/icons";
  import { hltbData } from "@/lib/hltbService";

  export let list = [] as unknown as AutomaticHltbTagInfo;

  let statusClass = {
    "+": "added",
    "-": "removed",
    "/": "unchanged",
  };

  let statusContent = {
    "+": "<i class='fa fa-plus'></i>",
    "-": "<i class='fa fa-minus'></i>",
    "/": "=",
  };

  function getStatus(game: { name: string }) {
    if (list.oldList?.games.find((oldGame) => oldGame.name === game.name)) {
      return "/";
    } else if (list.newGames.find((newGame) => newGame.name === game.name)) {
      return "+";
    } else {
      return "-";
    }
  }

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

  $: {
    for (let game of list.games) {
      game.status = getStatus(game);
      game.statusValue = game.status === "+" ? 0 : game.status === "-" ? 1 : 2;
    }

    list.games.sort((a, b) => {
      return a.statusValue - b.statusValue;
    });
  }

  let removedGames: any[] = [];

  $: {
    removedGames = [];

    for (let game of list.oldList?.games ?? []) {
      if (!list.games.find((newGame) => newGame.name === game.name)) {
        removedGames.push(game);
      }
    }

    for (let game of removedGames) {
      game.status = "-";
      game.statusValue = 1;
    }
  }
</script>

<div>
  <p>{list.newGames.length} games will be added</p>
  <p>{removedGames.length} games will be removed</p>
  <p>{list.games.length} total games after submitting</p>
  <table class="game-table">
    <colgroup>
      <col style="width: 40px" />
      <col />
      <col style="width: 130px" />
      <col style="width: 130px" />
      <col style="width: 130px" />
    </colgroup>
    <thead>
      <tr>
        <th></th>
        <th>Game</th>
        <th class="hltb-column">HLTB Main</th>
        <th class="hltb-column">HLTB Extra</th>
        <th class="hltb-column">HLTB 100%</th>
      </tr>
    </thead>
    <tbody>
      {#each list.games as game}
        <tr class={`game game-${game.progress} game-${statusClass[game.status]}`}>
          <td><span class="game-status">{@html statusContent[game.status]}</span></td>
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
      {#each removedGames as game}
        <tr class={`game game-${game.progress.replaceAll(" ", "-")} game-${statusClass[game.status]}`}>
          <td><span class="game-status">{@html statusContent[game.status]}</span></td>
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
</div>

<style lang="scss">
  .hltb-column {
    text-align: center;
  }

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
