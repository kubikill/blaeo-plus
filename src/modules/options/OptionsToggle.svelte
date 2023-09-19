<script lang="ts">
  import Toggle from "svelte-switcher";

  export let boundValue: any;
  export let id: any;
  export let disabled = true;

  let flippedDisabled = false;

  $: flippedDisabled = !disabled;

  function handleSummaryClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains("svelte-toggle")) {
      event.preventDefault();
    }
  }
</script>

{#if $$slots.description === true}
  <details class="toggle-row toggleable">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <summary class="toggle-item" on:click={handleSummaryClick}>
      <Toggle {id} bind:checked={boundValue} bind:disabled={flippedDisabled} />
      <slot />
    </summary>
    <div class="content">
      <slot name="description" />
    </div>
  </details>
{:else}
  <div class="toggle-row">
    <div class="toggle-item">
      <Toggle {id} bind:checked={boundValue} bind:disabled={flippedDisabled} />
      <slot />
    </div>
  </div>
{/if}

<style lang="scss">
  details {
    .content {
      margin-bottom: 24px;
      margin-left: 16px;
    }
    &[open] {
      .content {
        animation: details-show 150ms ease-in-out;
      }
    }

    summary {
      cursor: pointer;
    }
  }

  .toggle-row {
    margin-bottom: 12px;

    &.toggleable {
      > summary.toggle-item::after {
        margin-left: 4px;
        content: "▶";
      }

      &[open] {
        > summary.toggle-item::after {
          content: "▼";
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

  @keyframes details-show {
    from {
      transform: var(--details-translate, translateY(-0.5em));
      opacity: 0;
    }
  }
</style>
