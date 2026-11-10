<script lang="ts">
  import type { Snippet } from "svelte";
  import Toggle from "svelte-switcher";

  interface Props {
    boundValue: any;
    id: string;
    enabled?: boolean;
    hasSuboptions?: boolean;
    description?: Snippet;
    children?: Snippet;
  }

  let { boundValue = $bindable(), id, enabled = true, hasSuboptions = false, description, children }: Props = $props();

  function handleSummaryClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains("svelte-toggle")) {
      event.preventDefault();
    }
  }
</script>

{#if description}
  <details class="toggle-row toggleable">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <summary class="toggle-item" onclick={handleSummaryClick}>
      <Toggle {id} bind:checked={boundValue} disabled={!enabled} />
      {@render children?.()}
      {#if hasSuboptions}
        <i class="fa fa-cog suboptions-icon" title="Has additional settings"></i>
      {/if}
    </summary>
    <div class="content">
      {@render description()}
    </div>
  </details>
{:else}
  <div class="toggle-row">
    <div class="toggle-item">
      <Toggle {id} bind:checked={boundValue} disabled={!enabled} />
      {@render children?.()}
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

  .suboptions-icon {
    margin-left: 6px;
    color: #777;
    font-size: 12px;
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

  @keyframes details-show {
    from {
      transform: var(--details-translate, translateY(-0.5em));
      opacity: 0;
    }
  }
</style>
