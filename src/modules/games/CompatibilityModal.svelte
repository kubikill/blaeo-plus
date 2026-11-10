<script lang="ts">
  import Modal from "@/lib/Modal.svelte";
  import { deckPlayable, deckUnsupported } from "@/assets/icons";
  import { compatibilityCheckmark, compatibilityMessageType, compatibilityRatingBadge, compatibilityRatingLabel, localizeCompatibilityMessage } from "@/lib/linuxService";

  let { deviceId, title }: { deviceId: CompatibilityDeviceId; title: string } = $props();

  let status: DeviceCompatibility | undefined = $state();
  let gameName = $state("");
  let showModal = $state(false);

  let details: DeckInfo[] = $derived.by(() => {
    try {
      const parsed = status?.info ? JSON.parse(status.info) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  export function open(data: DeviceCompatibility, name: string) {
    status = data;
    gameName = name;
    showModal = true;
  }

  const statusBadges = $derived({
    success: compatibilityCheckmark(deviceId),
    warning: deckPlayable,
    unsupported: deckUnsupported,
    info: '<span class="icon"></span>',
  });
</script>

<Modal class="bp-compatibility-modal" title="{title} Compatibility for {gameName}" bind:open={showModal}>
  {#if status}
    <h3>Status: {@html compatibilityRatingBadge(deviceId, status.rating)} {compatibilityRatingLabel(deviceId, status.rating)}</h3>
    {#if details.length > 0}
      <ul class="bp-compatibility-list">
        {#each details as info}
          <li class:info={info.type === "info"}>
            <span>{@html statusBadges[compatibilityMessageType(info)]}</span>
            <span>{localizeCompatibilityMessage(deviceId, info.message)}</span>
          </li>
        {/each}
      </ul>
    {:else}
      <div>No additional info available</div>
    {/if}
  {/if}
  {#snippet footer()}
    <button type="button" class="btn btn-default" onclick={() => (showModal = false)}>Close</button>
  {/snippet}
</Modal>

<style lang="scss">
  .bp-compatibility-list {
    list-style: none;
    padding-left: 16px;

    li {
      display: flex;
      margin-bottom: 4px;

      &.info {
        margin-top: 12px;
        font-style: italic;
      }

      :global(svg) {
        margin-right: 8px;
      }

      :global(.icon) {
        margin-right: 28px;
      }
    }
  }
</style>
