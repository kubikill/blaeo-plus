<script lang="ts">
  import { optionsStore } from "@/lib/store";
  import BlacklistModal from "./BlacklistModal.svelte";
  import { blacklistIcon } from "@/assets/icons";
  export let name: string;

  let showModal = false;

  function toggleBlacklist() {
    if ($optionsStore.blacklist[name]) {
      delete $optionsStore.blacklist[name];
      $optionsStore = $optionsStore;
    } else {
      showModal = true;
    }
  }
</script>

<button class="btn btn-default" title="Toggle blacklist" aria-label="Toggle blacklist" data-value={!!$optionsStore.blacklist[name]} on:click={toggleBlacklist}>
  {@html blacklistIcon}
</button>

<BlacklistModal {name} bind:showModal />

<style lang="scss">
  .btn {
    margin-right: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 34px;
    vertical-align: top;
    float: right;

    &[data-value="true"] {
      background-color: #337ab7;
      border-color: #2e6da4;
      color: #ffffff;
    }
  }
</style>
