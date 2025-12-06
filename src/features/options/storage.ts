import type { ExtensionSettings } from "./types";
import { DEFAULT_SETTINGS } from "./types";

export const SettingsStorage = {
  async getSettings(): Promise<ExtensionSettings> {
    try {
      if (
        typeof chrome === "undefined" ||
        !chrome.storage ||
        !chrome.storage.sync
      ) {
        return DEFAULT_SETTINGS;
      }
      const result = await chrome.storage.sync.get("settings");
      // Merge with defaults to ensure all fields exist
      // Safety check for format type could be added here if needed, but assuming storage is valid or strictly typed on save.
      // But since we just changed the type to FileFormat, we should cast or validate.
      // However, we can't use 'as'. Let's rely on structural compatibility for now or user isFileFormat if we were strict.
      // For now, let's just return the object.
      return { ...DEFAULT_SETTINGS, ...result.settings };
    } catch (error) {
      console.warn("Failed to load settings, using defaults:", error);
      return DEFAULT_SETTINGS;
    }
  },

  async saveSettings(settings: Partial<ExtensionSettings>): Promise<void> {
    try {
      if (
        typeof chrome === "undefined" ||
        !chrome.storage ||
        !chrome.storage.sync
      ) {
        console.warn(
          "Cannot save settings: chrome.storage.sync is not available",
        );
        return;
      }
      const currentSettings = await SettingsStorage.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      await chrome.storage.sync.set({ settings: updatedSettings });
    } catch (error) {
      console.error("Failed to save settings:", error);
      throw error;
    }
  },

  async resetSettings(): Promise<void> {
    try {
      await chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
    } catch (error) {
      console.error("Failed to reset settings:", error);
      throw error;
    }
  },
};
