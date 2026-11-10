<script lang="ts">
  import Modal from "@/lib/Modal.svelte";
  import { blaeoPlusLogo } from "@/assets/icons";
  import OptionsTab from "./tabs/OptionsTab.svelte";
  import Tabs from "@/lib/Tabs.svelte";
  import AboutTab from "./tabs/AboutTab.svelte";
  import ChangelogTab from "./tabs/ChangelogTab.svelte";
  import BlacklistTab from "./tabs/BlacklistTab.svelte";
  import ListBackupsTab from "./tabs/ListBackupsTab.svelte";
  import CacheTab from "./tabs/CacheTab.svelte";
  let showOptions = $state(false);
  let rendered = $state(false);
  let activeTab = $state(0);

  export function open() {
    rendered = true;
    showOptions = true;
  }

  function hideModal() {
    showOptions = false;
    setTimeout(() => {
      activeTab = 0;
    }, 1000);
  }
</script>

<Modal class="bp-options-screen" bind:open={showOptions} onclose={hideModal} width={800} alignTop>
  {#snippet heading()}{@html blaeoPlusLogo} BLAEO+ Settings{/snippet}
  {#if rendered}
    <Tabs
      tabs={[
        { name: "Options", content: OptionsTab },
        { name: "Blacklist", content: BlacklistTab },
        { name: "List backups", content: ListBackupsTab },
        { name: "Cache", content: CacheTab },
        { name: "Changelog", content: ChangelogTab },
        { name: "About", content: AboutTab },
      ]}
      bind:activeTab
    />
  {/if}
  {#snippet footer()}
    <button type="button" class="btn btn-default" onclick={hideModal}>Close</button>
  {/snippet}
</Modal>

<style lang="scss">
  :global(.bp-modal.bp-options-screen) {
    @media (min-width: 768px) {
      padding: 32px 64px;
    }
  }

  :global(.bp-modal.bp-options-screen .modal-body) {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
</style>
