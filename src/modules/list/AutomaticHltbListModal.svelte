<script lang="ts">
  import { MultiSelect } from "svelte-multiselect";
  import Toggle from "svelte-switcher";
  import Tabs from "@/lib/Tabs.svelte";
  import { listBackupStore, optionsStore } from "@/lib/store";
  import { getList, setList } from "@/lib/listService";
  import { getUserGames, getUserName, userData } from "@/globals";
  import { hltbData } from "@/lib/hltbService";
  import { reformatBlaeoGameListToBlaeoIdColumn, reformatBlaeoGameListToSteamIdColumn } from "@/lib/utilities";
  import ListPreview from "./ListPreview.svelte";

  const progresses = {
    "wont play": true,
    "never played": true,
    unfinished: true,
    beaten: true,
    completed: true,
    uncategorized: true,
  };

  let error: null = null;
  let status = "setup";
  let showModal = false;
  let mode = "update";
  let sortWholeList = false;
  let listBy: "main" | "extra" | "everything" = "main";
  let sortBy = "name";
  let sortByOrder = "asc";
  let mpOnlyBehavior = "exclude";
  let endlessBehavior = "exclude";
  let mpOnlyList: { label: any; value: any; color: any }[] = [];
  let endlessList: { label: any; value: any; color: any }[] = [];
  let lists = [] as { id: string; name: string; color: string }[];
  let activeTab = 0;
  let progress = 0;
  let progressTotal = 0;

  const listEntries = document.querySelectorAll("table.lists-table[data-rearrange] tr[data-item]") as NodeListOf<HTMLTableRowElement>;
  for (let listEntry of listEntries) {
    lists.push({
      id: listEntry.getAttribute("data-item") as string,
      name: listEntry.querySelector("td:first-child > span")?.textContent?.trim() as string,
      color: listEntry.style.borderLeftColor,
    });
  }

  let formattedLists: { label: any; value: any; color: any }[] = [];

  for (let list of lists) {
    formattedLists.push({
      label: list.name,
      value: list.id,
      color: list.color,
    });
  }

  let listLoaded = false;

  function hideModal() {
    showModal = false;
    listLoaded = false;
    status = "setup";
  }

  function cancelPreview() {
    status = "setup";
  }

  function addList() {
    listArray.push({ playtime: "", tagId: [] as any, games: [], newGames: [], oldList: null });
    listArray = listArray;
  }

  function removeList(index: number) {
    listArray.splice(index, 1);
    listArray = listArray;
  }

  function toggleProgress(progress: keyof typeof progresses) {
    progresses[progress] = !progresses[progress];
  }

  let allGames = [] as BlaeoGamesJson;
  let filteredGames = [];
  let gamesWithNoHltbData = [] as BlaeoGamesJson;
  let mpOnlyGames = [] as BlaeoGamesJson;
  let endlessGames = [] as BlaeoGamesJson;
  let oldMpOnlyList = {} as BlaeoListJson;
  let oldEndlessList = {} as BlaeoListJson;

  async function filterGames(games: BlaeoGamesJson): Promise<[BlaeoGamesJson, BlaeoGamesJson, BlaeoGamesJson, BlaeoGamesJson]> {
    let mpOnlyGames = [] as BlaeoGamesJson;
    let endlessGames = [] as BlaeoGamesJson;
    let gamesWithNoHltbData = [] as BlaeoGamesJson;

    for (let list of listArray) {
      if (list.tagId.length > 0) {
        list.oldList = await getList(list.tagId[0].value);
      }
    }

    if (mpOnlyBehavior === "separate" && mpOnlyList?.[0]) {
      mpOnlyListArray.oldList = await getList(mpOnlyList[0].value);
    }

    if (endlessBehavior === "separate" && endlessList?.[0] && mpOnlyList[0].value !== endlessList[0].value) {
      endlessListArray.oldList = await getList(endlessList[0].value);
    }

    if (mode === "update") {
      games = games.filter((game) => {
        for (let list of listArray) {
          if (list.oldList && list.oldList.games.find((listGame) => listGame.steam_id === game.steam_id)) {
            return false;
          }
        }

        if (mpOnlyBehavior === "separate" && mpOnlyListArray.oldList?.games.find((listGame) => listGame.steam_id === game.steam_id)) {
          return false;
        }

        if (endlessBehavior === "separate" && endlessListArray.oldList?.games.find((listGame) => listGame.steam_id === game.steam_id)) {
          return false;
        }

        return true;
      });
    }

    let filteredGames = games.filter((game) => {
      if (progresses[game.progress as keyof typeof progresses] === false) {
        return false;
      }

      if (mpOnlyBehavior != "normal" && !hltbData[game.steam_id]?.type.includes("sp") && (hltbData[game.steam_id]?.type.includes("mp") || hltbData[game.steam_id]?.type.includes("coop"))) {
        if (mpOnlyBehavior === "separate") {
          mpOnlyGames.push(game);
        }
        return false;
      }

      if (!hltbData[game.steam_id]?.avgComp) {
        gamesWithNoHltbData.push(game);
        return false;
      }

      if (hltbData[game.steam_id]?.endless) {
        if (endlessBehavior === "separate") {
          endlessGames.push(game);
        }
        return false;
      }

      return true;
    });

    console.log("Filtered games", filteredGames);

    return [filteredGames, gamesWithNoHltbData, mpOnlyGames, endlessGames];
  }

  function generateLists(params: { allGames: BlaeoGamesJson; games: BlaeoGamesJson; mpOnlyGames: BlaeoGamesJson; endlessGames: BlaeoGamesJson }) {
    let steamIdGames = reformatBlaeoGameListToSteamIdColumn(params.allGames);

    if (mode === "update") {
      for (let list of listArray) {
        if (list.oldList) {
          list.games = list.oldList.games.map((game: BlaeoListGameEntry) => {
            return steamIdGames[game.steam_id].id;
          });
        }
      }

      if (mpOnlyBehavior === "separate" && mpOnlyListArray.oldList) {
        mpOnlyListArray.games = mpOnlyListArray.oldList.games.map((game: BlaeoListGameEntry) => {
          return steamIdGames[game.steam_id].id;
        });
      }

      if (endlessBehavior === "separate" && endlessListArray.oldList) {
        endlessListArray.games = endlessListArray.oldList.games.map((game: BlaeoListGameEntry) => {
          return steamIdGames[game.steam_id].id;
        });
      }
    }

    if (params.mpOnlyGames) {
      for (let game of params.mpOnlyGames) {
        mpOnlyListArray.games.push(game.id);

        if (mode === "update" || (mode === "overwrite" && !mpOnlyListArray.oldList?.games.find((listGame) => listGame.steam_id === game.steam_id))) {
          mpOnlyListArray.newGames.push(game);
        }
      }
    }

    if (params.endlessGames) {
      for (let game of params.endlessGames) {
        endlessListArray.games.push(game.id);

        if (mode === "update" || (mode === "overwrite" && !endlessListArray.oldList?.games.find((listGame) => listGame.steam_id === game.steam_id))) {
          endlessListArray.newGames.push(game);
        }
      }
    }

    for (let game of params.games) {
      // Handle MP-only games if mpOnlyBehavior is set to "separate" or "exclude"
      if (mpOnlyBehavior === "separate" && !hltbData[game.steam_id]?.type.includes("sp") && (hltbData[game.steam_id]?.type.includes("mp") || hltbData[game.steam_id]?.type.includes("coop"))) {
        mpOnlyListArray.games.push(game.id);
        if (mode === "update" || (mode === "overwrite" && !mpOnlyListArray.oldList?.games.find((listGame) => listGame.steam_id === game.steam_id))) {
          mpOnlyListArray.newGames.push(game);
        }
      }

      if (mpOnlyBehavior === "exclude" && !hltbData[game.steam_id]?.type.includes("sp") && (hltbData[game.steam_id]?.type.includes("mp") || hltbData[game.steam_id]?.type.includes("coop"))) {
        continue;
      }

      // Handle endless games
      if (hltbData[game.steam_id]?.endless) {
        if (endlessBehavior === "separate") {
          endlessListArray.games.push(game.id);
          if (mode === "update" || (mode === "overwrite" && !endlessListArray.oldList?.games.find((listGame) => listGame.steam_id === game.steam_id))) {
            endlessListArray.newGames.push(game);
          }
        }
        continue;
      }

      let selectedList;

      for (let list of listArray) {
        // Handle MP-only games if mpOnlyBehavior is set to "normal"
        if (mpOnlyBehavior === "normal" && !hltbData[game.steam_id]?.type.includes("sp") && (hltbData[game.steam_id]?.type.includes("mp") || hltbData[game.steam_id]?.type.includes("coop"))) {
          if (hltbData[game.steam_id]?.coop) {
            if ((hltbData[game.steam_id]?.coop ?? 0) >= +list.playtime * 3600) {
              selectedList = list;
            } else {
              break;
            }
          } else if (hltbData[game.steam_id]?.mp) {
            if ((hltbData[game.steam_id]?.mp ?? 0) >= +list.playtime * 3600) {
              selectedList = list;
            } else {
              break;
            }
          }
        }

        // Handle remaining games
        if (hltbData[game.steam_id][listBy]) {
          if ((hltbData[game.steam_id][listBy] ?? 0) >= +list.playtime * 3600) {
            selectedList = list;
          } else {
            break;
          }
        } else if (hltbData[game.steam_id]?.avgComp >= +list.playtime * 3600) {
          selectedList = list;
        } else {
          break;
        }
      }

      if (!selectedList) {
        continue;
      }

      selectedList.games.push(steamIdGames[game.steam_id].id);
      if (mode === "update" || (mode === "overwrite" && !selectedList.oldList?.games.find((listGame) => listGame.steam_id === game.steam_id))) {
        selectedList.newGames.push(game);
      }
    }

    let blaeoIdGames = reformatBlaeoGameListToBlaeoIdColumn(params.allGames);

    listArray = listArray.map((list) => {
      list.games = list.games.map((game: string) => blaeoIdGames[game]);
      return list;
    });

    mpOnlyListArray.games = mpOnlyListArray.games.map((game: string | number) => blaeoIdGames[game as number]);
    endlessListArray.games = endlessListArray.games.map((game: string | number) => blaeoIdGames[game as number]);

    console.log("Generated list array", listArray);
    console.log("Generated MP-only list", mpOnlyList);
    console.log("Generated endless list", endlessList);
    console.log("New MP-only games", mpOnlyListArray.newGames);
    console.log("New endless games", endlessListArray.newGames);

    return;
  }

  function sortGames(games: BlaeoGamesJson) {
    switch (sortBy) {
      case "name":
        games.forEach((game: { name: any }, index: number) => {
          games[index].value = game.name;
        });

        break;
      case "playtime":
        games.forEach((game: { playtime: any }, index: number) => {
          games[index].value = game.playtime;
        });

        break;
      case "hltb-main":
        for (let game of games) {
          game.value = hltbData[game.steam_id].main;
        }
        break;
      case "hltb-extra":
        for (let game of games) {
          game.value = hltbData[game.steam_id].extra;
        }
        break;
      case "hltb-100":
        for (let game of games) {
          game.value = hltbData[game.steam_id].everything;
        }
        break;
    }

    switch (sortBy) {
      case "name":
        if (sortByOrder === "asc") {
          games = games.sort((a, b) => a.value.localeCompare(b.value));
        } else {
          games = games.sort((a, b) => b.value.localeCompare(a.value));
        }
        break;
      default:
        if (sortByOrder === "asc") {
          games = games.sort((a, b) => a.value - b.value);
        } else {
          games = games.sort((a, b) => b.value - a.value);
        }
    }

    return games;
  }

  async function createPreview() {
    status = "generating";
    getUserName();
    allGames = await getUserGames(userData.name);
    filteredGames = [];
    gamesWithNoHltbData = [];
    oldMpOnlyList = {} as BlaeoListJson;
    oldEndlessList = {} as BlaeoListJson;

    for (let list of listArray) {
      list.games = [];
      list.newGames = [];
      list.oldList = null;
    }

    mpOnlyListArray.games = [];
    mpOnlyListArray.newGames = [];
    mpOnlyListArray.oldList = null;

    endlessListArray.games = [];
    endlessListArray.newGames = [];
    endlessListArray.oldList = null;

    [filteredGames, gamesWithNoHltbData, mpOnlyGames, endlessGames] = await filterGames(allGames);

    generateLists({ allGames, games: filteredGames, mpOnlyGames, endlessGames });

    if (sortWholeList) {
      for (let list of listArray) {
        list.games = sortGames(list.games);
      }

      mpOnlyListArray.games = sortGames(mpOnlyListArray.games);
      endlessListArray.games = sortGames(endlessListArray.games);
    }

    console.log("End list array", listArray);
    console.log("End MP-only list", mpOnlyListArray);
    console.log("End endless list", endlessListArray);

    status = "preview";
  }

  async function sendLists() {
    status = "sending";

    progress = 0;
    progressTotal = listArray.length;

    if (mpOnlyBehavior === "separate" && mpOnlyList?.[0]) {
      progressTotal++;
    }

    if (endlessBehavior === "separate" && endlessList?.[0] && mpOnlyList[0].value !== endlessList[0].value) {
      progressTotal++;
    }

    for (let list of listArray) {
      $listBackupStore.push({
        id: list.tagId[0].value,
        name: list.tagId[0].label,
        color: list.oldList?.color ?? "",
        date: new Date().toLocaleString(),
        dateIso: new Date().toISOString(),
        games: list.oldList?.games ?? [],
      });

      await setList(
        list.tagId[0].value,
        list.games.map((game) => game.id),
      );

      progress++;
    }

    if (mpOnlyBehavior === "separate" && mpOnlyList?.[0]) {
      $listBackupStore.push({
        id: mpOnlyList[0].value,
        name: mpOnlyList[0].label,
        color: oldMpOnlyList?.color ?? "",
        date: new Date().toLocaleString(),
        dateIso: new Date().toISOString(),
        games: oldMpOnlyList?.games ?? [],
      });

      await setList(
        mpOnlyList[0].value,
        mpOnlyListArray.games.map((game) => game.id),
      );

      progress++;
    }

    if (endlessBehavior === "separate" && endlessList?.[0] && mpOnlyList[0].value !== endlessList[0].value) {
      $listBackupStore.push({
        id: endlessList[0].value,
        name: endlessList[0].label,
        color: oldEndlessList?.color ?? "",
        date: new Date().toLocaleString(),
        dateIso: new Date().toISOString(),
        games: oldEndlessList?.games ?? [],
      });

      await setList(
        endlessList[0].value,
        endlessListArray.games.map((game) => game.id),
      );

      progress++;
    }

    $listBackupStore = $listBackupStore;

    status = "done";
  }

  let listArray = [] as AutomaticHltbTagInfo[];
  let mpOnlyListArray = { playtime: "", tagId: [] as any, games: [], newGames: [], oldList: null } as AutomaticHltbTagInfo;
  let endlessListArray = { playtime: "", tagId: [] as any, games: [], newGames: [], oldList: null } as AutomaticHltbTagInfo;
