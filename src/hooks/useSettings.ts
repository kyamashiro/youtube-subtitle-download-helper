import { createSignal, onMount, type Accessor } from "solid-js";
import type { ExtensionSettings } from "@/options/types";
import { SettingsStorage } from "@/options/storage";

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
