<script lang="ts">
  import { deckPlayable, deckUnsupported, deckUntested, deckVerified } from "@/assets/icons";
  import { deckMessageLoc } from "@/lib/linuxService";

  export let gameData: LinuxData;
  export let gameName: string;
  export let showModal = false;

  let deckInfo: DeckInfo[];

  const badges = {
    unknown: "",
    untested: deckUntested,
    unsupported: deckUnsupported,
    playable: deckPlayable,
    verified: deckVerified,
  };

  const statusBadges = {
    success: deckVerified,
    warning: deckPlayable,
    unsupported: deckUnsupported,
    info: '<span class="icon"></span>',
  };

  function hideModal() {
    showModal = false;
  }

  $: if (gameData?.deckInfo) {
    deckInfo = JSON.parse(gameData.deckInfo);
  }
</script>

<div class="bp-deckverified-modal" role="presentation" class:visible={showModal === true} on:click|self={hideModal}>
  <div class="modal-content">
    {#if gameData}
      <div class="modal-header">
        <h2 class="modal-header-heading">Steam Deck Compatibility for {gameName}</h2>
        <button type="button" aria-label="Close" on:click={hideModal}>
          <i class="fa fa-close" />
        </button>
      </div>
      <div class="modal-body">
        <h3>Status: {@html badges[gameData.deckRating]} {gameData.deckRating}</h3>
        {#if deckInfo.length > 0}
          <ul class="bp-deckverified-list">
            {#each deckInfo as info}
              <li class:info={info.type === "info"}>
                <span>{@html statusBadges[info.type]}</span>
                <span>
                  {#if info.message in deckMessageLoc}
                    {deckMessageLoc[info.message.replaceAll("#SteamDeckVerified_TestResult_", "")]}
                  {:else}
                    {info.message}
                  {/if}
                </span>
              </li>
            {/each}
          </ul>
        {:else}
          <div>No additional info available</div>
        {/if}
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" on:click={hideModal}>Close</button>
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .bp-deckverified-modal {
    position: fixed;
    top: 0;
    left: 0;
    visibility: hidden;
    opacity: 0;
    z-index: 2000;
    transition-duration: 0.2s;
    transition-property: visibility, opacity;
    transition-timing-function: ease;
    background-color: #00000080;
    padding: 16px;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (min-width: 768px) {
      padding: 64px;
    }

    &.visible {
      visibility: visible;
      opacity: 1;
    }

    .modal-content {
      display: flex;
      flex-direction: column;
      max-height: 100%;
      width: 100%;
      max-width: 700px;
    }

    .modal-header {
      display: flex;

      > button {
        align-self: flex-start;
        margin-left: auto;
      }

      > h2 {
        margin: 0;
      }

      .modal-header-heading {
        display: flex;
      }

      :global(svg) {
        flex-shrink: 0;
        margin-right: 8px;
        height: 39px;
      }
    }

    .modal-body {
      overflow: auto;

      h3 {
        margin-top: 0;
      }

      ul {
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
    }
  }
</style>
