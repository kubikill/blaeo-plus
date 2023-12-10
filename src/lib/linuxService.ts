import { GM_getValue, GM_setValue, GM_xmlhttpRequest } from "vite-plugin-monkey/dist/client";

export let linuxData = JSON.parse(GM_getValue("linux-data", "{}") || "{}") as LinuxDataList;
export let linuxLastUpdate = new Date(GM_getValue("linux-last-update", 0));

export function syncLinuxGames() {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: "https://blaeoplus.kubikill.dev/hltb/linux-list",
      nocache: true,
      responseType: "json",
      anonymous: true,
      onload: (response) => {
        if (response.status === 200) {
          linuxData = response.response;
          GM_setValue("linux-data", response.responseText);

          resolve(response.responseText);
        } else {
          reject(`Failed to fetch Linux info from backend. Details: ${response.responseText}`);
        }
      },
      onerror: (error) => {
        reject(error);
      },
    });
  });
}

export async function syncLinux() {
  let linuxGames = syncLinuxGames();

  await linuxGames;

  linuxLastUpdate = new Date();
  GM_setValue("linux-last-update", Date.now());
}

export const deckMessageLoc: any = {
  SteamOSDoesSupport: "Steam Deck supports this game",
  SteamOSDoesSupportSingleplayer: "Steam Deck supports singleplayer gameplay for this game",
  SteamOSDoesSupportLocalMultiplayer: "Steam Deck supports local multiplayer gameplay for this game",
  SteamOSDoesSupportOnlineMultiplayer: "Steam Deck supports online multiplayer gameplay for this game",
  LauncherNonblockingFunctionalityIssues: "This game requires a launcher, and some non-critical components of that launcher may not function",
  InterfaceTextIsNotLegible_Launcher: "This game requires a launcher, and some interface text in that launcher is small and may be difficult to read",
  DefaultConfigurationIsNotPerformant: "This game requires manual configuration of graphics settings to perform well on Steam Deck",
  GameFunctionalityMinorFailures: "Some non-critical components of this game may not function",
  NativeResolutionNotSupported: "This game doesn't support Steam Deck's native display resolution and may experience degraded performance",
  DisplayOutputHasNonblockingIssues: "This game has minor graphics/display issues on Steam Deck",
  AudioOutputHasNonblockingIssues: "This game has minor audio issues on Steam Deck",
  VideoPlaybackHasNonblockingIssues: "Some in-game movie content may be missing",
  SteamOSDoesNotSupportSingleplayer: "Steam Deck doesn't support singleplayer gameplay for this game",
  SteamOSDoesNotSupportLocalMultiplayer: "Steam Deck doesn't support local multiplayer gameplay for this game",
  SteamOSDoesNotSupportOnlineMultiplayer: "Steam Deck doesn't support online multiplayer gameplay for this game",
  UnsupportedAntiCheat_Other: "This game is unsupported on Steam Deck due to use of an unsupported anti-cheat",
  UnsupportedAntiCheatConfiguration: "This product's anti-cheat is not configured to support Steam Deck",
  UnsupportedGraphicsPerformance: "This game's graphics settings cannot be configured to run well on Steam Deck",
  ExternalControllersNotSupportedLocalMultiplayer: "This game does not support attached controllers for local multiplayer",
  DefaultControllerConfigFullyFunctional: "All functionality is accessible when using the default controller configuration",
  ControllerGlyphsMatchDeckDevice: "This game shows Steam Deck controller icons",
  InterfaceTextIsLegible: "In-game interface text is legible on Steam Deck",
  DefaultConfigurationIsPerformant: "This game's default graphics configuration performs well on Steam Deck",
  TextInputDoesNotAutomaticallyInvokesKeyboard: "Entering some text requires manually invoking the on-screen keyboard",
  DeviceCompatibilityWarningsShown: "This game displays compatibility warnings when running on Steam Deck, but runs fine",
  DefaultControllerConfigNotFullyFunctional: "Some functionality is not accessible when using the default controller configuration, requiring use of the touchscreen or virtual keyboard, or a community configuration",
  ControllerGlyphsDoNotMatchDeckDevice: "This game sometimes shows mouse, keyboard, or non-Steam-Deck controller icons",
  InterfaceTextIsNotLegible: "Some in-game text is small and may be difficult to read",
  LauncherInteractionIssues: "This game's launcher/setup tool may require the touchscreen or virtual keyboard, or have difficult to read text",
  GameOrLauncherDoesntExitCleanly: "This game does not exit cleanly, and may require you to manually quit via the Steam overlay",
  CrossPlatformCloudSavesNotSupported: "This game does not support cross-platform saved games",
  ExternalControllersNotSupportedPrimaryPlayer: "This game does not support attached controllers for the primary player",
  FirstTimeSetupRequiresActiveInternetConnection: "This game's first-time setup requires an active Internet connection",
  SingleplayerGameplayRequiresActiveInternetConnection: "Singleplayer gameplay requires an active Internet connection",
  SteamOSDoesNotSupport: "Valve is still working on adding support for this game on Steam Deck",
  SteamOSDoesNotSupport_VR: "Steam Deck does not support VR games",
  NativeResolutionNotDefault: "This game supports Steam Deck's native display resolution but does not set it by default and may require you to configure the display resolution manually",
  AuxFunctionalityNotAccessible_MapEditor: "Some auxiliary functionality is not accessible on Steam Deck: map editor",
  GamepadNotEnabledByDefault: "This game requires manually enabling controller support using in-game settings",
  SteamOSDoesNotSupport_Retired: "This game has been retired or is no longer in a playable state and is not supported on Steam Deck",
  SimultaneousInputGyroTrackpadFriendly: "This game supports using the gyro/trackpad in mouse mode for camera controls with gamepad controls for movement",
  SteamOSDoesNotSupport_Software: "This is a Software title and is not supported on Steam Deck",
  MultiWindowAppAutomaticallySetsFocus: "This game uses multiple windows and may require you to focus the appropriate windows manually via the Steam overlay",
  DisplayOutputNotCorrectlyScaled: "This game is incorrectly scaled on Steam Deck and may require you to configure the display resolution manually",
  NotFullyFunctionalWithoutExternalKeyboard: "Parts of this game would benefit from using an external keyboard",
  CloudSavesNotEnabledByDefault: "This game requires manually enabling Steam Cloud support for saved games using in-game settings",
  ResumeFromSleepNotFunctional: "This game may experience temporary issues after sleeping on Steam Deck",
};

function debugDeckMessages() {
  for (let game in linuxData) {
    const deckInfo = JSON.parse(linuxData[game].deckInfo);

    if (!Array.isArray(deckInfo)) {
      continue;
    }

    for (let info of deckInfo) {
      info.message = info.message.replaceAll("#SteamDeckVerified_TestResult_", "");
      if (!(info.message in deckMessageLoc)) {
        console.log(`Unknown message: ${info.message}, game: ${game}`);
      }
    }
  }
}
