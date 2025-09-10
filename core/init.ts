import {
  setDebug,
  mountBackButton,
  restoreInitData,
  init as initSDK,
  mountMiniAppSync,
  bindThemeParamsCssVars,
  mountViewport,
  bindViewportCssVars,
  mockTelegramEnv,
  type ThemeParams,
  themeParamsState,
  retrieveLaunchParams,
  emitEvent,
} from "@telegram-apps/sdk-react";

/**
 * Initializes the application and configures its dependencies.
 */
export async function init(options: {
  debug: boolean;
  mockForMacOS: boolean;
}): Promise<void> {
  // Set @telegram-apps/sdk-react debug mode and initialize it.
  setDebug(options.debug);
  initSDK();

  mountBackButton.ifAvailable();
  restoreInitData();

  if (mountMiniAppSync.isAvailable()) {
    mountMiniAppSync();
  }

  if (mountViewport.isAvailable()) {
    mountViewport().then(() => {
      bindViewportCssVars();
    });
  }
}
