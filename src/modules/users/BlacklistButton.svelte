<script lang="ts">
  import { options } from "@/lib/store.svelte";
  import BlacklistModal from "./BlacklistModal.svelte";
  import { blacklistIcon } from "@/assets/icons";
  interface Props {
    name: string;
  }

  let { name }: Props = $props();

  let showModal = $state(false);

  function toggleBlacklist() {
    if (options.blacklist[name]) {
      delete options.blacklist[name];
    } else {
      showModal = true;
    }
  }
</script>

<button class="btn btn-default" title="Toggle blacklist" aria-label="Toggle blacklist" data-value={!!options.blacklist[name]} onclick={toggleBlacklist}>
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
