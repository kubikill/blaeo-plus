<script lang="ts">
  import { syncHltb } from "@/lib/hltbService";
  import { syncLinux } from "@/lib/linuxService";
  import { syncSteamspy } from "@/lib/steamspyService";
  import { lastCacheUpdatesStore } from "@/lib/store";

  let hltbUpdating = false;
  let linuxUpdating = false;
  let steamspyUpdating = false;

  async function updateHltb() {
    hltbUpdating = true;
    await syncHltb();
    hltbUpdating = false;
  }

  async function updateLinux() {
    linuxUpdating = true;
    await syncLinux();
    linuxUpdating = false;
  }

  async function updateSteamspy() {
    steamspyUpdating = true;
    await syncSteamspy();
    steamspyUpdating = false;
  }
</script>

<div>
  <h3>HLTB</h3>
  <p>Last update: {$lastCacheUpdatesStore.hltb}</p>
  <button type="button" class="btn btn-primary" on:click={updateHltb} disabled={hltbUpdating}>Force update</button>
  <h3>Linux data</h3>
  <p>Last update: {$lastCacheUpdatesStore.linux}</p>
  <button type="button" class="btn btn-primary" on:click={updateLinux} disabled={linuxUpdating}>Force update</button>
  <h3>Steam store data</h3>
  <p>Last update: {$lastCacheUpdatesStore.steamspy}</p>
  <button type="button" class="btn btn-primary" on:click={updateSteamspy} disabled={steamspyUpdating}>Force update</button>
</div>

<style lang="scss">
  .main {
    text-align: center;
  }
  .main > :global(svg) {
    height: 100px;
    transition: transform 0.5s ease-out;

    &:hover {
      transform: rotateY(180deg);
    }
  }

  h2 {
    margin: 0 0 4px;
  }

  .author {
    font-size: 16px;
  }
</style>
