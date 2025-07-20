import { createSignal, onMount } from "solid-js";
import { ClientYoutube } from "../client/clientYoutube";
import { ConverterFactory, FileFormat } from "../converter/converterFactory";
import type { CaptionTrack } from "../type/captionTrack";
import "./App.css";

interface Response {
  captionTrackList: CaptionTrack[];
  videoTitle: string;
  videoId: string;
  error: Error | null;
}

function App() {
  const [captionTracks, setCaptionTracks] = createSignal<CaptionTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = createSignal<string>("");
  const [selectedFormat, setSelectedFormat] = createSignal<FileFormat>(
    FileFormat.SRT,
  );
  const [errorMessage, setErrorMessage] = createSignal<string>("");
  const [videoTitle, setVideoTitle] = createSignal<string>("");
  const [videoId, setVideoId] = createSignal<string>("");
  const [isLoading, setIsLoading] = createSignal<boolean>(true);

  onMount(() => {
    const sendData = { reason: "check" };

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id!, sendData, (response: Response) => {
        setIsLoading(false);

        if (!response) {
          setErrorMessage("This page is not on Youtube.");
          return;
        }

        if (response.error) {
          console.log(response.error);
          setErrorMessage(
            "This video has no captions. If you can't download the subtitles, try disabling adblock.",
          );
          return;
        }

        setCaptionTracks(response.captionTrackList);
        setVideoTitle(response.videoTitle);
        setVideoId(response.videoId);

        if (response.captionTrackList.length > 0) {
          setSelectedTrack(response.captionTrackList[0].baseUrl);
        }
      });
    });
  });

  const handleDownload = async () => {
    const baseUrl = selectedTrack();
    const selectedTrackData = captionTracks().find(
      (track) => track.baseUrl === baseUrl,
    );

    if (!selectedTrackData) return;

    const content = selectedTrackData.name.simpleText;
    const fileFormat = selectedFormat();

    try {
      const client = new ClientYoutube();
      const xmlResponse = await client.getSubtitle(baseUrl);

      if (!xmlResponse) throw new Error("Response empty.");

      const converterFactory = new ConverterFactory();
      const converter = converterFactory.create(fileFormat);
      converter.convert(xmlResponse, `${videoTitle()} - ${content}`);
    } catch (error) {
      console.log(error);
      setErrorMessage(`Download failed: ${error}`);
    }
  };

  return (
    <div style={{ width: "300px", padding: "20px" }}>
      {isLoading() && <p>Loading...</p>}

      {errorMessage() && (
        <p style={{ color: "#f0506e", margin: "10px 0" }}>{errorMessage()}</p>
      )}

      {captionTracks().length > 0 && (
        <div>
          <div style={{ "margin-bottom": "10px" }}>
            <label>Format:</label>
            <select
              value={selectedFormat()}
              onChange={(e) => setSelectedFormat(e.target.value as FileFormat)}
              style={{
                width: "100%",
                padding: "8px",
                "margin-top": "5px",
                "font-size": "14px",
              }}
            >
              {Object.values(FileFormat).map((format) => (
                <option value={format}>.{format}</option>
              ))}
            </select>
          </div>

          <div style={{ "margin-bottom": "15px" }}>
            <label>Language:</label>
            <select
              value={selectedTrack()}
              onChange={(e) => setSelectedTrack(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                "margin-top": "5px",
                "font-size": "14px",
              }}
            >
              {captionTracks().map((track) => (
                <option value={track.baseUrl}>{track.name.simpleText}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleDownload}
            style={{
              width: "100%",
              padding: "10px",
              "background-color": "#1e87f0",
              color: "white",
              border: "none",
              "border-radius": "4px",
              "font-size": "16px",
              cursor: "pointer",
            }}
          >
            Download
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
