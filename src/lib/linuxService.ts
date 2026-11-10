import { deckPlayable, deckUnsupported, deckUntested, deckVerified, steamOsCompatible } from "@/assets/icons";

const RATING_BADGES: Record<CompatibilityRating, string> = {
  unknown: "",
  untested: deckUntested,
  unsupported: deckUnsupported,
  playable: deckPlayable,
  verified: deckVerified,
};

const DEVICE_WORDING: Record<CompatibilityDeviceId, Record<"name" | "device" | "controller", string>> = {
  deck: { name: "Steam Deck", device: "Steam Deck", controller: "Steam Deck" },
  steamos: { name: "SteamOS", device: "SteamOS", controller: "Steam" },
  steammachine: { name: "Steam Machine", device: "Steam Machine", controller: "Steam Controller" },
  steamframe: { name: "Steam Frame", device: "Steam Frame in standalone mode", controller: "Steam Frame controller" },
};

const MESSAGES: Record<string, string> = {
  SteamOSDoesSupport: "{name} supports this game",
  SteamOSDoesSupportSingleplayer: "{name} supports singleplayer gameplay for this game",
  SteamOSDoesSupportLocalMultiplayer: "{name} supports local multiplayer gameplay for this game",
  SteamOSDoesSupportOnlineMultiplayer: "{name} supports online multiplayer gameplay for this game",
  LauncherNonblockingFunctionalityIssues: "This game requires a launcher, and some non-critical components of that launcher may not function",
  InterfaceTextIsNotLegible_Launcher: "This game requires a launcher, and some interface text in that launcher is small and may be difficult to read",
  DefaultConfigurationIsNotPerformant: "This game requires manual configuration of graphics settings to perform well on {device}",
  GameFunctionalityMinorFailures: "Some non-critical components of this game may not function",
  NativeResolutionNotSupported: "This game doesn't support {name}'s native display resolution and may experience degraded performance",
  DisplayOutputHasNonblockingIssues: "This game has minor graphics/display issues on {device}",
  AudioOutputHasNonblockingIssues: "This game has minor audio issues on {device}",
  VideoPlaybackHasNonblockingIssues: "Some in-game movie content may be missing or have playback issues",
  SteamOSDoesNotSupportSingleplayer: "{name} doesn't support singleplayer gameplay for this game",
  SteamOSDoesNotSupportLocalMultiplayer: "{name} doesn't support local multiplayer gameplay for this game",
  SteamOSDoesNotSupportOnlineMultiplayer: "{name} doesn't support online multiplayer gameplay for this game",
  UnsupportedAntiCheat_Other: "This game is unsupported on {device} due to use of an unsupported anti-cheat or multiplayer service",
  UnsupportedAntiCheatConfiguration: "This game's anti-cheat is not configured to support {device}",
  UnsupportedGraphicsPerformance: "This game's graphics settings cannot be configured to run well on {device}",
  ExternalControllersNotSupportedLocalMultiplayer: "This game does not support external Bluetooth/USB controllers on {device} for local multiplayer",
  DefaultControllerConfigFullyFunctional: "All functionality is accessible when using the default controller configuration",
  ControllerGlyphsMatchDeckDevice: "This game shows Steam Deck controller icons",
  ControllerGlyphsMatchDevice: "This game displays {controller} button icons",
  InterfaceTextIsLegible: "In-game interface text is legible on {device}",
  DefaultConfigurationIsPerformant: "This game's default graphics configuration performs well on {device}",
  TextInputDoesNotAutomaticallyInvokesKeyboard: "Entering some text requires manually invoking the on-screen keyboard",
  DeviceCompatibilityWarningsShown: "This game displays compatibility warnings when running on {device}, but runs fine",
  DefaultControllerConfigNotFullyFunctional: "Some functionality is not accessible when using the default controller configuration, requiring use of the touchscreen or virtual keyboard, or a community configuration",
  ControllerGlyphsDoNotMatchDeckDevice: "This game sometimes shows mouse, keyboard, or non-Steam-Deck controller icons",
  ControllerGlyphsDoNotMatchDevice: "This game sometimes displays mouse, keyboard or other controllers' button icons",
  InterfaceTextIsNotLegible: "Some in-game text is small and may be difficult to read",
  LauncherInteractionIssues: "This game's launcher/setup tool may require the touchscreen or virtual keyboard, or have difficult to read text",
  GameOrLauncherDoesntExitCleanly: "This game does not exit cleanly and may require you to manually quit via the Steam overlay",
  GameStartupFunctional: "This game runs successfully on {device}",
  CrossPlatformCloudSavesNotSupported: "This game does not support cross-platform saved games",
  ExternalControllersNotSupportedPrimaryPlayer: "This game does not default to external Bluetooth/USB controllers on {device}, and may require manually switching the active controller via the Quick Access Menu",
  FirstTimeSetupRequiresActiveInternetConnection: "This game's first-time setup requires an active Internet connection",
  SingleplayerGameplayRequiresActiveInternetConnection: "Singleplayer gameplay requires an active Internet connection",
  SteamOSDoesNotSupport: "Valve is still working on adding support for this game on {device}",
  SteamOSDoesNotSupport_VR: "{name} does not support VR games",
  NativeResolutionNotDefault: "This game supports {name}'s native display resolution but does not set it by default and may require you to configure the display resolution manually",
  AuxFunctionalityNotAccessible_MapEditor: "Some auxiliary functionality is not accessible on {device}: map editor",
  GamepadNotEnabledByDefault: "This game requires manually enabling controller support using in-game settings",
  SteamOSDoesNotSupport_Retired: "This game has been retired or is no longer in a playable state and is not supported on {device}",
  SimultaneousInputGyroTrackpadFriendly: "This game supports using the gyro/trackpad in mouse mode for camera controls with gamepad controls for movement",
  SteamOSDoesNotSupport_Software: "This is a Software title and is not supported on {device}",
  MultiWindowAppAutomaticallySetsFocus: "This game uses multiple windows and may require you to focus the appropriate windows manually via the Steam overlay",
  DisplayOutputNotCorrectlyScaled: "This game is incorrectly scaled on {device} and may require you to configure the display resolution manually",
  NotFullyFunctionalWithoutExternalKeyboard: "Parts of this game would benefit from using an external keyboard",
  CloudSavesNotEnabledByDefault: "This game requires manually enabling Steam Cloud support for saved games using in-game settings",
  ResumeFromSleepNotFunctional: "This game may experience temporary issues after sleeping on {device}",
  NotFullyFunctionalWithoutExternalWebcam: "This game requires certain external devices: Webcam",
  NotFullyFunctionalWithoutExternalUSBGuitar: "This game requires certain external devices: USB Guitar",
  SteamOSDoesNotSupport_OperatingSystem: "This game requires an operating system that is not currently supported on {device}",
  HDRMustBeManuallyEnabled: "This game supports HDR but it must be manually enabled using in-game settings",
  VRStreamingIsPerformant: "This VR game streams well from {device}",
  VRStreamingNotPerformant: "This VR game needs its graphics settings adjusted to stream well from {device}",
  VRStreamingNotSupported: "This VR game can't be streamed from {device}",
  VRStreamingUnsupportedGraphicsPerformance: "This VR game's graphics settings can't be adjusted enough to stream well from {device}",
};

