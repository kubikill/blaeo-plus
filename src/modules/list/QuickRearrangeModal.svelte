<script lang="ts">
  import { authenticityToken } from "@/globals";
  import { hltbData } from "@/lib/hltbService";
  import { optionsStore } from "@/lib/store";
  import { GM_xmlhttpRequest } from "vite-plugin-monkey/dist/client";

  export let listId: string;
  export let listName: string;
  export let gameContainer: HTMLElement;
  let showModal = false;
  let sortBy = "name";
  let order = "asc";
  let rearranging = false;

  function hideModal() {
    showModal = false;
  }

  function getGamesFromBlaeo() {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "GET",
        url: `https://www.backlog-assassins.net/lists/${listId}.json`,
        nocache: true,
        responseType: "json",
        onload: (response) => {
          if (response.status === 200) {
            resolve(response.response);
          } else {
            console.error(`Failed (probably) to get games from BLAEO. Details: ${response.responseText}`);
            reject(response.responseText);
          }
        },
        onerror: (error) => {
          console.error(`Failed to get games from BLAEO. Details: ${error}`);
          reject(error);
        },
      });
    });
  }

  async function getGames() {
    let gameArray = [] as any[];

    const gameElements = Array.from(gameContainer.querySelectorAll(".game")) as HTMLElement[];

    for (let game of gameElements) {
      gameArray.push({
        id: game.dataset.item,
        steamId: game!.querySelector<HTMLAnchorElement>("a[href]")!.href!.match(/\/app\/(\d+)/)![1],
      });
    }

    let games = [] as any;

    if (sortBy === "name" || sortBy === "playtime") {
      games = (await getGamesFromBlaeo()) as any;
    }

    switch (sortBy) {
      case "name":
        games.list.games.forEach((game: { name: any }, index: number) => {
          gameArray[index].value = game.name;
        });

        break;
      case "playtime":
        games.list.games.forEach((game: { playtime: any }, index: number) => {
          gameArray[index].value = game.playtime;
        });

        break;
      case "hltb-main":
        for (let game of gameArray) {
          game.value = hltbData[game.steamId].main;
        }
        break;
      case "hltb-extra":
        for (let game of gameArray) {
          game.value = hltbData[game.steamId].extra;
        }
        break;
      case "hltb-100":
        for (let game of gameArray) {
          game.value = hltbData[game.steamId].everything;
        }
        break;
    }

    return gameArray;
  }

  async function rearrange() {
    rearranging = true;
    let gameArray = await getGames();

    switch (sortBy) {
      case "name":
        if (order === "asc") {
          gameArray = gameArray.sort((a, b) => a.value.localeCompare(b.value));
        } else {
          gameArray = gameArray.sort((a, b) => b.value.localeCompare(a.value));
        }
        break;
      default:
        if (order === "asc") {
          gameArray = gameArray.sort((a, b) => a.value - b.value);
        } else {
          gameArray = gameArray.sort((a, b) => b.value - a.value);
        }
    }

    let formData = new URLSearchParams();

    for (let game of gameArray) {
      formData.append("games[]", game.id);
    }

    GM_xmlhttpRequest({
      method: "POST",
      url: `https://www.backlog-assassins.net/lists/${listId}/games`,
      nocache: true,
      responseType: "json",
      data: formData,
      headers: {
        "X-CSRF-Token": authenticityToken,
      },
      onload: (response) => {
        if (response.status === 200) {
          window.location.reload();
        } else {
          console.error(`Failed (probably) to rearrange. Details: ${response.responseText}`);
        }
      },
      onerror: (error) => {
        console.error(`Failed to rearrange Details: ${error}`);
      },
    });
  }
</script>

<button class="bp-quick-rearrange btn btn-default" on:click={() => (showModal = true)}> Quick rearrange </button>

<div class="bp-quick-rearrange-modal" role="presentation" class:visible={showModal === true} on:click|self={hideModal}>
  <div class="modal-content">
    <div class="modal-header">
      <h2 class="modal-header-heading">Quick rearranging "{listName}" list</h2>
      <button type="button" aria-label="Close" on:click={hideModal}>
        <i class="fa fa-close" />
      </button>
    </div>
    <div class="modal-body">
      {#if rearranging}
        <h3>Rearranging... The page will reload if successful.</h3>
      {:else}
        <div>
          <label for="bp-quick-rearrange-sortby">Sort by:</label>
          <select id="bp-quick-rearrange-sortby" bind:value={sortBy}>
            <option value="name">Game name</option>
            <option value="playtime">Playtime</option>
            {#if $optionsStore.modules.games.hltbIntegration.enabled}
              <option value="hltb-main">Main time to beat</option>
              <option value="hltb-extra">+Extra time to beat</option>
              <option value="hltb-100">100% time to beat</option>
            {/if}
          </select>
        </div>
        <div>
          <label for="bp-quick-rearrange-order">Order:</label>
          <select id="bp-quick-rearrange-order" bind:value={order}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      {/if}
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-default" on:click={hideModal}>Cancel</button>
      <button type="button" class="btn btn-primary" on:click={rearrange}>Rearrange</button>
    </div>
  </div>
</div>

<style lang="scss">
  .bp-quick-rearrange-modal {
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
    font-family: Arimo, Arial, sans-serif;
    font-size: 14px;
    line-height: 1.42857;
    font-weight: 400;

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

      ul {
        list-style: none;
        padding-left: 16px;

        li {
          display: flex;
          margin-bottom: 4px;

          &.info {
            margin-top: 12px;
            font-style: italic;
          }

          :global(svg) {
            margin-right: 8px;
          }

          :global(.icon) {
            margin-right: 28px;
          }
        }
      }
    }
  }
</style>
