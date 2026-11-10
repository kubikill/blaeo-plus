<script lang="ts">
  import MultiSelect from "svelte-multiselect";

  let { selected = $bindable([]), outerDivClass = "", ...rest }: { selected?: any[]; options: any[]; outerDivClass?: string; [key: string]: any } = $props();
</script>

<MultiSelect bind:selected outerDivClass="bp-color-multiselect {outerDivClass}" selectedOptionsDraggable={false} {...rest}>
  {#snippet option({ option })}
    <div style:border-left={`7px solid ${option.color}`}>{option.label}</div>
  {/snippet}
</MultiSelect>

<style lang="scss">
  :global(div.multiselect.bp-color-multiselect > ul.options > li) {
    padding: 0 !important;
  }

  :global(div.multiselect.bp-color-multiselect > ul.options > li > div) {
    padding: 6px 8px;
  }
</style>
