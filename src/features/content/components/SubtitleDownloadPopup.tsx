import type { Component, JSX } from "solid-js";
import { FormatSelector } from "@/shared/components/FormatSelector";
import { LanguageSelector } from "@/shared/components/LanguageSelector";
import { useDownload } from "@/shared/hooks/useDownload";
import { useSubtitleSelection } from "@/shared/hooks/useSubtitleSelection";
import type { ModalProps } from "../types";

interface PopupProps extends ModalProps {
  style?: JSX.CSSProperties;
}

export const SubtitleDownloadPopup: Component<PopupProps> = (props) => {
  const { selectedTrack, setSelectedTrack, selectedFormat, setSelectedFormat } =
    useSubtitleSelection({
      captionTracks: () => props.subtitleData.captionTrackList,
    });
  const { download } = useDownload();

  // Memoized selected track data
  const selectedTrackData = () =>
    props.subtitleData.captionTrackList.find(
      (track) => track.baseUrl === selectedTrack(),
    );

  const handleDownload = async () => {
    const trackData = selectedTrackData();
    if (!trackData) return;

    await download(
      selectedTrack(),
      props.subtitleData.captionTrackList,
      selectedFormat(),
      props.subtitleData.videoTitle,
    );
    props.onClose();
  };

  return (
    <div class="subtitle-popup" style={props.style}>
      <div class="subtitle-popup-header">
        <button
          type="button"
          class="subtitle-settings-button"
          title="Settings"
          aria-label="Settings"
          onClick={() => {
            chrome.runtime.sendMessage({ action: "openOptionsPage" });
          }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <title>Settings</title>
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.58 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
          </svg>
        </button>
      </div>
      <div class="subtitle-popup-content">
        <LanguageSelector
          tracks={props.subtitleData.captionTrackList}
          value={selectedTrack()}
          onChange={setSelectedTrack}
        />

        <FormatSelector value={selectedFormat()} onChange={setSelectedFormat} />
      </div>

      <div class="subtitle-button-container">
        <button
          type="button"
          onClick={handleDownload}
          disabled={!selectedTrackData()}
          class="subtitle-button subtitle-button-download"
        >
          Download
        </button>
      </div>
    </div>
  );
};
