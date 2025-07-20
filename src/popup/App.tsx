import { createSignal, createEffect } from "solid-js";
import { FileFormat } from "../converter/converterFactory";
import { useYouTubeData } from "./hooks/useYouTubeData";
import { useDownload } from "./hooks/useDownload";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorMessage from "./components/ErrorMessage";
import FormatSelector from "./components/FormatSelector";
import LanguageSelector from "./components/LanguageSelector";
import DownloadButton from "./components/DownloadButton";
import "./App.css";

function App() {
  const [selectedTrack, setSelectedTrack] = createSignal<string>("");
  const [selectedFormat, setSelectedFormat] = createSignal<FileFormat>(FileFormat.SRT);

  const { captionTracks, videoTitle, isLoading, errorMessage } = useYouTubeData();
  const { isDownloading, downloadError, download } = useDownload();

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

  const hasError = errorMessage() || downloadError();
  const showContent = !isLoading() && !hasError && captionTracks().length > 0;

  return (
    <div class="popup-container">
      {isLoading() && <LoadingSpinner />}

      {hasError && <ErrorMessage message={hasError} />}

      {showContent && (
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
            loading={isDownloading()}
            disabled={!selectedTrack()}
          />
        </>
      )}
    </div>
  );
}

export default App;
