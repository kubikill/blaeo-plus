<script lang="ts">
  import slugify from "slugify";

  export let tabs = [] as any[];
  export let activeTab = 0;
</script>

<ul class="nav nav-tabs" role="tablist">
  {#each tabs as tab, idx}
    {#if tab}
      <li role="presentation" class:active={idx === activeTab}>
        <button class="tab" on:click={() => (activeTab = idx)} role="tab" aria-controls={slugify(`options-${tab.name}`)}>
          {tab.name}
        </button>
      </li>
    {/if}
  {/each}
</ul>

<div class="tab-container">
  {#each tabs as tab, idx}
    {#if tab}
      <div role="tabpanel" hidden={idx != activeTab} id={slugify(`options-${tab.name}`)}>
        {#if typeof tab.content === "function"}
          <svelte:component this={tab.content} {...tab.props} />
        {:else}
          {tab.content}
        {/if}
      </div>
    {/if}
  {/each}
</div>

<style lang="scss">
  .tab {
    margin-right: 2px;
    line-height: 1.42857;
    border: 1px solid transparent;
    border-radius: 4px 4px 0 0;
    padding: 8px 16px;

    &:hover,
    &:focus {
      text-decoration: none;
      background-color: #eeeeee;
      border-color: #eeeeee #eeeeee #ddd;
    }
  }

  li.active > .tab {
    color: #555555;
    background-color: #fff;
    border: 1px solid #ddd;
    border-bottom-color: transparent;
    cursor: default;
  }

  .tab-container {
    overflow: auto;
  }
</style>
