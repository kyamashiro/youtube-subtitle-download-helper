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
        <>
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
        </>
      )}
    </div>
  );
}

export default App;
