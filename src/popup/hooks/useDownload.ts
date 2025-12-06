import { createSignal } from "solid-js";
import { getSubtitle } from "@/client/clientYoutube";
import {
  createConverter,
  type FileFormat,
} from "@/converter/converterFactory.ts";
import type { CaptionTrack } from "@/types/captionTrack.ts";

interface UseDownloadReturn {
  downloadError: () => string;
  download: (
    selectedTrack: string,
    captionTracks: CaptionTrack[],
    selectedFormat: FileFormat,
    videoTitle: string,
  ) => Promise<void>;
}

export function useDownload(): UseDownloadReturn {
  const [downloadError, setDownloadError] = createSignal<string>("");

  const download = async (
    selectedTrack: string,
    captionTracks: CaptionTrack[],
    selectedFormat: FileFormat,
    videoTitle: string,
  ): Promise<void> => {
    console.log("Starting download with:", {
      selectedTrack,
      selectedFormat,
      videoTitle,
    });

    const selectedTrackData = captionTracks.find(
      (track) => track.baseUrl === selectedTrack,
    );

    if (!selectedTrackData) {
      console.error("Selected track data not found");
      return;
    }

    console.log("Selected track data:", selectedTrackData);

    try {
      console.log(
        "Requesting subtitle download from content script:",
        selectedTrack,
      );

      // Request subtitle download from content script
      const result = await getSubtitle(selectedTrack);
      if (!result.success) {
        throw result.error;
      }
      const xmlResponse = result.value;

      console.log("Converting to format:", selectedFormat);
      const converter = createConverter(selectedFormat);
      const content = selectedTrackData.name.simpleText;

      console.log(
        "Starting conversion with filename:",
        `${videoTitle} - ${content}`,
      );
      await converter.convert(xmlResponse, `${videoTitle} - ${content}`);

      console.log("Download completed successfully");
    } catch (error: unknown) {
      console.error("Download error:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      console.error("Error details:", {
        message: errorMessage,
        stack: errorStack,
        selectedTrack,
      });
      setDownloadError(`Download failed: ${errorMessage}`);
    }
  };

  return {
    downloadError,
    download,
  };
}
