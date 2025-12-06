import { type Component, For } from "solid-js";
import type { FileFormat } from "@/lib/converter/converterFactory";
import { isFileFormat } from "@/shared/utils/typeGuards";
import styles from "./FormatSelector.module.css";

const FORMAT_OPTIONS: Array<{ value: FileFormat; label: string }> = [
  { value: "srt", label: "SRT" },
  { value: "vtt", label: "VTT" },
  { value: "txt", label: "TXT" },
  { value: "csv", label: "CSV" },
  { value: "lrc", label: "LRC" },
];

interface FormatSelectorProps {
  value: FileFormat;
  onChange: (format: FileFormat) => void;
  id?: string;
}

export const FormatSelector: Component<FormatSelectorProps> = (props) => (
  <div class={styles.formGroup}>
    <label for={props.id || "format"} class={styles.formLabel}>
      Format:
    </label>
    <select
      id={props.id || "format"}
      value={props.value}
      onChange={(e) => {
        const val = e.target.value;
        if (isFileFormat(val)) {
          props.onChange(val);
        }
      }}
      class={styles.formSelect}
    >
      <For each={FORMAT_OPTIONS}>
        {(option) => <option value={option.value}>{option.label}</option>}
      </For>
    </select>
  </div>
);
