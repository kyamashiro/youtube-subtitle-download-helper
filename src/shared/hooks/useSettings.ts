import { type Accessor, createSignal, onMount } from "solid-js";
import { SettingsStorage } from "@/features/options/storage";
import type { ExtensionSettings } from "@/features/options/types";

export function useSettings(): [
  Accessor<ExtensionSettings | null>,
  () => Promise<void>,
] {
  const [settings, setSettings] = createSignal<ExtensionSettings | null>(null);

  const loadSettings = async () => {
    try {
      const loadedSettings = await SettingsStorage.getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  onMount(() => {
    loadSettings();
  });

  return [settings, loadSettings];
}
