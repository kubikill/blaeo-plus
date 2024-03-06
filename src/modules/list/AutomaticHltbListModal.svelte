<script lang="ts">
  import { MultiSelect } from "svelte-multiselect";
  import Toggle from "svelte-switcher";
  import Tabs from "@/lib/Tabs.svelte";
  import { automaticHltbPresetsStore, listBackupStore, optionsStore } from "@/lib/store";
  import { getList, setList } from "@/lib/listService";
  import { SUPPORT_URL, getUserGames, getUserName, userData } from "@/globals";
  import { hltbData } from "@/lib/hltbService";
  import { reformatBlaeoGameListToBlaeoIdColumn, reformatBlaeoGameListToSteamIdColumn } from "@/lib/utilities";
  import ListPreview from "./ListPreview.svelte";
  import { tick } from "svelte";

  let progresses = {
    "wont play": true,
    "never played": true,
    unfinished: true,
    beaten: true,
    completed: true,
    uncategorized: true,
  };

  let error = {
    status: "",
    statusText: "",
    responseText: "",
    error: "",
  };
  let status = "setup";
  let showModal = false;
  let mode = "update";
  let sortWholeList = false;
  let listBy: "main" | "extra" | "everything" = "main";
  let sortBy = "name";
  let sortByOrder = "asc";
  let mpOnlyBehavior = "exclude";
  let endlessBehavior = "exclude";
  let gamesWithoutHltbBehavior = "exclude";
  let gamesWithoutHltbReportThreshold = "1";
  let mpOnlyList: { label: any; value: any; color: any }[] = [];
  let endlessList: { label: any; value: any; color: any }[] = [];
  let gamesWithoutHltbList: { label: any; value: any; color: any }[] = [];
  let lists = [] as { id: string; name: string; color: string }[];
  let activeTab = 0;
  let progress = 0;
  let progressTotal = 0;

  let savingPreset = "idle";
  let newPresetName = "";
  let presetInput: HTMLInputElement;

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
    setTimeout(() => {
      status = "setup";
    }, 400);
  }

  function cancelPreview() {
    status = "setup";
  }

  function addList() {
    listArray.push({ playtime: "", maxPlaytime: "", tagId: [] as any, games: [], newGames: [], oldList: null });
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
  let mpOnlyGames = [] as BlaeoGamesJson;
  let endlessGames = [] as BlaeoGamesJson;
  let gamesWithoutHltb = [] as BlaeoGamesJson;
  let oldMpOnlyList = {} as BlaeoListJson;
  let oldEndlessList = {} as BlaeoListJson;
  let oldGamesWithoutHltbList = {} as BlaeoListJson;

  async function filterGames(games: BlaeoGamesJson): Promise<[BlaeoGamesJson, BlaeoGamesJson, BlaeoGamesJson, BlaeoGamesJson]> {
    let mpOnlyGames = [] as BlaeoGamesJson;
    let endlessGames = [] as BlaeoGamesJson;
    let gamesWithoutHltb = [] as BlaeoGamesJson;

    for (let list of listArray) {
      if (list.tagId.length > 0) {
        try {
          list.oldList = await getList(list.tagId[0].value);
        } catch (requestError: any) {
          console.error(requestError);
          error.status = requestError.status ?? "";
          error.statusText = requestError.statusText ?? "";
          error.responseText = requestError.responseText ?? "";
          error.error = requestError;
          status = "error";
          throw new Error();
        }
      }
    }

    if (mpOnlyBehavior === "separate" && mpOnlyList?.[0]) {
      try {
        mpOnlyListArray.oldList = await getList(mpOnlyList[0].value);
      } catch (requestError: any) {
        console.error(requestError);
        error.status = requestError.status ?? "";
        error.statusText = requestError.statusText ?? "";
        error.responseText = requestError.responseText ?? "";
        error.error = requestError;
        status = "error";
        throw new Error();
      }
    }

    if (endlessBehavior === "separate" && endlessList?.[0] && (!mpOnlyList[0] || mpOnlyList[0].value !== endlessList[0].value)) {
      try {
        endlessListArray.oldList = await getList(endlessList[0].value);
      } catch (requestError: any) {
        console.error(requestError);
        error.status = requestError.status ?? "";
        error.statusText = requestError.statusText ?? "";
        error.responseText = requestError.responseText ?? "";
        error.error = requestError;
        status = "error";
        throw new Error();
      }
    }

    if (gamesWithoutHltbBehavior === "separate" && gamesWithoutHltbList?.[0]) {
      try {
        gamesWithoutHltbListArray.oldList = await getList(gamesWithoutHltbList[0].value);
      } catch (requestError: any) {
        console.error(requestError);
        error.status = requestError.status ?? "";
        error.statusText = requestError.statusText ?? "";
        error.responseText = requestError.responseText ?? "";
        error.error = requestError;
        status = "error";
        throw new Error();
      }
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

      if (hltbData[game.steam_id]?.endless) {
        if (endlessBehavior === "separate") {
          endlessGames.push(game);
        }
        return false;
      }

      if (gamesWithoutHltbBehavior != "allplaystyles" && (hltbData[game.steam_id]?.[`${listBy}Count`] || 0) < +gamesWithoutHltbReportThreshold) {
        gamesWithoutHltb.push(game);
        return false;
      }

      return true;
    });

    console.log("Filtered games", filteredGames);

    return [filteredGames, mpOnlyGames, endlessGames, gamesWithoutHltb];
  }

  function generateLists(params: { allGames: BlaeoGamesJson; games: BlaeoGamesJson; mpOnlyGames: BlaeoGamesJson; endlessGames: BlaeoGamesJson; gamesWithoutHltb: BlaeoGamesJson }) {
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

      if (gamesWithoutHltbBehavior === "separate" && gamesWithoutHltbListArray.oldList) {
        gamesWithoutHltbListArray.games = gamesWithoutHltbListArray.oldList.games.map((game: BlaeoListGameEntry) => {
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

    if (params.gamesWithoutHltb) {
      for (let game of params.gamesWithoutHltb) {
        gamesWithoutHltbListArray.games.push(game.id);

        if (mode === "update" || (mode === "overwrite" && !gamesWithoutHltbListArray.oldList?.games.find((listGame) => listGame.steam_id === game.steam_id))) {
          gamesWithoutHltbListArray.newGames.push(game);
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
        if (!list.playtime) {
          list.playtime = 0;
        }
        if (!list.maxPlaytime) {
          list.maxPlaytime = Infinity;
        }

        // Handle games
        if (hltbData[game.steam_id]?.[listBy]) {
          if ((hltbData[game.steam_id][listBy] ?? 0) >= +list.playtime * 3600 && (hltbData[game.steam_id][listBy] ?? 0) <= +list.maxPlaytime * 3600) {
            selectedList = list;
          }
        }

        // Handle MP-only games if mpOnlyBehavior is set to "normal"
        if (mpOnlyBehavior === "normal" && !hltbData[game.steam_id]?.type.includes("sp") && (hltbData[game.steam_id]?.type.includes("mp") || hltbData[game.steam_id]?.type.includes("coop"))) {
          if (hltbData[game.steam_id]?.coop) {
            if ((hltbData[game.steam_id]?.coop ?? 0) >= +list.playtime * 3600 && (hltbData[game.steam_id]?.coop ?? 0) <= +list.maxPlaytime * 3600) {
              selectedList = list;
            }
          } else if (hltbData[game.steam_id]?.mp) {
            if ((hltbData[game.steam_id]?.mp ?? 0) >= +list.playtime * 3600 && (hltbData[game.steam_id]?.mp ?? 0) <= +list.maxPlaytime * 3600) {
              selectedList = list;
            }
          }
        }

        // Handle games without enough HLTB reports

        if (gamesWithoutHltbBehavior === "allplaystyles" && (hltbData?.[game.steam_id] || (hltbData[game.steam_id]?.[`${listBy}Count`] || 0) < +gamesWithoutHltbReportThreshold)) {
          if (!hltbData[game.steam_id] || (hltbData[game.steam_id].avgComp >= +list.playtime * 3600 && (hltbData[game.steam_id].avgComp ?? 0) <= +list.maxPlaytime * 3600)) {
            selectedList = list;
          }
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
    gamesWithoutHltbListArray.games = gamesWithoutHltbListArray.games.map((game: string | number) => blaeoIdGames[game as number]);

    console.log("Generated list array", listArray);
    console.log("Generated MP-only list", mpOnlyList);
    console.log("Generated endless list", endlessList);
    console.log("Generated games without HLTB list", gamesWithoutHltbList);
    console.log("New MP-only games", mpOnlyListArray.newGames);
    console.log("New endless games", endlessListArray.newGames);
    console.log("New games without HLTB", gamesWithoutHltbListArray.newGames);

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
          game.value = hltbData[game.steam_id]?.main || 0;
        }
        break;
      case "hltb-extra":
        for (let game of games) {
          game.value = hltbData[game.steam_id]?.extra || 0;
        }
        break;
      case "hltb-100":
        for (let game of games) {
          game.value = hltbData[game.steam_id]?.everything || 0;
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
    try {
      allGames = await getUserGames(userData.name);
    } catch (requestError: any) {
      console.error(requestError);
      error.status = requestError.status ?? "";
      error.statusText = requestError.statusText ?? "";
      error.responseText = requestError.responseText ?? "";
      error.error = requestError;
      status = "error";
      return;
    }
    filteredGames = [];
    oldMpOnlyList = {} as BlaeoListJson;
    oldEndlessList = {} as BlaeoListJson;
    oldGamesWithoutHltbList = {} as BlaeoListJson;

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

    gamesWithoutHltbListArray.games = [];
    gamesWithoutHltbListArray.newGames = [];
    gamesWithoutHltbListArray.oldList = null;

    [filteredGames, mpOnlyGames, endlessGames, gamesWithoutHltb] = await filterGames(allGames);

    generateLists({ allGames, games: filteredGames, mpOnlyGames, endlessGames, gamesWithoutHltb });

    if (sortWholeList) {
      for (let list of listArray) {
        list.games = sortGames(list.games);
      }

      mpOnlyListArray.games = sortGames(mpOnlyListArray.games);
      endlessListArray.games = sortGames(endlessListArray.games);
      gamesWithoutHltbListArray.games = sortGames(gamesWithoutHltbListArray.games);
    }

    console.log("End list array", listArray);
    console.log("End MP-only list", mpOnlyListArray);
    console.log("End endless list", endlessListArray);
    console.log("End games without HLTB list", gamesWithoutHltbListArray);

    status = "preview";
  }

  async function sendLists() {
    status = "sending";

    progress = 0;
    progressTotal = listArray.length;

    if (mpOnlyBehavior === "separate" && mpOnlyList?.[0]) {
      progressTotal++;
    }

    if (endlessBehavior === "separate" && endlessList?.[0] && (!mpOnlyList?.[0] || mpOnlyList[0].value !== endlessList[0].value)) {
      progressTotal++;
    }

    for (let list of listArray) {
      if (list.tagId?.[0]) {
        $listBackupStore.push({
          id: list.tagId[0].value,
          name: list.tagId[0].label,
          color: list.oldList?.color ?? "",
          date: new Date().toLocaleString(),
          dateIso: new Date().toISOString(),
          games: list.oldList?.games ?? [],
        });

        currentSubimittingList = list;

        submittingTakesTooLongTimeout = setTimeout(() => {
          submittingTakesTooLong = true;
        }, 8000);

        await trySetList(
          list.tagId[0].value,
          list.games.map((game) => game.id),
        );

        clearTimeout(submittingTakesTooLongTimeout);
        submittingTakesTooLong = false;
      }

      progress++;

      if (status === "error") {
        $listBackupStore = $listBackupStore;
        return;
      }
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

      currentSubimittingList = mpOnlyListArray;

      submittingTakesTooLongTimeout = setTimeout(() => {
        submittingTakesTooLong = true;
      }, 8000);

      await trySetList(
        mpOnlyList[0].value,
        mpOnlyListArray.games.map((game) => game.id),
      );

      clearTimeout(submittingTakesTooLongTimeout);
      submittingTakesTooLong = false;

      progress++;

      if (status === "error") {
        $listBackupStore = $listBackupStore;
        return;
      }
    }

    if (endlessBehavior === "separate" && endlessList?.[0] && (!mpOnlyList[0] || mpOnlyList[0].value !== endlessList[0].value)) {
      $listBackupStore.push({
        id: endlessList[0].value,
        name: endlessList[0].label,
        color: oldEndlessList?.color ?? "",
        date: new Date().toLocaleString(),
        dateIso: new Date().toISOString(),
        games: oldEndlessList?.games ?? [],
      });

      currentSubimittingList = endlessListArray;

      submittingTakesTooLongTimeout = setTimeout(() => {
        submittingTakesTooLong = true;
      }, 8000);

      await trySetList(
        endlessList[0].value,
        endlessListArray.games.map((game) => game.id),
      );

      clearTimeout(submittingTakesTooLongTimeout);
      submittingTakesTooLong = false;

      progress++;

      if (status === "error") {
        $listBackupStore = $listBackupStore;
        return;
      }
    }

    if (gamesWithoutHltbBehavior === "separate" && gamesWithoutHltbList?.[0]) {
      $listBackupStore.push({
        id: gamesWithoutHltbList[0].value,
        name: gamesWithoutHltbList[0].label,
        color: gamesWithoutHltbListArray.oldList?.color ?? "",
        date: new Date().toLocaleString(),
        dateIso: new Date().toISOString(),
        games: gamesWithoutHltbListArray.oldList?.games ?? [],
      });

      currentSubimittingList = gamesWithoutHltbListArray;

      submittingTakesTooLongTimeout = setTimeout(() => {
        submittingTakesTooLong = true;
      }, 8000);

      await trySetList(
        gamesWithoutHltbList[0].value,
        gamesWithoutHltbListArray.games.map((game) => game.id),
      );

      clearTimeout(submittingTakesTooLongTimeout);
      submittingTakesTooLong = false;

      progress++;

      if (status === "error") {
        $listBackupStore = $listBackupStore;
        return;
      }
    }

    $listBackupStore = $listBackupStore;

    status = "done";
  }

  async function trySetList(listId: string, games: string[]) {
    return new Promise(async (resolve, reject) => {
      try {
        await setList(listId, games);
        resolve(true);
      } catch (requestError: any) {
        console.error(requestError);
        status = "error";
        error.status = requestError.status ?? "";
        error.statusText = requestError.statusText ?? "";
        error.responseText = requestError.responseText ?? "";
        error.error = requestError;
        reject(false);
      }
    });
  }

  function savePreset(presetIndex: number | null = null) {
    if (!newPresetName) {
      newPresetName = `Preset ${$automaticHltbPresetsStore.length + 1}`;
    }

    const newPreset = {
      name: "",
      mode,
      progresses,
      sortWholeList,
      listBy,
      sortBy,
      sortByOrder,
      mpOnlyBehavior,
      endlessBehavior,
      gamesWithoutHltbBehavior,
      gamesWithoutHltbReportThreshold,
      mpOnlyList,
      endlessList,
      gamesWithoutHltbList,
      listArray,
      mpOnlyListArray,
      endlessListArray,
      gamesWithoutHltbListArray,
    };

    if (presetIndex != null) {
      newPreset.name = $automaticHltbPresetsStore[presetIndex].name;
      $automaticHltbPresetsStore[presetIndex] = structuredClone(newPreset);
    } else {
      newPreset.name = newPresetName;
      $automaticHltbPresetsStore.push(structuredClone(newPreset));
    }

    $automaticHltbPresetsStore = $automaticHltbPresetsStore;

    newPresetName = "";
    savingPreset = "idle";

    cancelPresetOverwrite();

    savePresetSuccess = true;

    setTimeout(() => {
      savePresetSuccess = false;
    }, 3000);
  }

  function loadPreset(presetIndex: number) {
    const preset = structuredClone($automaticHltbPresetsStore[presetIndex]);

    mode = preset.mode;
    progresses = preset.progresses as any;
    sortWholeList = preset.sortWholeList;
    listBy = preset.listBy;
    sortBy = preset.sortBy;
    sortByOrder = preset.sortByOrder;
    mpOnlyBehavior = preset.mpOnlyBehavior;
    endlessBehavior = preset.endlessBehavior;
    gamesWithoutHltbBehavior = preset.gamesWithoutHltbBehavior;
    gamesWithoutHltbReportThreshold = preset.gamesWithoutHltbReportThreshold;
    mpOnlyList = preset.mpOnlyList;
    endlessList = preset.endlessList;
    gamesWithoutHltbList = preset.gamesWithoutHltbList;
    listArray = preset.listArray;
    mpOnlyListArray = preset.mpOnlyListArray;
    endlessListArray = preset.endlessListArray;
    gamesWithoutHltbListArray = preset.gamesWithoutHltbListArray;

    for (let list of listArray) {
      const foundList = formattedLists.find((formattedList) => formattedList.value === list.tagId[0]?.value);
      if (list.tagId.length <= 0 || !foundList) {
        list.tagId = [];
        continue;
      }

      if (list.tagId.length > 0 && list.tagId[0].label !== foundList.label) {
        list.tagId[0].label = foundList.label;
      }
    }

    if (mpOnlyList.length <= 0 || !formattedLists.find((formattedList) => formattedList.value === mpOnlyList[0].value)) {
      mpOnlyList = [];
    }

    if (endlessList.length <= 0 || !formattedLists.find((formattedList) => formattedList.value === endlessList[0].value)) {
      endlessList = [];
    }

    if (gamesWithoutHltbList.length <= 0 || !formattedLists.find((formattedList) => formattedList.value === gamesWithoutHltbList[0].value)) {
      gamesWithoutHltbList = [];
    }

    loadPresetSuccess = true;

    setTimeout(() => {
      loadPresetSuccess = false;
    }, 3000);
  }

  function deletePreset(presetIndex: number) {
    $automaticHltbPresetsStore.splice(presetIndex, 1);
    $automaticHltbPresetsStore = $automaticHltbPresetsStore;

    deletePresetSuccess = true;

    setTimeout(() => {
      deletePresetSuccess = false;
    }, 3000);
  }

  function confirmPresetOverwrite(index: number) {
    presetBeingOverwritten = index;
    presetBeingOverwrittenName = $automaticHltbPresetsStore[index].name;

    overwritePresetConfirm = true;
  }

  function cancelPresetOverwrite() {
    presetBeingOverwritten = -1;
    presetBeingOverwrittenName = "";

    overwritePresetConfirm = false;
  }

  let currentSubimittingList = {} as AutomaticHltbTagInfo;
  let submittingTakesTooLongTimeout;
  let submittingTakesTooLong = false;

  let listArray = [] as AutomaticHltbTagInfo[];
  let mpOnlyListArray = { playtime: "", maxPlaytime: "", tagId: [] as any, games: [], newGames: [], oldList: null } as AutomaticHltbTagInfo;
  let endlessListArray = { playtime: "", maxPlaytime: "", tagId: [] as any, games: [], newGames: [], oldList: null } as AutomaticHltbTagInfo;
  let gamesWithoutHltbListArray = { playtime: "", maxPlaytime: "", tagId: [] as any, games: [], newGames: [], oldList: null } as AutomaticHltbTagInfo;

  let savePresetSuccess = false;
  let loadPresetSuccess = false;
  let overwritePresetConfirm = false;
  let deletePresetSuccess = false;

  let presetBeingOverwritten = -1;
  let presetBeingOverwrittenName = "";
</script>

<button class="bp-automatic-list btn btn-default" on:click={() => (showModal = true)}>HLTB list maker</button>

<div class="bp-automatic-list-modal" role="presentation" class:visible={showModal === true}>
  <div class="modal-content">
    <div class="modal-header">
      <h2 class="modal-header-heading">HLTB list maker</h2>
    </div>
    <div class="modal-body">
      {#if status === "setup"}
        <p>This will allow you to automatically add games to selected lists according to HLTB time to beat.</p>
        <h3>Lists</h3>
        <p>
          Select lists to which games should be added, as well as time to beat thresholds.<br />
          If the game matches multiple lists, it will be added only to the last one that matches.
        </p>
        <div class="markdown">
          <table>
            <tbody>
              {#each listArray as list, index}
                <tr>
                  <td>{index + 1}</td>
                  <td>
                    <div class="tag-wrapper">
                      <input class="tag-playtime form-control" type="number" min="0" bind:value={list.playtime} name="" id="" placeholder="Min hours to beat (default 0)" />
                      <input class="tag-playtime form-control" type="number" min="0" bind:value={list.maxPlaytime} name="" id="" placeholder="Max hours to beat (default no limit)" />
                      <MultiSelect
                        bind:selected={list.tagId}
                        options={formattedLists}
                        outerDivClass="form-control"
                        placeholder={"Select a list (or keep empty to exclude this range from being added to any list)"}
                        selectedOptionsDraggable={false}
                        maxSelect={1}
                      >
                        <div let:option slot="option" class="" style:border-left={`7px solid ${option.color}`}>
                          {option.label}
                        </div>
                      </MultiSelect>
                      <button class="btn btn-danger btn-sm" on:click={() => removeList(index)}>Remove list</button>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <button class="btn btn-success btn-sm" on:click={addList}>Add list</button>

        <hr />

        <div class="row">
          <div class="col-sm-6">
            <h3>MP-only games</h3>
            <label for="bp-automatic-hltb-list-mp-only-games">What to do with MP-only games?</label>
            <select id="bp-automatic-hltb-list-mp-only-games" class="form-control" bind:value={mpOnlyBehavior}>
              <option value="exclude">Exclude from being added to any list</option>
              <option value="separate">Add to a specific list</option>
              <option value="normal">Use the MP/Co-op time to beat instead</option>
            </select>
            {#if mpOnlyBehavior === "separate"}
              <div class="tag-wrapper">
                <MultiSelect bind:selected={mpOnlyList} options={formattedLists} outerDivClass="form-control" placeholder={"Select a list"} selectedOptionsDraggable={false} maxSelect={1}>
                  <div let:option slot="option" class="" style:border-left={`7px solid ${option.color}`}>
                    {option.label}
                  </div>
                </MultiSelect>
              </div>
            {/if}
          </div>
          <div class="col-sm-6">
            <h3>Endless games</h3>
            <label for="bp-automatic-hltb-list-endless-games-behavior">What to do with endless games?</label>
            <select id="bp-automatic-hltb-list-endless-games-behavior" class="form-control" bind:value={endlessBehavior}>
              <option value="exclude">Exclude from being added to any list</option>
              <option value="separate">Add to a specific list</option>
            </select>
            {#if endlessBehavior === "separate"}
              <div class="tag-wrapper">
                <MultiSelect bind:selected={endlessList} options={formattedLists} outerDivClass="form-control" placeholder={"Select a list"} selectedOptionsDraggable={false} maxSelect={1}>
                  <div let:option slot="option" class="" style:border-left={`7px solid ${option.color}`}>
                    {option.label}
                  </div>
                </MultiSelect>
              </div>
            {/if}
          </div>
        </div>
        <div class="row">
          <div class="col-sm-6">
            <h3>Games without enough HLTB reports</h3>
            <label for="bp-automatic-hltb-list-games-without-hltb-data-behavior">What to do with games without enough HLTB reports?</label>
            <select id="bp-automatic-hltb-list-games-without-hltb-data-behavior" class="form-control" bind:value={gamesWithoutHltbBehavior}>
              <option value="exclude">Exclude from being added to any list</option>
              <option value="separate">Add to a specific list</option>
              <option value="allplaystyles">Use the all playstyles time to beat instead</option>
            </select>
            {#if gamesWithoutHltbBehavior === "separate"}
              <div class="tag-wrapper">
                <MultiSelect bind:selected={gamesWithoutHltbList} options={formattedLists} outerDivClass="form-control" placeholder={"Select a list"} selectedOptionsDraggable={false} maxSelect={1}>
                  <div let:option slot="option" class="" style:border-left={`7px solid ${option.color}`}>
                    {option.label}
                  </div>
                </MultiSelect>
              </div>
            {/if}
            <div class="tag-wrapper">
              <label for="bp-automatic-hltb-list-games-without-hltb-data-behavior">Amount of reports needed to be considered enough</label>
              <input class="tag-playtime form-control" type="number" min="0" bind:value={gamesWithoutHltbReportThreshold} name="" id="" placeholder="Amount of reports" />
            </div>
          </div>
        </div>

        <hr />

        <h3 class="list-progress-heading">Filter games by progress</h3>
        <p>Games with excluded progresses will not be added to any list.</p>
        <div class="list-progress">
          <button class="progress-bar game-wont-play" class:disabled={!progresses["wont play"]} title="won't play" on:click={() => toggleProgress("wont play")}> won't play </button>
          <button class="progress-bar game-never-played" class:disabled={!progresses["never played"]} title="never played" on:click={() => toggleProgress("never played")}> never played </button>
          <button class="progress-bar game-unfinished" class:disabled={!progresses["unfinished"]} title="unfinished" on:click={() => toggleProgress("unfinished")}> unfinished </button>
          <button class="progress-bar game-beaten" class:disabled={!progresses["beaten"]} title="beaten" on:click={() => toggleProgress("beaten")}> beaten </button>
          <button class="progress-bar game-completed" class:disabled={!progresses["completed"]} title="completed" on:click={() => toggleProgress("completed")}> completed </button>
          <button class="progress-bar game-uncategorized" class:disabled={!progresses["uncategorized"]} title="uncategorized" on:click={() => toggleProgress("uncategorized")}> uncategorized </button>
        </div>

        <hr />

        <h3 class="no-margin-top">Mode</h3>
        <div class="btn-group">
          <button class="btn" class:btn-primary={mode === "update"} class:btn-default={mode !== "update"} on:click={() => (mode = "update")} type="button">Update</button>
          <button class="btn" class:btn-primary={mode === "overwrite"} class:btn-default={mode !== "overwrite"} on:click={() => (mode = "overwrite")} type="button">Overwrite</button>
        </div>
        <div class="mode-desc" hidden={mode != "update"}>
          Games that aren't in any of the selected lists will be added to one accordingly to the settings. <br />
          Games that already are in at least one selected list will remain where they are and will not be added to any other lists.
        </div>
        <div class="mode-desc" hidden={mode != "overwrite"}>All selected lists will be recreated from scratch accordingly to the settings and overwritten.</div>

        <hr />

        <div class="row">
          <div class="col-sm-6">
            <h3>List by:</h3>
            <p>Which time to beat category should be used for adding games to lists?</p>
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
        <p><i class="fa fa-spinner"></i> Generating lists for preview...</p>
      {/if}

      {#if status === "preview"}
        <h3>List preview</h3>
        <p>Click "Submit" to update lists on BLAEO.</p>
        <Tabs
          tabs={[
            ...listArray.map((list) => {
              if (list?.tagId[0]) {
                return { name: list.tagId[0].label, content: ListPreview, props: { list } };
              } else {
                return null;
              }
            }),
            mpOnlyBehavior === "separate" && mpOnlyListArray.oldList ? { name: mpOnlyListArray.oldList.name, content: ListPreview, props: { list: mpOnlyListArray } } : null,
            endlessBehavior === "separate" && endlessListArray.oldList && (!mpOnlyList[0] || mpOnlyList?.[0].value !== endlessList?.[0].value)
              ? { name: endlessListArray.oldList.name, content: ListPreview, props: { list: endlessListArray } }
              : null,
            gamesWithoutHltbBehavior === "separate" && gamesWithoutHltbListArray.oldList ? { name: gamesWithoutHltbListArray.oldList.name, content: ListPreview, props: { list: gamesWithoutHltbListArray } } : null,
          ]}
          bind:activeTab
        />
      {/if}

      {#if status === "sending"}
        <p><i class="fa fa-spinner"></i> Sending lists to BLAEO...</p>
        {#if currentSubimittingList.oldList}
          <p>Currently sending: {currentSubimittingList.oldList.name}</p>
        {/if}
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
      {/if}

      {#if status === "done"}
        <h3>Success!</h3>
        <p>Done! Your lists have been updated. You can close this modal.</p>
      {/if}

      {#if status === "error"}
        <h3>An error has occured. View details below.</h3>
        <p>Status: {error.status} {error.statusText}</p>
        <pre><code>{error.responseText}</code></pre>
        <p>If this problem continues, please report this issue on <a href={SUPPORT_URL}>BLAEO+'s group thread</a> and share the error details.</p>
      {/if}
    </div>
    <div class="modal-footer">
      {#if status === "setup"}
        <div class="btn-group dropup">
          <div class="dropdown">
            <button data-toggle="dropdown" data-target="#" aria-expanded="false" type="button" class="btn btn-success">
              {#if savePresetSuccess}
                <i class="fa fa-check-circle"></i> Saved!
              {:else}
                Save preset <span class="caret"></span>
              {/if}
            </button>
            <ul class="dropdown-menu">
              {#if overwritePresetConfirm}
                <li class="dropdown-header">Overwriting {presetBeingOverwrittenName}</li>
                <li>
                  <button class="btn-overwrite" type="button" on:click={() => savePreset(presetBeingOverwritten)}>Overwrite</button>
                </li>
                <li>
                  <button type="button" on:click|stopPropagation={cancelPresetOverwrite}>Cancel</button>
                </li>
              {:else if $automaticHltbPresetsStore?.length > 0}
                <li class="dropdown-header">Save over existing preset</li>
                {#each $automaticHltbPresetsStore as preset, index}
                  <li>
                    <button class="current-preset" type="button" on:click|stopPropagation={() => confirmPresetOverwrite(index)}>{preset.name}</button>
                  </li>
                {/each}
              {:else}
                <li><div>No presets available.</div></li>
              {/if}
              <li class="divider" role="separator"></li>
              {#if savingPreset === "creating"}
                <li>
                  <form on:submit|preventDefault={() => savePreset()}>
                    <input class="form-control" type="text" bind:this={presetInput} bind:value={newPresetName} placeholder="New preset name" />
                    <button type="submit" class="btn btn-success">Save</button>
                  </form>
                </li>
              {:else if savingPreset === "idle"}
                <li>
                  <button
                    type="button"
                    on:click|stopPropagation={async () => {
                      savingPreset = "creating";
                      await tick();
                      presetInput.focus();
                    }}><i class="fa fa-plus"></i> New preset</button
                  >
                </li>
              {/if}
            </ul>
          </div>
          <div class="dropdown">
            <button data-toggle="dropdown" data-target="#" aria-expanded="false" type="button" class="btn btn-primary">
              {#if loadPresetSuccess}
                <i class="fa fa-check-circle"></i> Loaded!
              {:else}
                Load preset <span class="caret"></span>
              {/if}
            </button>
            <ul class="dropdown-menu">
              {#if $automaticHltbPresetsStore?.length > 0}
                {#each $automaticHltbPresetsStore as preset, index}
                  <li>
                    <button type="button" on:click={() => loadPreset(index)}>{preset.name}</button>
                  </li>
                {/each}
              {:else}
                <li><div>No presets available.</div></li>
              {/if}
            </ul>
          </div>
          <div class="dropdown">
            <button data-toggle="dropdown" data-target="#" aria-expanded="false" type="button" class="btn btn-danger">
              {#if deletePresetSuccess}
                <i class="fa fa-check-circle"></i> Deleted!
              {:else}
                Delete preset <span class="caret"></span>
              {/if}
            </button>
            <ul class="dropdown-menu">
              {#if $automaticHltbPresetsStore?.length > 0}
                {#each $automaticHltbPresetsStore as preset, index}
                  <li>
                    <button type="button" on:click={() => deletePreset(index)}>{preset.name}</button>
                  </li>
                {/each}
              {:else}
                <li><div>No presets available.</div></li>
              {/if}
            </ul>
          </div>
        </div>
      {/if}
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
  .fa-spinner {
    animation: fa-spin 1s infinite linear;
  }

  @keyframes fa-spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(359deg);
    }
  }

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

    .modal-footer {
      display: flex;
      justify-content: flex-end;
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

  .markdown {
    padding-bottom: 10px;

    table {
      margin-bottom: 0;
    }
  }

  label {
    font-weight: 400;
  }

  .modal-footer .btn-group {
    display: flex;
    margin-bottom: 0;
    margin-right: auto;
    gap: 8px;
  }

  .dropdown-menu {
    button,
    input {
      display: block;
      clear: both;
      appearance: none;
      border: none;
      background-color: transparent;
      padding: 3px 20px;
      width: 100%;
      color: #333333;
      font-weight: normal;
      line-height: 1.42857;
      text-align: left;
      white-space: nowrap;

      &:hover,
      &:focus {
        background-color: #f5f5f5;
        color: #262626;
        text-decoration: none;
      }
    }

    .btn-overwrite {
      background-color: #c9302c;
      border-color: #ac2925;
      color: #fff;

      &:hover,
      &:focus {
        background-color: #c9302c;
        border-color: #ac2925;
        color: #fff;
      }
    }

    li > div {
      display: block;
      padding: 3px 20px;
      width: 100%;
      color: #333333;
      font-weight: normal;
      line-height: 1.42857;
      text-align: left;
      white-space: nowrap;
      background-color: transparent;
      font-size: 12px;
    }
  }
</style>
