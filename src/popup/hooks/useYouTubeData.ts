import { createSignal, onMount } from "solid-js";
import type { CaptionTrack } from "../../type/captionTrack";

interface YouTubeResponse {
  captionTrackList: CaptionTrack[];
  videoTitle: string;
  videoId: string;
  error: Error | null;
}

interface UseYouTubeDataReturn {
  captionTracks: () => CaptionTrack[];
  videoTitle: () => string;
  videoId: () => string;
  isLoading: () => boolean;
  errorMessage: () => string;
}

export function useYouTubeData(): UseYouTubeDataReturn {
  const [captionTracks, setCaptionTracks] = createSignal<CaptionTrack[]>([]);
  const [videoTitle, setVideoTitle] = createSignal<string>("");
  const [videoId, setVideoId] = createSignal<string>("");
  const [isLoading, setIsLoading] = createSignal<boolean>(true);
  const [errorMessage, setErrorMessage] = createSignal<string>("");

  onMount(() => {
    const sendData = { reason: "check" };

    console.log("Attempting to get YouTube data...");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log("Found tabs:", tabs);

      if (!tabs[0]?.id) {
        console.error("No active tab found");
        setIsLoading(false);
        setErrorMessage("No active tab found.");
        return;
      }

      console.log("Sending message to tab:", tabs[0].id);

      chrome.tabs.sendMessage(
        tabs[0].id,
        sendData,
        (response: YouTubeResponse) => {
          console.log("Received response:", response);
          console.log("Chrome runtime error:", chrome.runtime.lastError);

          setIsLoading(false);

          if (chrome.runtime.lastError) {
            console.error("Chrome extension error:", chrome.runtime.lastError);
            setErrorMessage(
              "Failed to connect to content script. Please refresh the YouTube page and try again.",
            );
            return;
          }

          if (!response) {
            console.error("No response received");
            setErrorMessage(
              "This page is not on YouTube or the content script is not loaded.",
            );
            return;
          }

          if (response.error) {
            console.log("Response contains error:", response.error);
            setErrorMessage(
              "This video has no captions. If you can't download the subtitles, try disabling adblock.",
            );
            return;
          }

          console.log(
            "Successfully received caption tracks:",
            response.captionTrackList,
          );
          setCaptionTracks(response.captionTrackList);
          setVideoTitle(response.videoTitle);
          setVideoId(response.videoId);
        },
      );
    });
  });

  return {
    captionTracks,
    videoTitle,
    videoId,
    isLoading,
    errorMessage,
  };
}
