import { type Accessor, createSignal } from "solid-js";
import type { FileFormat } from "@/lib/converter/converterFactory";
import type { CaptionTrack } from "@/shared/types/captionTrack";
import { isFileFormat } from "@/shared/utils/typeGuards";
import { useSettings } from "./useSettings";

interface UseSubtitleSelectionProps {
  captionTracks: Accessor<CaptionTrack[]>;
}

export function useSubtitleSelection(props: UseSubtitleSelectionProps) {
  const [settings] = useSettings();

  // User overrides (start undefined)
  const [userSelectedTrack, setUserSelectedTrack] = createSignal<
    string | undefined
  >();
  const [userSelectedFormat, setUserSelectedFormat] = createSignal<
    FileFormat | undefined
  >();

  // Computed Default Format
  const defaultFormat = (): FileFormat => {
    const userSettings = settings();
    if (
      userSettings?.defaultFormat &&
      isFileFormat(userSettings.defaultFormat)
    ) {
      return userSettings.defaultFormat;
    }
    return "srt";
  };

  // Computed Default Track
  const defaultTrack = (): string | undefined => {
    const tracks = props.captionTracks();
    const userSettings = settings();

    if (tracks.length === 0) return undefined;

    // Wait for settings to be loaded to avoid race condition
    if (!userSettings) return undefined;

    if (
      userSettings.defaultLanguage &&
      userSettings.defaultLanguage !== "auto"
    ) {
      // Try to find preferred language
      const preferredTrack = tracks.find((track) => {
        try {
          const url = new URL(track.baseUrl);
          const lang = url.searchParams.get("lang");
          return lang === userSettings.defaultLanguage;
        } catch (error) {
          console.warn("Error parsing track URL:", error);
          return false;
        }
      });

      if (preferredTrack) {
        return preferredTrack.baseUrl;
      }
    }

    // Fallback to first track if auto or preferred not found
    return tracks[0]?.baseUrl;
  };

  // Final Selections (User > Default > Fallback)
  const selectedFormat = () => userSelectedFormat() ?? defaultFormat();

  const selectedTrack = () => {
    // If user selected something manually, use it
    const userSelect = userSelectedTrack();
    if (userSelect) return userSelect;

    // Otherwise use default logic
    return defaultTrack() ?? "";
  };

  return {
    selectedTrack,
    setSelectedTrack: setUserSelectedTrack,
    selectedFormat,
    setSelectedFormat: setUserSelectedFormat,
  };
}
