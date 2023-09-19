<script lang="ts">
  import { deckPlayable, deckUnsupported, deckUntested, deckVerified } from "@/assets/icons";

  export let gameData: LinuxData;
  export let gameName: string;
  export let showModal = false;

  let deckInfo: DeckInfo[];

  const badges = {
    unknown: '',
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
  }
  
  const messageLoc: any = {
    "SteamOSDoesSupport": "Steam Deck supports this game",
    "SteamOSDoesSupportSingleplayer": "Steam Deck supports singleplayer gameplay for this game",
    "SteamOSDoesSupportLocalMultiplayer": "Steam Deck supports local multiplayer gameplay for this game",
    "SteamOSDoesSupportOnlineMultiplayer": "Steam Deck supports online multiplayer gameplay for this game",
    "LauncherNonblockingFunctionalityIssues": "This game requires a launcher, and some non-critical components of that launcher may not function",
    "InterfaceTextIsNotLegible_Launcher": "This game requires a launcher, and some interface text in that launcher is small and may be difficult to read",
    "DefaultConfigurationIsNotPerformant": "This game requires manual configuration of graphics settings to perform well on Steam Deck",
    "GameFunctionalityMinorFailures": "Some non-critical components of this game may not function",
    "NativeResolutionNotSupported": "This game doesn't support Steam Deck's native display resolution and may experience degraded performance",
    "DisplayOutputHasNonblockingIssues": "This game has minor graphics\/display issues on Steam Deck",
    "AudioOutputHasNonblockingIssues": "This game has minor audio issues on Steam Deck",
    "VideoPlaybackHasNonblockingIssues": "Some in-game movie content may be missing",
    "SteamOSDoesNotSupportSingleplayer": "Steam Deck doesn't support singleplayer gameplay for this game",
    "SteamOSDoesNotSupportLocalMultiplayer": "Steam Deck doesn't support local multiplayer gameplay for this game",
    "SteamOSDoesNotSupportOnlineMultiplayer": "Steam Deck doesn't support online multiplayer gameplay for this game",
    "UnsupportedAntiCheat_Other": "This game is unsupported on Steam Deck due to use of an unsupported anti-cheat",
    "UnsupportedAntiCheatConfiguration": "This product's anti-cheat is not configured to support Steam Deck",
    "UnsupportedGraphicsPerformance": "This game's graphics settings cannot be configured to run well on Steam Deck",
    "ExternalControllersNotSupportedLocalMultiplayer": "This game does not support attached controllers for local multiplayer",
    "DefaultControllerConfigFullyFunctional": "All functionality is accessible when using the default controller configuration",
    "ControllerGlyphsMatchDeckDevice": "This game shows Steam Deck controller icons",
    "InterfaceTextIsLegible": "In-game interface text is legible on Steam Deck",
    "DefaultConfigurationIsPerformant": "This game's default graphics configuration performs well on Steam Deck",
    "TextInputDoesNotAutomaticallyInvokesKeyboard": "Entering some text requires manually invoking the on-screen keyboard",
    "DeviceCompatibilityWarningsShown": "This game displays compatibility warnings when running on Steam Deck, but runs fine",
    "DefaultControllerConfigNotFullyFunctional": "Some functionality is not accessible when using the default controller configuration, requiring use of the touchscreen or virtual keyboard, or a community configuration",
    "ControllerGlyphsDoNotMatchDeckDevice": "This game sometimes shows mouse, keyboard, or non-Steam-Deck controller icons",
    "InterfaceTextIsNotLegible": "Some in-game text is small and may be difficult to read",
    "LauncherInteractionIssues": "This game's launcher\/setup tool may require the touchscreen or virtual keyboard, or have difficult to read text",
    "GameOrLauncherDoesntExitCleanly": "This game does not exit cleanly, and may require you to manually quit via the Steam overlay",
    "CrossPlatformCloudSavesNotSupported": "This game does not support cross-platform saved games",
    "ExternalControllersNotSupportedPrimaryPlayer": "This game does not support attached controllers for the primary player",
    "FirstTimeSetupRequiresActiveInternetConnection": "This game's first-time setup requires an active Internet connection",
    "SingleplayerGameplayRequiresActiveInternetConnection": "Singleplayer gameplay requires an active Internet connection",
    "SteamOSDoesNotSupport": "Valve is still working on adding support for this game on Steam Deck",
    "SteamOSDoesNotSupport_VR": "Steam Deck does not support VR games",
    "NativeResolutionNotDefault": "This game supports Steam Deck's native display resolution but does not set it by default and may require you to configure the display resolution manually",
    "AuxFunctionalityNotAccessible_MapEditor": "Some auxiliary functionality is not accessible on Steam Deck: map editor",
    "GamepadNotEnabledByDefault": "This game requires manually enabling controller support using in-game settings",
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
          <li class:info={info.type === 'info'}>
            <span>{@html statusBadges[info.type]}</span>
            <span>
              {#if info.message in messageLoc}
                {messageLoc[info.message]}
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