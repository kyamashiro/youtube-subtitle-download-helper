import { createSignal, onMount, onCleanup, type Accessor, type Setter } from "solid-js";
import type { SubtitleData } from "../types";

export function useSubtitleData(): [Accessor<SubtitleData | null>, Setter<SubtitleData | null>] {
  const [subtitleData, setSubtitleData] = createSignal<SubtitleData | null>(null);

  onMount(() => {
    const handleDataUpdate = (event: CustomEvent<SubtitleData>) => {
      setSubtitleData(event.detail);
    };

    window.addEventListener('subtitle-data-updated', handleDataUpdate as EventListener);
    
    onCleanup(() => {
      window.removeEventListener('subtitle-data-updated', handleDataUpdate as EventListener);
    });
  });

  return [subtitleData, setSubtitleData];
}