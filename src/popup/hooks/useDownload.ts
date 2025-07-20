import { createSignal } from "solid-js";
import { ClientYoutube } from "../../client/clientYoutube";
import { ConverterFactory, type FileFormat } from "../../converter/converterFactory";
import type { CaptionTrack } from "../../type/captionTrack";

interface UseDownloadReturn {
  isDownloading: () => boolean;
  downloadError: () => string;
  download: (
    selectedTrack: string,
    captionTracks: CaptionTrack[],
    selectedFormat: FileFormat,
    videoTitle: string
  ) => Promise<void>;
}

export function useDownload(): UseDownloadReturn {
  const [isDownloading, setIsDownloading] = createSignal<boolean>(false);
  const [downloadError, setDownloadError] = createSignal<string>("");

  const download = async (
    selectedTrack: string,
    captionTracks: CaptionTrack[],
    selectedFormat: FileFormat,
    videoTitle: string
  ): Promise<void> => {
    const selectedTrackData = captionTracks.find(
      (track) => track.baseUrl === selectedTrack
    );

    if (!selectedTrackData) {
      setDownloadError("No track selected");
      return;
    }

    setIsDownloading(true);
    setDownloadError("");

    try {
      const client = new ClientYoutube();
      const xmlResponse = await client.getSubtitle(selectedTrack);

      if (!xmlResponse) {
        throw new Error("Response empty.");
      }

      const converterFactory = new ConverterFactory();
      const converter = converterFactory.create(selectedFormat);
      const content = selectedTrackData.name.simpleText;
      converter.convert(xmlResponse, `${videoTitle} - ${content}`);
    } catch (error) {
      console.log(error);
      setDownloadError(`Download failed: ${error}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    isDownloading,
    downloadError,
    download,
  };
}