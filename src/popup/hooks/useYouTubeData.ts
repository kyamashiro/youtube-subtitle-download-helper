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

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id!, sendData, (response: YouTubeResponse) => {
        setIsLoading(false);

        if (!response) {
          setErrorMessage("This page is not on YouTube.");
          return;
        }

        if (response.error) {
          console.log(response.error);
          setErrorMessage(
            "This video has no captions. If you can't download the subtitles, try disabling adblock."
          );
          return;
        }

        setCaptionTracks(response.captionTrackList);
        setVideoTitle(response.videoTitle);
        setVideoId(response.videoId);
      });
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