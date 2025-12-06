import { type Component, createSignal, For, onMount, Show } from "solid-js";
import { FormatSelector } from "@/shared/components/FormatSelector";
import { FileFormat } from "@/lib/converter/converterFactory";
import { SettingsStorage } from "./storage";
import type { ExtensionSettings } from "./types";
import { LANGUAGE_OPTIONS } from "./types";
import "./App.css";

export const OptionsApp: Component = () => {
  const [settings, setSettings] = createSignal<ExtensionSettings | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [saving, setSaving] = createSignal(false);
  const [message, setMessage] = createSignal<string>("");

  onMount(async () => {
    try {
      const loadedSettings = await SettingsStorage.getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error("Failed to load settings:", error);
      setMessage("Failed to load settings");
    } finally {
      setLoading(false);
    }
  });

  const handleSave = async () => {
    const currentSettings = settings();
    if (!currentSettings) return;

    setSaving(true);
    try {
      await SettingsStorage.saveSettings(currentSettings);
      setMessage("Settings saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setMessage("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset all settings to default?")) {
      return;
    }

    setSaving(true);
    try {
      await SettingsStorage.resetSettings();
      const resetSettings = await SettingsStorage.getSettings();
      setSettings(resetSettings);
      setMessage("Settings reset to default");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to reset settings:", error);
      setMessage("Failed to reset settings");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof ExtensionSettings>(
    key: K,
    value: ExtensionSettings[K],
  ) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : null));
  };

  return (
    <div class="options-container">
      <header class="options-header">
        <h1>YouTube Subtitle Download Helper</h1>
        <p>Configure your subtitle download preferences</p>
      </header>

      <Show when={loading()}>
        <div class="loading-spinner">Loading settings...</div>
      </Show>

      <Show when={!loading() && settings()}>
        <main class="options-content">
          <section class="settings-section">
            <h2>Download Settings</h2>

            <div class="setting-group">
              <label class="setting-label" for="default-format">
                Default Format:
              </label>
              <FormatSelector
                id="default-format"
                value={settings()?.defaultFormat ?? FileFormat.SRT}
                onChange={(format) => updateSetting("defaultFormat", format)}
              />
              <small class="setting-description">
                The default format that will be selected when downloading
                subtitles
              </small>
            </div>

            <div class="setting-group">
              <label class="setting-label" for="default-language">
                Default Language:
              </label>
              <select
                id="default-language"
                class="setting-select"
                value={settings()?.defaultLanguage}
                onChange={(e) =>
                  updateSetting("defaultLanguage", e.target.value)
                }
              >
                <For each={LANGUAGE_OPTIONS}>
                  {(option) => (
                    <option value={option.value}>{option.label}</option>
                  )}
                </For>
              </select>
              <small class="setting-description">
                The preferred language that will be auto-selected when available
              </small>
            </div>
          </section>

          <Show when={message()}>
            <div
              class={`message ${message().includes("Failed") ? "error" : "success"}`}
            >
              {message()}
            </div>
          </Show>

          <div class="options-actions">
            <button
              type="button"
              class="btn btn-primary"
              onClick={handleSave}
              disabled={saving()}
            >
              {saving() ? "Saving..." : "Save Settings"}
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              onClick={handleReset}
              disabled={saving()}
            >
              Reset to Default
            </button>
          </div>
        </main>
      </Show>
    </div>
  );
};
