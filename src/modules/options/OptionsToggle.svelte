<script>
  import Toggle from "svelte-switcher";

  export let boundValue;
  export let id;
  export let disabled = true;

  let flippedDisabled = false;

  $: flippedDisabled = !disabled;
</script>

<div class="toggle-row">
  <div class="toggle-item">
    <Toggle {id} bind:checked={boundValue} bind:disabled={flippedDisabled} />
    <label for={id} class="toggle-label">
      <slot />
    </label>
  </div>
  <slot name="description" />
</div>

<style lang="scss">
  .toggle-row {
    margin-bottom: 12px;
  }

  .toggle-item {
    display: flex;
    align-items: center;
    margin-bottom: 4px;

    label {
      margin-bottom: 0;
      display: inline;
      margin-left: 10px;
      font-weight: 400;
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
</style>
