<script lang="ts">
  import Modal from "@/lib/Modal.svelte";
  import ColorMultiSelect from "@/lib/ColorMultiSelect.svelte";
  import RequestErrorDetails from "@/lib/RequestErrorDetails.svelte";
  import RequestProgress from "@/lib/RequestProgress.svelte";
  import Toggle from "svelte-switcher";
  import Tabs from "@/lib/Tabs.svelte";
  import { automaticHltbPresets, listBackups } from "@/lib/store.svelte";
  import { getList, setList } from "@/lib/listService";
  import { getUserGames, getUserName, userData } from "@/globals";
  import { isMpOnly } from "@/lib/hltbService";
  import { ensureGameData, hltbData, steamHuntersData, type Dataset } from "@/lib/gameData";
  import { enqueueUnknownSteamHuntersGames, getSteamHuntersTime } from "@/lib/steamHunters";
  import { sortGamesBy } from "@/lib/gameSort";
  import { progressClass, reformatBlaeoGameListToSteamIdColumn } from "@/lib/utilities";
  import { PROGRESS_LABELS, type Progress } from "@/modules/games/filterTypes";
  import ListPreview from "./ListPreview.svelte";
  import SortControls from "./SortControls.svelte";
  import { flushSync, tick } from "svelte";

  type ListTarget = AutomaticHltbTagInfo & { listId?: string; name: string };
  type GameTimeSource = "main" | "extra" | "everything" | "mp" | "coop" | "allplaystyles" | "steamhunters";

  const TIME_SOURCE_LABELS: Record<GameTimeSource, string> = {
    main: "HLTB Main",
    extra: "HLTB +Extra",
    everything: "HLTB 100%",
    mp: "HLTB MP",
    coop: "HLTB Co-op",
    allplaystyles: "HLTB all playstyles",
    steamhunters: "SH",
  };

  const LIST_BY_LABELS: Record<AutomaticHltbPreset["listBy"], string> = {
    main: "Main time to beat",
    extra: "+Extra time to beat",
    everything: "100% time to beat",
    steamhunters: "SteamHunters median time to complete",
  };

  const FALLBACK_OPTIONS: { value: AutomaticHltbPreset["fallbackTime"]; label: string }[] = [
    { value: "none", label: "Don't use another time" },
    { value: "main", label: "HLTB Main time to beat" },
    { value: "extra", label: "HLTB +Extra time to beat" },
    { value: "everything", label: "HLTB 100% time to beat" },
    { value: "allplaystyles", label: "HLTB all playstyles time to beat" },
    { value: "steamhunters", label: "SteamHunters median time to complete" },
  ];

  function defaultSettings() {
    return {
      mode: "update",
      progresses: {
        "wont play": true,
        "never played": true,
        unfinished: true,
        beaten: true,
        completed: true,
        uncategorized: true,
      } as Record<string, boolean>,
      sortWholeList: false,
      listBy: "main" as AutomaticHltbPreset["listBy"],
      sortBy: "name",
      sortByOrder: "asc",
      ignoreLeadingArticles: true,
      mpOnlyBehavior: "exclude",
      endlessBehavior: "exclude",
      fallbackTime: "none" as AutomaticHltbPreset["fallbackTime"],
      noTimeBehavior: "exclude",
      minHltbReports: "2",
      minSteamHuntersPlayers: "3",
      mpOnlyList: [] as BlaeoListOption[],
      endlessList: [] as BlaeoListOption[],
      noTimeList: [] as BlaeoListOption[],
      whitelistLists: [] as BlaeoListOption[],
      blacklistLists: [] as BlaeoListOption[],
      listFilterPriority: "blacklist" as "whitelist" | "blacklist",
      listArray: [] as AutomaticHltbTimeList[],
    };
  }

  let settings = $state(defaultSettings());
  let targets = $state.raw<ListTarget[]>([]);
  let noAchievementIds = $state.raw(new Set<number>());
  let gameTimes = $state.raw(new Map<number, ListMakerGameTime>());
  let requestError = $state.raw<unknown>(null);
  let status = $state("setup");
  let showModal = $state(false);
  let activeTab = $state(0);
  let progress = $state(0);
  let progressTotal = $state(0);
  let currentTarget = $state.raw<ListTarget | null>(null);

  let savingPreset = $state("idle");
  let newPresetName = $state("");
  let presetInput: HTMLInputElement | undefined = $state();
  let savePresetSuccess = $state(false);
  let loadPresetSuccess = $state(false);
  let overwritePresetConfirm = $state(false);
  let deletePresetSuccess = $state(false);
  let presetBeingOverwritten = $state(-1);
  let presetBeingOverwrittenName = $state("");

  const formattedLists: BlaeoListOption[] = Array.from(document.querySelectorAll<HTMLTableRowElement>("table.lists-table[data-rearrange] tr[data-item]"), (listEntry) => ({
    label: listEntry.querySelector("td:first-child > span")?.textContent?.trim() as string,
    value: listEntry.getAttribute("data-item") as string,
    color: listEntry.style.borderLeftColor,
  }));

  let usesSteamHunters = $derived(settings.listBy === "steamhunters");
  let timeSource: "hltb" | "steamhunters" = $derived(usesSteamHunters ? "steamhunters" : "hltb");
  let mpOnlySelection = $derived(settings.mpOnlyBehavior === "separate" ? settings.mpOnlyList[0] : undefined);
  let endlessSelection = $derived(settings.endlessBehavior === "separate" ? settings.endlessList[0] : undefined);
  let noTimeSelection = $derived(settings.noTimeBehavior === "separate" ? settings.noTimeList[0] : undefined);
  let endlessSharesMpList = $derived(!!mpOnlySelection && mpOnlySelection.value === endlessSelection?.value);
  let selectedTargets = $derived([...settings.listArray.map((list) => list.tagId[0]), mpOnlySelection, endlessSelection, noTimeSelection]);
  let blacklistedTargetNames = $derived(settings.blacklistLists.filter((list) => selectedTargets.some((target) => target?.value === list.value)).map((list) => list.label));

  let fallbackOptions = $derived(FALLBACK_OPTIONS.filter((option) => option.value !== settings.listBy));
  let usesHltbMinimum = $derived(!usesSteamHunters || ["main", "extra", "everything"].includes(settings.fallbackTime));
  let usesSteamHuntersMinimum = $derived(usesSteamHunters || settings.fallbackTime === "steamhunters");

  $effect(() => {
    if (settings.fallbackTime === settings.listBy) {
      settings.fallbackTime = "none";
    }
  });

  function hideModal() {
    showModal = false;
    setTimeout(() => {
      status = "setup";
    }, 400);
  }

  function cancelPreview() {
    status = "setup";
  }

  function addList() {
    settings.listArray.push({ playtime: "", maxPlaytime: "", tagId: [] });
  }

  function removeList(index: number) {
    settings.listArray.splice(index, 1);
  }

  function showRequestError(error: unknown) {
    console.error(error);
    requestError = error;
    status = "error";
  }

  function createTarget(option?: BlaeoListOption): ListTarget {
    return { listId: option?.value, name: option?.label ?? "", games: [], newGames: [], oldList: null };
  }

  async function getSteamIdsOnLists(selected: BlaeoListOption[], allTargets: ListTarget[]): Promise<Set<number> | null> {
    if (selected.length === 0) {
      return null;
    }

    const steamIds = new Set<number>();

    for (let { value: listId } of selected) {
      const list = allTargets.find((target) => target.listId === listId)?.oldList ?? (await getList(listId));
      list.games.forEach((game) => steamIds.add(game.steam_id));
    }

    return steamIds;
  }

  function isFilteredOutByLists(steamId: number, whitelisted: Set<number> | null, blacklisted: Set<number> | null): boolean {
    const onWhitelist = !!whitelisted?.has(steamId);
    const onBlacklist = !!blacklisted?.has(steamId);

    if (onWhitelist && onBlacklist) {
      return settings.listFilterPriority === "blacklist";
    }

    return onBlacklist || (whitelisted !== null && !onWhitelist);
  }

  function getSourceTime(steamId: number, source: GameTimeSource): ListMakerGameTime | undefined {
    const hltbGame = hltbData[steamId];
    const label = TIME_SOURCE_LABELS[source];

    if (source === "steamhunters") {
      const seconds = getSteamHuntersTime(steamId);
      const count = steamHuntersData[steamId]?.perfected ?? 0;

      return seconds && count >= +settings.minSteamHuntersPlayers ? { seconds, count, label } : undefined;
    }

    if (source === "allplaystyles") {
      return hltbGame?.avgComp ? { seconds: hltbGame.avgComp, count: Infinity, label } : undefined;
    }

    const seconds = hltbGame?.[source];
    const count = hltbGame?.[`${source}Count`] ?? 0;

    return seconds && count >= +settings.minHltbReports ? { seconds, count, label } : undefined;
  }

  function getGameTime(steamId: number): ListMakerGameTime | undefined {
    const hltbGame = hltbData[steamId];
    const usesMpTime = settings.listBy !== "steamhunters" && settings.mpOnlyBehavior === "normal" && isMpOnly(hltbGame);
    const primarySource: GameTimeSource = usesMpTime ? (hltbGame.coop ? "coop" : "mp") : settings.listBy;

    return getSourceTime(steamId, primarySource) ?? (settings.fallbackTime === "none" ? undefined : getSourceTime(steamId, settings.fallbackTime));
  }

  async function categorizeGames(allGames: BlaeoGamesJson, allTargets: ListTarget[]) {
    const whitelisted = await getSteamIdsOnLists(settings.whitelistLists, allTargets);
    const blacklisted = await getSteamIdsOnLists(settings.blacklistLists, allTargets);
    const onTargetLists = new Set(allTargets.flatMap((target) => target.oldList?.games.map((game) => game.steam_id) ?? []));
    const categories = { timed: [] as BlaeoGamesJson, mpOnly: [] as BlaeoGamesJson, endless: [] as BlaeoGamesJson, noTime: [] as BlaeoGamesJson };

    for (const game of allGames) {
      // In update mode, games already on one of the target lists stay where they are
      if ((settings.mode === "update" && onTargetLists.has(game.steam_id)) || settings.progresses[game.progress] === false || isFilteredOutByLists(game.steam_id, whitelisted, blacklisted)) {
        continue;
      }

      const hltbGame = hltbData[game.steam_id];

      if (settings.mpOnlyBehavior !== "normal" && isMpOnly(hltbGame)) {
        if (settings.mpOnlyBehavior === "separate") {
          categories.mpOnly.push(game);
        }
      } else if (hltbGame?.endless) {
        if (settings.endlessBehavior === "separate") {
          categories.endless.push(game);
        }
      } else if (getGameTime(game.steam_id)) {
        categories.timed.push(game);
      } else {
        categories.noTime.push(game);
      }
    }

    return categories;
  }

  /* The time list a game with this time belongs to. If several match, the last one wins. */
  function pickTimeList(seconds: number, timeTargets: ListTarget[]): ListTarget | undefined {
    let selectedList: ListTarget | undefined;

    settings.listArray.forEach((list, index) => {
      const min = (+list.playtime || 0) * 3600;
      const max = (list.maxPlaytime ? +list.maxPlaytime : Infinity) * 3600;

      if (seconds >= min && seconds <= max) {
        selectedList = timeTargets[index];
      }
    });

    return selectedList;
  }

  function sortGames(games: BlaeoGamesJson) {
    return sortGamesBy(games, (game) => ({ steamId: game.steam_id, name: game.name, playtime: game.playtime }), { sortBy: settings.sortBy, order: settings.sortByOrder, ignoreLeadingArticles: settings.ignoreLeadingArticles });
  }

  async function createPreview() {
    status = "generating";

    try {
      getUserName();

      const allGames = await getUserGames(userData.name);
      const datasets: Dataset[] = usesSteamHunters || settings.fallbackTime === "steamhunters" || (settings.sortWholeList && settings.sortBy === "steamhunters") ? ["hltb", "steamhunters"] : ["hltb"];

      await ensureGameData(
        allGames.map((game) => game.steam_id),
        datasets,
      );

      if (datasets.includes("steamhunters")) {
        enqueueUnknownSteamHuntersGames(allGames.map((game) => ({ name: game.name, steamId: game.steam_id })));
      }

      const timeTargets = settings.listArray.map((list) => createTarget(list.tagId[0]));
      const mpOnlyTarget = createTarget(mpOnlySelection);
      const endlessTarget = endlessSharesMpList ? mpOnlyTarget : createTarget(endlessSelection);
      const noTimeTarget = createTarget(noTimeSelection);
      const allTargets = [...new Set([...timeTargets, mpOnlyTarget, endlessTarget, noTimeTarget])];

      for (const target of allTargets) {
        if (target.listId) {
          target.oldList = await getList(target.listId);
        }
      }

      const categories = await categorizeGames(allGames, allTargets);
      const libraryBySteamId = reformatBlaeoGameListToSteamIdColumn(allGames);
      const oldSteamIds = new Map(allTargets.map((target) => [target, new Set(target.oldList?.games.map((game) => game.steam_id))]));

      if (settings.mode === "update") {
        for (const target of allTargets) {
          target.games = target.oldList?.games.flatMap((game) => libraryBySteamId[game.steam_id] ?? []) ?? [];
        }
      }

      const addToTarget = (target: ListTarget, game: BlaeoGameEntry) => {
        target.games.push(game);

        if (settings.mode === "update" || !oldSteamIds.get(target)?.has(game.steam_id)) {
          target.newGames.push(game);
        }
      };

      categories.mpOnly.forEach((game) => addToTarget(mpOnlyTarget, game));
      categories.endless.forEach((game) => addToTarget(endlessTarget, game));
      categories.noTime.forEach((game) => addToTarget(noTimeTarget, game));

      const usedTimes = new Map<number, ListMakerGameTime>();

      for (const game of categories.timed) {
        const time = getGameTime(game.steam_id) as ListMakerGameTime;
        const timeTarget = pickTimeList(time.seconds, timeTargets);

        if (timeTarget) {
          addToTarget(timeTarget, game);
          usedTimes.set(game.steam_id, time);
        }
      }

      if (settings.sortWholeList) {
        for (const target of allTargets) {
          target.games = sortGames(target.games);
        }
      }

      gameTimes = usedTimes;
      noAchievementIds = new Set(allGames.filter((game) => !game.achievements).map((game) => game.steam_id));
      targets = allTargets;
      status = "preview";
    } catch (error) {
      showRequestError(error);
    }
  }

  async function sendLists() {
    status = "sending";

    const submissions = targets.filter((target) => target.listId);

    progress = 0;
    progressTotal = submissions.length;

    for (let submission of submissions) {
      if (!(await backupAndSubmitList(submission))) {
        return;
      }

      progress++;
    }

    status = "done";
  }

  async function backupAndSubmitList(target: ListTarget): Promise<boolean> {
    const listId = target.listId as string;

    listBackups.push({
      id: listId,
      name: target.name,
      color: target.oldList?.color ?? "",
      date: new Date().toLocaleString(),
      dateIso: new Date().toISOString(),
      games: target.oldList?.games ?? [],
    });
    flushSync();

    currentTarget = target;

    try {
      await setList(
        listId,
        target.games.map((game) => game.id),
      );

      return true;
    } catch (error) {
      showRequestError(error);

      return false;
    }
  }

  function savePreset(presetIndex: number | null = null) {
    if (!newPresetName) {
      newPresetName = `Preset ${automaticHltbPresets.length + 1}`;
    }

    if (presetIndex != null) {
      automaticHltbPresets[presetIndex] = { name: automaticHltbPresets[presetIndex].name, ...$state.snapshot(settings) };
    } else {
      automaticHltbPresets.push({ name: newPresetName, ...$state.snapshot(settings) });
    }

    newPresetName = "";
    savingPreset = "idle";

    cancelPresetOverwrite();

    savePresetSuccess = true;

    setTimeout(() => {
      savePresetSuccess = false;
    }, 3000);
  }

  function loadPreset(presetIndex: number) {
    const preset = $state.snapshot(automaticHltbPresets[presetIndex]) as AutomaticHltbPreset;
    const defaults = defaultSettings();
    const savedSettings = Object.fromEntries(Object.entries(preset).filter(([key]) => key in defaults));

    settings = {
      ...defaults,
      ignoreLeadingArticles: false,
      ...savedSettings,
      mpOnlyList: existingLists(preset.mpOnlyList),
      endlessList: existingLists(preset.endlessList),
      noTimeList: existingLists(preset.noTimeList),
      whitelistLists: existingLists(preset.whitelistLists),
      blacklistLists: existingLists(preset.blacklistLists),
      listArray: preset.listArray.map(({ playtime, maxPlaytime, tagId }) => ({ playtime, maxPlaytime, tagId: existingLists(tagId) })),
    };

    loadPresetSuccess = true;

    setTimeout(() => {
      loadPresetSuccess = false;
    }, 3000);
  }

  function existingLists(selected: BlaeoListOption[] | undefined): BlaeoListOption[] {
    return (selected ?? []).flatMap((option) => {
      const current = formattedLists.find((list) => list.value === option.value);
      return current ? [{ ...current }] : [];
    });
  }

  function deletePreset(presetIndex: number) {
    automaticHltbPresets.splice(presetIndex, 1);

    deletePresetSuccess = true;

    setTimeout(() => {
      deletePresetSuccess = false;
    }, 3000);
  }

  function confirmPresetOverwrite(index: number) {
    presetBeingOverwritten = index;
    presetBeingOverwrittenName = automaticHltbPresets[index].name;

    overwritePresetConfirm = true;
  }

  function cancelPresetOverwrite() {
    presetBeingOverwritten = -1;
    presetBeingOverwrittenName = "";

    overwritePresetConfirm = false;
  }
