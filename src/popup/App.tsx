import { createMemo } from "solid-js";
import { DownloadButton } from "./components/DownloadButton";
import { ErrorMessage } from "./components/ErrorMessage";
import { FormatSelector } from "@/components/FormatSelector";
import { LanguageSelector } from "@/components/LanguageSelector";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { useDownload } from "./hooks/useDownload";
import { useYouTubeData } from "./hooks/useYouTubeData";
import { useSubtitleSelection } from "@/hooks/useSubtitleSelection";
import "./App.css";

function App() {
  const { captionTracks, videoTitle, isLoading, errorMessage } =
    useYouTubeData();
  const { downloadError, download } = useDownload();

  const { selectedTrack, setSelectedTrack, selectedFormat, setSelectedFormat } =
    useSubtitleSelection({
      captionTracks,
    });

  const handleDownload = () => {
    download(selectedTrack(), captionTracks(), selectedFormat(), videoTitle());
  };

  const hasError = createMemo(() => errorMessage() || downloadError());
  const showContent = createMemo(() => {
    const loading = isLoading();
    const error = hasError();
    const tracks = captionTracks();
    const shouldShow = !loading && !error && tracks.length > 0;

    console.log("showContent computation:", {
      loading,
      error,
      tracksLength: tracks.length,
      shouldShow,
    });

    return shouldShow;
  });

  return (
    <div class="popup-container">
      {/* Header with Settings */}
      <div class="popup-header">
        <button
          type="button"
          class="settings-button"
          title="Settings"
          onClick={() => {
            chrome.runtime.sendMessage({ action: 'openOptionsPage' })
          }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.58 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
          </svg>
        </button>
      </div>

      {/* Debug info */}
      <div
        style={{ "font-size": "10px", color: "#999", "margin-bottom": "10px" }}
      >
        Debug: Loading={isLoading().toString()}, Error=
        {Boolean(hasError()).toString()}, Tracks={captionTracks().length}
      </div>

      {isLoading() && <LoadingSpinner />}

      {hasError() && <ErrorMessage message={hasError()} />}

      {showContent() && (
        <div class="popup-content">
          <FormatSelector
            value={selectedFormat()}
            onChange={setSelectedFormat}
          />

          <LanguageSelector
            tracks={captionTracks()}
            value={selectedTrack()}
            onChange={setSelectedTrack}
          />

          <DownloadButton
            onClick={handleDownload}
            disabled={!selectedTrack()}
          />
        </div>
      )}
    </div>
  );
}

export default App;