const DEVICE_MESSAGES: Partial<Record<CompatibilityDeviceId, Record<string, string>>> = {
  steamos: {
    LauncherInteractionIssues: "This game's launcher or setup tool may need a touchscreen or virtual keyboard, or have hard-to-read text",
  },
  steammachine: {
    LauncherInteractionIssues: "This game's launcher or setup tool may need a touchscreen or virtual keyboard",
  },
  steamframe: {
    LauncherInteractionIssues: "This game's launcher or setup tool may need the virtual keyboard, or have hard-to-read text",
    DefaultControllerConfigNotFullyFunctional: "Some functionality can't be reached with the default controller configuration and needs the virtual keyboard or a community configuration",
  },
};

const TOKEN_PREFIX = /^#?[^_]+_TestResult_/;

export function compatibilityMessageType(info: DeckInfo): DeckInfo["type"] {
  return info.message.replace(TOKEN_PREFIX, "") === "GameStartupFunctional" ? "success" : info.type;
}

export function localizeCompatibilityMessage(deviceId: CompatibilityDeviceId, message: string): string {
  const token = message.replace(TOKEN_PREFIX, "");
  const messages = { ...MESSAGES, ...DEVICE_MESSAGES[deviceId] };

  if (!Object.hasOwn(messages, token)) {
    return message;
  }

  const wording = DEVICE_WORDING[deviceId];

  return messages[token].replace("{name}", wording.name).replace("{device}", wording.device).replace("{controller}", wording.controller);
}

export function compatibilityRatingLabel(deviceId: CompatibilityDeviceId, rating: CompatibilityRating): string {
  return deviceId === "steamos" && rating === "playable" ? "compatible" : rating;
}

export function compatibilityCheckmark(deviceId: CompatibilityDeviceId): string {
  return deviceId === "steamos" ? steamOsCompatible : deckVerified;
}

export function compatibilityRatingBadge(deviceId: CompatibilityDeviceId, rating: CompatibilityRating): string {
  return deviceId === "steamos" && rating === "playable" ? steamOsCompatible : RATING_BADGES[rating];
}