</script>

<button class="bp-automatic-list btn btn-default" on:click={() => (showModal = true)}>Add games by HLTB times</button>

<div class="bp-automatic-list-modal" role="presentation" class:visible={showModal === true}>
  <div class="modal-content">
    <div class="modal-header">
      <h2 class="modal-header-heading">Adding games to lists by HLTB times</h2>
    </div>
    <div class="modal-body">
      {#if status === "setup"}
        <h3>Lists</h3>
        {#each listArray as list, index}
          <h4>List {index + 1}</h4>
          <div class="tag-wrapper">
            <input class="tag-playtime form-control" type="number" bind:value={list.playtime} name="" id="" placeholder="Min. hours to beat" />
            <MultiSelect bind:selected={list.tagId} options={formattedLists} outerDivClass="form-control" placeholder={"Don't add game to list"} selectedOptionsDraggable={false} maxSelect={1}>
              <div let:option slot="option" class="" style:border-left={`7px solid ${option.color}`}>
                {option.label}
              </div>
            </MultiSelect>
            <button class="btn btn-danger btn-sm" on:click={() => removeList(index)}>Remove list</button>
          </div>
        {/each}

        <button class="btn btn-success btn-sm" on:click={addList}>Add list</button>

        <div class="row">
          <div class="col-sm-6">
            <h3>MP-only games</h3>
            <select id="bp-automatic-hltb-list-sortby" class="form-control" bind:value={mpOnlyBehavior}>
              <option value="exclude">Exclude from being added to any list</option>
              <option value="separate">Add to a specific list</option>
              <option value="normal">Add to lists by HLTB time to beat</option>
            </select>
            {#if mpOnlyBehavior === "separate"}
              <div class="tag-wrapper">
                <MultiSelect bind:selected={mpOnlyList} options={formattedLists} outerDivClass="form-control" placeholder={"MP-only game list"} selectedOptionsDraggable={false} maxSelect={1}>
                  <div let:option slot="option" class="" style:border-left={`7px solid ${option.color}`}>
                    {option.label}
                  </div>
                </MultiSelect>
              </div>
            {/if}
          </div>
          <div class="col-sm-6">
            <h3>Endless games</h3>
            <select id="bp-automatic-hltb-list-sortby" class="form-control" bind:value={endlessBehavior}>
              <option value="exclude">Exclude from being added to any list</option>
              <option value="separate">Add to a specific list</option>
            </select>
            {#if endlessBehavior === "separate"}
              <div class="tag-wrapper">
                <MultiSelect bind:selected={endlessList} options={formattedLists} outerDivClass="form-control" placeholder={"Endless game list"} selectedOptionsDraggable={false} maxSelect={1}>
                  <div let:option slot="option" class="" style:border-left={`7px solid ${option.color}`}>
                    {option.label}
                  </div>
                </MultiSelect>
              </div>
            {/if}
          </div>
        </div>

        <h3 class="list-progress-heading">Filter games by progress</h3>

        <div class="list-progress">
          <button class="progress-bar game-wont-play" class:disabled={!progresses["wont play"]} title="won't play" on:click={() => toggleProgress("wont play")}> won't play </button>
          <button class="progress-bar game-never-played" class:disabled={!progresses["never played"]} title="never played" on:click={() => toggleProgress("never played")}> never played </button>
          <button class="progress-bar game-unfinished" class:disabled={!progresses["unfinished"]} title="unfinished" on:click={() => toggleProgress("unfinished")}> unfinished </button>
          <button class="progress-bar game-beaten" class:disabled={!progresses["beaten"]} title="beaten" on:click={() => toggleProgress("beaten")}> beaten </button>
          <button class="progress-bar game-completed" class:disabled={!progresses["completed"]} title="completed" on:click={() => toggleProgress("completed")}> completed </button>
          <button class="progress-bar game-uncategorized" class:disabled={!progresses["uncategorized"]} title="uncategorized" on:click={() => toggleProgress("uncategorized")}> uncategorized </button>
        </div>

        <h3 class="no-margin-top">Mode</h3>
        <div class="btn-group">
          <button class="btn" class:btn-primary={mode === "update"} class:btn-default={mode !== "update"} on:click={() => (mode = "update")} type="button">Update</button>
          <button class="btn" class:btn-primary={mode === "overwrite"} class:btn-default={mode !== "overwrite"} on:click={() => (mode = "overwrite")} type="button">Overwrite</button>
        </div>
        <div class="mode-desc" hidden={mode != "update"}>Games that aren't in any of the selected lists will be added to one accordingly to the settings. Any other games will remain where they are.</div>
        <div class="mode-desc" hidden={mode != "overwrite"}>All selected lists will be recreated from scratch accordingly to the settings.</div>

        <div class="row">
          <div class="col-sm-6">
            <h3>List by:</h3>
            <select id="bp-automatic-hltb-list-by" class="form-control" bind:value={listBy}>
              <option value="main">Main time to beat</option>
              <option value="extra">+Extra time to beat</option>
              <option value="everything">100% time to beat</option>
            </select>
          </div>
          <div class="col-sm-6">
            <h3>Sort</h3>
            <div class="toggle-item">
              <Toggle bind:checked={sortWholeList} />
              Sort list?
            </div>
            {#if sortWholeList}
              <div>
                <label for="bp-automatic-hltb-list-sortby">Sort by:</label>
                <select id="bp-automatic-hltb-list-sortby" class="form-control" bind:value={sortBy}>
                  <option value="name">Game name</option>
                  <option value="playtime">Playtime</option>
                  {#if $optionsStore.modules.games.hltbIntegration.enabled}
                    <option value="hltb-main">Main time to beat</option>
                    <option value="hltb-extra">+Extra time to beat</option>
                    <option value="hltb-100">100% time to beat</option>
                  {/if}
                </select>
                <label for="bp-quick-rearrange-order">Order:</label>
                <select class="form-control" id="bp-quick-rearrange-order" bind:value={sortByOrder}>
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            {/if}
          </div>
        </div>
      {/if}

      {#if status === "generating"}
        <p>Generating lists for preview...</p>
      {/if}

      {#if status === "preview"}
        <h3>List preview</h3>
        <p>Click "Submit" to update lists on BLAEO.</p>
        <Tabs
          tabs={[
            ...listArray.map((list) => {
              return { name: list.tagId[0].label, content: ListPreview, props: { list } };
            }),
            mpOnlyBehavior === "separate" && mpOnlyListArray.oldList ? { name: mpOnlyListArray.oldList.name, content: ListPreview, props: { list: mpOnlyListArray } } : null,
            endlessBehavior === "separate" && endlessListArray.oldList && mpOnlyList?.[0].value !== endlessList?.[0].value ? { name: endlessListArray.oldList.name, content: ListPreview, props: { list: endlessListArray } } : null,
          ]}
          bind:activeTab
        />
      {/if}

      {#if status === "sending"}
        <p>Sending lists to BLAEO...</p>
        <div class="progress">
          <div class="progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax={progressTotal} style="width: {(progress / progressTotal) * 100}%">
            {progress} / {progressTotal}
          </div>
        </div>
      {/if}

      {#if status === "done"}
        <h3>Success!</h3>
        <p>Done! Your lists have been updated. You can close this modal.</p>
      {/if}

      {#if status === "error"}
        <h3>Error</h3>
        <p>An error occured. If this problem continues, please report this issue on BLAEO+'s group thread and share the error stack below.</p>
        <p>Error stack:</p>
        <pre><code>${error}</code></pre>
      {/if}
    </div>
    <div class="modal-footer">
      {#if ["setup", "error", "done"].includes(status)}
        <button type="button" class="btn btn-default" on:click={hideModal}>Close</button>
      {/if}
      {#if status === "setup"}
        <button type="button" class="btn btn-primary" on:click={createPreview}>Preview</button>
      {/if}
      {#if status === "preview"}
        <button type="button" class="btn btn-default" on:click={cancelPreview}>Back</button>
        <button type="button" class="btn btn-primary" on:click={sendLists}>Submit</button>
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  .bp-automatic-list {
    margin-bottom: 20px;
  }

  .btn-group {
    width: 100%;
    margin-bottom: 8px;
  }

  .mode-desc {
    margin-bottom: 20px;
  }

  .row {
    margin-top: 8px;
    margin-bottom: 8px;
  }

  select {
    margin-bottom: 10px;
  }

  .progress-bar {
    appearance: none;
    border: none;
    padding-right: 0;
    flex-grow: 1;
    color: #fff;

    &.game-uncategorized,
    &.game-never-played {
      color: #555;
    }

    &.disabled {
      opacity: 0.5;
    }

    &::before {
      content: "✓";
      margin-right: 4px;
    }

    &.disabled::before {
      content: "X";
    }
  }

  .bp-automatic-list-modal {
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
    align-items: flex-start;
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
      max-width: 800px;
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

      h3:first-child {
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

  .toggle-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    label {
      display: inline;
      margin-bottom: 0;
      margin-left: 10px;
      font-weight: 400;
    }

    :global(.svelte-toggle) {
      margin-right: 8px;
    }

    :global(.svelte-toggle.svelte-toggle--checked .svelte-toggle--track) {
      background-color: #7a87ba;
    }

    :global(.svelte-toggle.svelte-toggle--checked:hover .svelte-toggle--track) {
      background-color: #4c5a83 !important;
    }

    :global(.svelte-toggle .svelte-toggle--thumb) {
      border-color: #4c5a83 !important;
    }
  }

  .tag-wrapper {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    gap: 8px;
  }

  .tag-playtime {
    width: 200px;
    flex-grow: 1;
  }

  .no-margin-top {
    margin-top: 0;
  }

  :global(.bp-automatic-list-modal .modal-body div.multiselect) {
    width: 50%;
    min-width: 150px;
    flex-grow: 1;

    > :global(ul.options) {
      max-height: 300px;

      > :global(li) {
        padding: 0 !important;

        > :global(div) {
          padding: 6px 8px;
        }
      }
    }
  }
</style>
