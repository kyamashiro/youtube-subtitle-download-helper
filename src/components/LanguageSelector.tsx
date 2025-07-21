import { type Component, For } from "solid-js";
import styles from "./LanguageSelector.module.css";
import type { CaptionTrack } from "@/types/captionTrack";

interface LanguageSelectorProps {
  tracks: CaptionTrack[];
  value: string;
  onChange: (trackUrl: string) => void;
}

export const LanguageSelector: Component<LanguageSelectorProps> = (props) => (
  <div class={styles.formGroup}>
    <label for="language" class={styles.formLabel}>
      Language:
    </label>
    <select
      id="language"
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      class={styles.formSelect}
    >
      <For each={props.tracks}>
        {(track) => (
          <option value={track.baseUrl}>{track.name.simpleText}</option>
        )}
      </For>
    </select>
  </div>
);
