import type { ExtensionSettings } from './types';
import { DEFAULT_SETTINGS } from './types';

export class SettingsStorage {
  static async getSettings(): Promise<ExtensionSettings> {
    try {
      const result = await chrome.storage.sync.get('settings');
      return { ...DEFAULT_SETTINGS, ...result.settings };
    } catch (error) {
      console.warn('Failed to load settings, using defaults:', error);
      return DEFAULT_SETTINGS;
    }
  }

  static async saveSettings(settings: Partial<ExtensionSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      await chrome.storage.sync.set({ settings: updatedSettings });
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  static async resetSettings(): Promise<void> {
    try {
      await chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
    } catch (error) {
      console.error('Failed to reset settings:', error);
      throw error;
    }
  }
}