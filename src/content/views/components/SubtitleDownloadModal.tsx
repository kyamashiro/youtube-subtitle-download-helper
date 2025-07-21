import {
  type Component,
  createEffect,
  createMemo,
  createSignal,
  type JSX,
} from "solid-js";
import { ClientYoutube } from "@/client/clientYoutube";
import { FormatSelector } from "@/components/FormatSelector";
import { LanguageSelector } from "@/components/LanguageSelector";
import {
  ConverterFactory,
  type FileFormat,
} from "@/converter/converterFactory";
import type { ModalProps } from "../types";

export const SubtitleDownloadModal: Component<ModalProps> = (props) => {
  const [selectedTrack, setSelectedTrack] = createSignal("");
  const [selectedFormat, setSelectedFormat] = createSignal<FileFormat>("csv");

  // Initialize selected track
  createEffect(() => {
    const tracks = props.subtitleData.captionTrackList;
    if (tracks.length > 0 && !selectedTrack()) {
      setSelectedTrack(tracks[0].baseUrl);
    }
  });

  // Memoized selected track data
  const selectedTrackData = createMemo(() =>
    props.subtitleData.captionTrackList.find(
      (track) => track.baseUrl === selectedTrack(),
    ),
  );

  const handleDownload = async () => {
    const trackData = selectedTrackData();
    if (!trackData) return;

    try {
      const xmlResponse = await ClientYoutube.getSubtitle(selectedTrack());
      const converterFactory = new ConverterFactory();
      const converter = converterFactory.create(selectedFormat());
      const filename = `${props.subtitleData.videoTitle} - ${trackData.name.simpleText}`;

      await converter.convert(xmlResponse, filename);
      props.onClose();
    } catch (error: any) {
      console.error("Download error:", error);
    }
  };

  const handleBackdropClick: JSX.EventHandler<HTMLDivElement, MouseEvent> = (
    e,
  ) => {
    if (e.target === e.currentTarget) {
      props.onClose();
    }
  };

  return (
    <div class="subtitle-modal-overlay" onClick={handleBackdropClick}>
      <div class="subtitle-modal-content">
        <h2 class="subtitle-modal-header">Download Subtitles</h2>

        <LanguageSelector
          tracks={props.subtitleData.captionTrackList}
          value={selectedTrack()}
          onChange={setSelectedTrack}
        />

        <FormatSelector value={selectedFormat()} onChange={setSelectedFormat} />

        <div class="subtitle-button-container">
          <button
            type="button"
            onClick={props.onClose}
            class="subtitle-button subtitle-button-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!selectedTrackData()}
            class={`subtitle-button subtitle-button-download`}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};
