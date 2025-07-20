import { createComponent } from "solid-js";
import { render } from "solid-js/web";
import { VideoPageHtmlParser } from "@/parser/videoPageHtmlParser.ts";
import type { CaptionTrack } from "@/types/captionTrack.ts";
import { ClientYoutube } from "../client/clientYoutube";
import { Url } from "../url";
import App from "./views/App.tsx";

// YouTube subtitle download functionality
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log("Content script received a message:", request);

  const handleMessage = async () => {
    const videoId = Url.getParam(document.URL);
    const response = await getSubtitleList(videoId);
    sendResponse(response);
  };
  handleMessage();
  return true;
});

type SubtitleDataResponse = {
  captionTrackList: CaptionTrack[];
  videoId: string;
  videoTitle: string;
  error: Error | null;
};

async function getSubtitleList(videoId: string): Promise<SubtitleDataResponse> {
  try {
    const videoPageData = await ClientYoutube.getVideoPageHtml(videoId);
    const innerTubeConfig =
      VideoPageHtmlParser.parseInnerTubeConfig(videoPageData);

    console.log("INNERTUBE Config:", innerTubeConfig);

    const playerData = await ClientYoutube.getPlayerData(
      videoId,
      innerTubeConfig,
    );
    console.log("Player Data:", playerData);

    // Extract captions from player data
    const captionTrackList =
      VideoPageHtmlParser.parseCaptionsFromPlayerData(playerData);

    return {
      captionTrackList,
      videoId,
      videoTitle: getVideoTitle(),
      error: null,
    };
  } catch (e) {
    console.error("Error fetching subtitle list:", e);
    return {
      captionTrackList: [],
      videoId,
      videoTitle: getVideoTitle(),
      error: e instanceof Error ? e : new Error("Unknown error"),
    };
  }
}

const getVideoTitle = (): string => {
  return document.title.replace(/[+|/?^.<>":]/g, "").replace(/ - YouTube/, "");
};

/**
 * Mount the Solid app to the DOM.
 */
function mountApp() {
  const container = document.createElement("div");
  container.id = "crxjs-app";
  document.body.appendChild(container);
  render(() => createComponent(App, {}), container);
}

mountApp();
