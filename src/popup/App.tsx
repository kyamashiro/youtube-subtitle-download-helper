import { createEffect, createMemo, createSignal } from "solid-js";
import { FileFormat } from "../converter/converterFactory";
import { DownloadButton } from "./components/DownloadButton";
import { ErrorMessage } from "./components/ErrorMessage";
import { FormatSelector } from "@/components/FormatSelector";
import { LanguageSelector } from "@/components/LanguageSelector";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { useDownload } from "./hooks/useDownload";
import { useYouTubeData } from "./hooks/useYouTubeData";
import "./App.css";

function App() {
  const [selectedTrack, setSelectedTrack] = createSignal<string>("");
  const [selectedFormat, setSelectedFormat] = createSignal<FileFormat>(
    FileFormat.SRT,
  );

  const { captionTracks, videoTitle, isLoading, errorMessage } =
    useYouTubeData();
  const { downloadError, download } = useDownload();

  // Auto-select first track when data loads
  createEffect(() => {
    const tracks = captionTracks();
    if (tracks.length > 0 && !selectedTrack()) {
      setSelectedTrack(tracks[0].baseUrl);
    }
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