</script>

<button class="bp-automatic-list btn btn-default" onclick={() => (showModal = true)}>HLTB list maker</button>

<Modal class="bp-automatic-list-modal" title="HLTB list maker" bind:open={showModal} width={800} alignTop closeOnBackdrop={false} closeButton={false}>
  {#if status === "setup"}
    <p>This will allow you to automatically add games to selected lists according to HLTB time to beat or SteamHunters median time to complete.</p>
    <h3>Lists</h3>
    <p>
      Select lists to which games should be added, as well as time to beat thresholds.<br />
      If the game matches multiple lists, it will be added only to the last one that matches.
    </p>
    <div class="markdown">
      <table>
        <tbody>
          {#each settings.listArray as list, index}
            <tr>
              <td>{index + 1}</td>
              <td>
                <div class="tag-wrapper">
                  <input class="tag-playtime form-control" type="number" min="0" bind:value={list.playtime} name="" id="" placeholder="Min hours to beat (default 0)" />
                  <input class="tag-playtime form-control" type="number" min="0" bind:value={list.maxPlaytime} name="" id="" placeholder="Max hours to beat (default no limit)" />
                  <ColorMultiSelect bind:selected={list.tagId} options={formattedLists} outerDivClass="form-control" placeholder={"Select a list (or keep empty to exclude this range from being added to any list)"} maxSelect={1} />
                  <button class="btn btn-danger btn-sm" onclick={() => removeList(index)}>Remove list</button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <button class="btn btn-success btn-sm" onclick={addList}>Add list</button>

    <hr />

    <div class="row">
      <div class="col-sm-6">
        <h3>MP-only games</h3>
        <label for="bp-automatic-hltb-list-mp-only-games">What to do with MP-only games?</label>
        <select id="bp-automatic-hltb-list-mp-only-games" class="form-control" bind:value={settings.mpOnlyBehavior}>
          <option value="exclude">Exclude from being added to any list</option>
          <option value="separate">Add to a specific list</option>
          <option value="normal">{usesSteamHunters ? "Treat them like other games" : "Use the MP/Co-op time to beat instead"}</option>
        </select>
        {#if settings.mpOnlyBehavior === "separate"}
          <div class="tag-wrapper">
            <ColorMultiSelect bind:selected={settings.mpOnlyList} options={formattedLists} outerDivClass="form-control" placeholder={"Select a list"} maxSelect={1} />
          </div>
        {/if}
      </div>
      <div class="col-sm-6">
        <h3>Endless games</h3>
        <label for="bp-automatic-hltb-list-endless-games-behavior">What to do with endless games?</label>
        <select id="bp-automatic-hltb-list-endless-games-behavior" class="form-control" bind:value={settings.endlessBehavior}>
          <option value="exclude">Exclude from being added to any list</option>
          <option value="separate">Add to a specific list</option>
        </select>
        {#if settings.endlessBehavior === "separate"}
          <div class="tag-wrapper">
            <ColorMultiSelect bind:selected={settings.endlessList} options={formattedLists} outerDivClass="form-control" placeholder={"Select a list"} maxSelect={1} />
          </div>
        {/if}
      </div>
    </div>
    <div class="row">
      <div class="col-sm-6">
        <h3>List by:</h3>
        <p>Which time to beat category should be used for adding games to lists?</p>
        <select id="bp-automatic-hltb-list-by" class="form-control" bind:value={settings.listBy}>
          <option value="main">Main time to beat</option>
          <option value="extra">+Extra time to beat</option>
          <option value="everything">100% time to beat</option>
          <option value="steamhunters">SteamHunters median time to complete</option>
        </select>
      </div>
    </div>
    <h3>Games without enough data</h3>
    <div class="row">
      <div class="col-sm-6">
        <label for="bp-automatic-hltb-list-fallback-time">If the {LIST_BY_LABELS[settings.listBy]} isn't usable:</label>
        <select id="bp-automatic-hltb-list-fallback-time" class="form-control" bind:value={settings.fallbackTime}>
          {#each fallbackOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
        <p>A time is only usable if it's based on at least this much data:</p>
        {#if usesHltbMinimum}
          <label for="bp-automatic-hltb-list-min-hltb-reports">Minimum HLTB reports</label>
          <input id="bp-automatic-hltb-list-min-hltb-reports" class="form-control min-data" type="number" min="0" bind:value={settings.minHltbReports} />
        {/if}
        {#if usesSteamHuntersMinimum}
          <label for="bp-automatic-hltb-list-min-steamhunters-players">Minimum SteamHunters players who completed the game</label>
          <input id="bp-automatic-hltb-list-min-steamhunters-players" class="form-control min-data" type="number" min="0" bind:value={settings.minSteamHuntersPlayers} />
        {/if}
      </div>
      <div class="col-sm-6">
        <label for="bp-automatic-hltb-list-no-time-behavior">If no usable time is found:</label>
        <select id="bp-automatic-hltb-list-no-time-behavior" class="form-control" bind:value={settings.noTimeBehavior}>
          <option value="exclude">Exclude from being added to any list</option>
          <option value="separate">Add to a specific list</option>
        </select>
        {#if settings.noTimeBehavior === "separate"}
          <div class="tag-wrapper">
            <ColorMultiSelect bind:selected={settings.noTimeList} options={formattedLists} outerDivClass="form-control" placeholder={"Select a list"} maxSelect={1} />
          </div>
        {/if}
      </div>
    </div>

    <hr />

    <h3 class="list-progress-heading">Filter games by progress</h3>
    <p>Games with excluded progresses will not be added to any list.</p>
    <div class="list-progress">
      {#each Object.keys(settings.progresses) as progressName}
        {@const label = PROGRESS_LABELS[progressClass(progressName) as Progress]}
        <button class="progress-bar game-{progressClass(progressName)}" class:disabled={!settings.progresses[progressName]} title={label} onclick={() => (settings.progresses[progressName] = !settings.progresses[progressName])}
          >{label}</button
        >
      {/each}
    </div>

    <hr />

    <h3>Filter games by lists</h3>
    <p>
      When whitelisted lists are selected, only games on at least one of them will be added to lists.<br />
      Games on a blacklisted list will not be added to any list.
    </p>
    <div class="row">
      <div class="col-sm-6">
        <label for="bp-automatic-hltb-list-whitelist">Whitelisted lists</label>
        <div class="tag-wrapper">
          <ColorMultiSelect id="bp-automatic-hltb-list-whitelist" bind:selected={settings.whitelistLists} options={formattedLists} outerDivClass="form-control" placeholder={"None (consider all games)"} />
        </div>
      </div>
      <div class="col-sm-6">
        <label for="bp-automatic-hltb-list-blacklist">Blacklisted lists</label>
        <div class="tag-wrapper">
          <ColorMultiSelect id="bp-automatic-hltb-list-blacklist" bind:selected={settings.blacklistLists} options={formattedLists} outerDivClass="form-control" placeholder={"None"} />
        </div>
      </div>
    </div>
    {#if settings.whitelistLists.length > 0 && settings.blacklistLists.length > 0}
      <p class="list-filter-priority-label">If a game is on both a whitelisted and a blacklisted list:</p>
      <div class="btn-group">
        <button class="btn" class:btn-primary={settings.listFilterPriority === "blacklist"} class:btn-default={settings.listFilterPriority !== "blacklist"} onclick={() => (settings.listFilterPriority = "blacklist")} type="button"
          >Ignore</button
        >
        <button class="btn" class:btn-primary={settings.listFilterPriority === "whitelist"} class:btn-default={settings.listFilterPriority !== "whitelist"} onclick={() => (settings.listFilterPriority = "whitelist")} type="button"
          >Add</button
        >
      </div>
    {/if}
    {#if settings.mode === "overwrite" && blacklistedTargetNames.length > 0}
      {@const single = blacklistedTargetNames.length === 1}
      <div class="alert alert-warning">
        <i class="fa fa-exclamation-triangle"></i>
        {blacklistedTargetNames.join(", ")}
        {single ? "is" : "are"} blacklisted but also a list games are added to. Overwriting will remove {single ? "its" : "their"} current games (unless the whitelist wins for them).
      </div>
    {/if}

    <hr />

    <h3 class="no-margin-top">Mode</h3>
    <div class="btn-group">
      <button class="btn" class:btn-primary={settings.mode === "update"} class:btn-default={settings.mode !== "update"} onclick={() => (settings.mode = "update")} type="button">Update</button>
      <button class="btn" class:btn-primary={settings.mode === "overwrite"} class:btn-default={settings.mode !== "overwrite"} onclick={() => (settings.mode = "overwrite")} type="button">Overwrite</button>
    </div>
    <div class="mode-desc" hidden={settings.mode != "update"}>
      Games that aren't in any of the selected lists will be added to one accordingly to the settings. <br />
      Games that already are in at least one selected list will remain where they are and will not be added to any other lists.
    </div>
    <div class="mode-desc" hidden={settings.mode != "overwrite"}>All selected lists will be recreated from scratch accordingly to the settings and overwritten.</div>

    <hr />

    <div class="row">
      <div class="col-sm-6">
        <h3>Sort</h3>
        <div class="toggle-item">
          <Toggle bind:checked={settings.sortWholeList} />
          Sort list?
        </div>
        {#if settings.sortWholeList}
          <SortControls idPrefix="bp-automatic-hltb-list" bind:sortBy={settings.sortBy} bind:order={settings.sortByOrder} bind:ignoreLeadingArticles={settings.ignoreLeadingArticles} alwaysShowSteamHunters={usesSteamHunters} />
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
    <Tabs tabs={targets.filter((target) => target.listId).map((list) => ({ name: list.name, content: ListPreview, props: { list, timeSource, noAchievementIds, gameTimes } }))} bind:activeTab />
  {/if}

  {#if status === "sending"}
    <p><i class="fa fa-spinner"></i> Sending lists to BLAEO...</p>
    {#if currentTarget?.oldList}
      <p>Currently sending: {currentTarget.oldList.name}</p>
    {/if}
    <RequestProgress {progress} total={progressTotal} />
  {/if}

  {#if status === "done"}
    <h3>Success!</h3>
    <p>Done! Your lists have been updated. You can close this modal.</p>
  {/if}

  {#if status === "error"}
    <h3>An error has occured. View details below.</h3>
    <RequestErrorDetails error={requestError} />
  {/if}
  {#snippet footer()}
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
                <button class="btn-overwrite" type="button" onclick={() => savePreset(presetBeingOverwritten)}>Overwrite</button>
              </li>
              <li>
                <button
                  type="button"
                  onclick={(e) => {
                    e.stopPropagation();
                    cancelPresetOverwrite();
                  }}>Cancel</button
                >
              </li>
            {:else if automaticHltbPresets?.length > 0}
              <li class="dropdown-header">Save over existing preset</li>
              {#each automaticHltbPresets as preset, index}
                <li>
                  <button
                    class="current-preset"
                    type="button"
                    onclick={(e) => {
                      e.stopPropagation();
                      confirmPresetOverwrite(index);
                    }}>{preset.name}</button
                  >
                </li>
              {/each}
            {:else}
              <li><div>No presets available.</div></li>
            {/if}
            <li class="divider" role="separator"></li>
            {#if savingPreset === "creating"}
              <li>
                <form
                  onsubmit={(e) => {
                    e.preventDefault();
                    savePreset();
                  }}
                >
                  <input class="form-control" type="text" bind:this={presetInput} bind:value={newPresetName} placeholder="New preset name" />
                  <button type="submit" class="btn btn-success">Save</button>
                </form>
              </li>
            {:else if savingPreset === "idle"}
              <li>
                <button
                  type="button"
                  onclick={async (e) => {
                    e.stopPropagation();
                    savingPreset = "creating";
                    await tick();
                    presetInput?.focus();
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
            {#if automaticHltbPresets?.length > 0}
              {#each automaticHltbPresets as preset, index}
                <li>
                  <button type="button" onclick={() => loadPreset(index)}>{preset.name}</button>
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
            {#if automaticHltbPresets?.length > 0}
              {#each automaticHltbPresets as preset, index}
                <li>
                  <button type="button" onclick={() => deletePreset(index)}>{preset.name}</button>
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
      <button type="button" class="btn btn-default" onclick={hideModal}>Close</button>
    {/if}
    {#if status === "setup"}
      <button type="button" class="btn btn-primary" onclick={createPreview}>Preview</button>
    {/if}
    {#if status === "preview"}
      <button type="button" class="btn btn-default" onclick={cancelPreview}>Back</button>
      <button type="button" class="btn btn-primary" onclick={sendLists}>Submit</button>
    {/if}
  {/snippet}
</Modal>

<style lang="scss">
  :global(.bp-modal.bp-automatic-list-modal .modal-footer) {
    display: flex;
    justify-content: flex-end;
  }

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

  .list-filter-priority-label {
    margin-bottom: 5px;
  }

  .row {
    margin-top: 8px;
    margin-bottom: 8px;
  }

  select,
  :global(.bp-automatic-list-modal .bp-sort-controls select) {
    margin-bottom: 10px;
  }

  div.list-progress button.progress-bar {
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

  .tag-wrapper {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    gap: 8px;
  }

  .min-data {
    margin-bottom: 10px;
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
    }
  }

  :global(.bp-automatic-list-modal .modal-body div.multiselect.form-control) {
    display: flex;
    height: auto;
    min-height: 34px;
    padding: 2px 8px;
  }

  .markdown {
    padding-bottom: 10px;

    table {
      margin-bottom: 0;
    }
  }

  label,
  :global(.bp-automatic-list-modal .bp-sort-controls label) {
    font-weight: 400;
  }

  :global(.bp-automatic-list-modal .modal-footer) .btn-group {
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
