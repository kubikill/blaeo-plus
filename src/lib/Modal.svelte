<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    open: boolean;
    /** Plain-text title; use the `heading` snippet instead for markup (icons etc.) */
    title?: string;
    heading?: Snippet;
    children: Snippet;
    footer?: Snippet;
    /** Extra class on the backdrop, for modal-specific styles */
    class?: string;
    /** Max width of the dialog in px */
    width?: number;
    alignTop?: boolean;
    closeOnBackdrop?: boolean;
    closeButton?: boolean;
    onclose?: () => void;
  }

  let { open = $bindable(false), title = "", heading, children, footer, class: className = "", width = 700, alignTop = false, closeOnBackdrop = true, closeButton = true, onclose }: Props = $props();

  function close() {
    if (onclose) {
      onclose();
    } else {
      open = false;
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  class="bp-modal {className}"
  class:visible={open}
  class:bp-modal-top={alignTop}
  role="presentation"
  onclick={(e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) close();
  }}
>
  <div class="modal-content" style:max-width="{width}px">
    <div class="modal-header">
      <h2 class="modal-header-heading">
        {#if heading}
          {@render heading()}
        {:else}
          {title}
        {/if}
      </h2>
      {#if closeButton}
        <button type="button" aria-label="Close" onclick={close}>
          <i class="fa fa-close"></i>
        </button>
      {/if}
    </div>
    <div class="modal-body">
      {@render children()}
    </div>
    {#if footer}
      <div class="modal-footer">
        {@render footer()}
      </div>
    {/if}
  </div>
</div>
