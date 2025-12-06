import { createSignal, createEffect, type Accessor } from "solid-js";
import type { FileFormat } from "@/converter/converterFactory";
import type { CaptionTrack } from "@/types/captionTrack";
import { useSettings } from "./useSettings";

interface UseSubtitleSelectionProps {
  captionTracks: Accessor<CaptionTrack[]>;
}

export function useSubtitleSelection(props: UseSubtitleSelectionProps) {
  const [selectedTrack, setSelectedTrack] = createSignal<string>("");
  const [selectedFormat, setSelectedFormat] = createSignal<FileFormat>(
    "srt" as FileFormat,
  );
  const [settings] = useSettings();
  const [initialized, setInitialized] = createSignal(false);

  // Set default format from settings when settings are loaded
  createEffect(() => {
    const userSettings = settings();
    if (!userSettings) return;

    if (userSettings?.defaultFormat && !initialized()) {
      console.log(
        "Setting default format from settings:",
        userSettings.defaultFormat,
      );
      setSelectedFormat(userSettings.defaultFormat as FileFormat);
      setInitialized(true);
    }
  });

  // Initialize selected track based on language preference
  createEffect(() => {
    const tracks = props.captionTracks();
    const userSettings = settings();
    
    // Wait for settings to be loaded
    if (!userSettings) return;

    if (tracks.length > 0 && !selectedTrack()) {
      console.log("Initializing track selection with settings:", userSettings);

      if (
        userSettings?.defaultLanguage &&
        userSettings.defaultLanguage !== "auto"
      ) {
        // Try to find preferred language
        const preferredTrack = tracks.find((track) => {
          // Extract language code from track URL
          try {
            const url = new URL(track.baseUrl);
            const lang = url.searchParams.get("lang");
            console.log(
              "Checking track language:",
              lang,
              "against preference:",
              userSettings.defaultLanguage,
            );
            return lang === userSettings.defaultLanguage;
          } catch (error) {
            console.warn("Error parsing track URL:", error);
            return false;
          }
        });

        if (preferredTrack) {
          console.log("Found preferred language track:", preferredTrack);
          setSelectedTrack(preferredTrack.baseUrl);
        } else {
          console.log("Preferred language not found, using first track");
          setSelectedTrack(tracks[0].baseUrl);
        }
      } else {
        console.log("Using auto selection (first track)");
        setSelectedTrack(tracks[0].baseUrl);
      }
    }
  });

  return {
    selectedTrack,
    setSelectedTrack,
    selectedFormat,
    setSelectedFormat,
  };
}
