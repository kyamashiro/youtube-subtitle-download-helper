import {
  type Accessor,
  createSignal,
  onCleanup,
  onMount,
  type Setter,
} from "solid-js";
import { isSubtitleData } from "@/shared/utils/typeGuards";
import type { SubtitleData } from "../types";

export function useSubtitleData(): [
  Accessor<SubtitleData | null>,
  Setter<SubtitleData | null>,
] {
  const [subtitleData, setSubtitleData] = createSignal<SubtitleData | null>(
    null,
  );

  onMount(() => {
    const handleDataUpdate = (event: Event) => {
      if (event instanceof CustomEvent && isSubtitleData(event.detail)) {
        setSubtitleData(event.detail);
      }
    };

    window.addEventListener("subtitle-data-updated", handleDataUpdate);

    onCleanup(() => {
      window.removeEventListener("subtitle-data-updated", handleDataUpdate);
    });
  });

  return [subtitleData, setSubtitleData];
}
