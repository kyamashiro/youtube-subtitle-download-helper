import {
  parseCaptionsFromPlayerData,
  parseInnerTubeConfig,
} from "@/parser/videoPageHtmlParser.ts";
import type { CaptionTrack } from "@/types/captionTrack.ts";
import { getPlayerData, getVideoPageHtml } from "../client/clientYoutube";
import { getParam } from "../url";
import initializeApp from "./views/App.tsx";

type SubtitleDataResponse = {
  captionTrackList: CaptionTrack[];
  videoId: string;
  videoTitle: string;
  error: Error | null;
};

// Cache for subtitle data
let cachedSubtitleData: SubtitleDataResponse | null = null;
let currentVideoId: string | null = null;

// Initialize data when page loads
async function initializeSubtitleData() {
  try {
    // Optimization: Skip if not a video page
    if (!location.pathname.startsWith("/watch")) {
      console.log("Not a watch page, skipping subtitle initialization.");
      return;
    }

    const videoId = getParam(document.URL);

    if (!videoId) {
      console.log("No video ID found, skipping subtitle initialization.");
      return;
    }

    console.log("Initializing subtitle data for video:", videoId);

    if (currentVideoId === videoId && cachedSubtitleData) {
      console.log("Using cached data for video:", videoId);
      notifyDataUpdated();
      return;
    }

    currentVideoId = videoId;
    cachedSubtitleData = await getSubtitleList(videoId);
    console.log("Subtitle data initialized:", cachedSubtitleData);
    notifyDataUpdated();
  } catch (e) {
    console.error("Failed to initialize subtitle data:", e);
    cachedSubtitleData = {
      captionTrackList: [],
      videoId: currentVideoId || "",
      videoTitle: getVideoTitle(),
      error: e instanceof Error ? e : new Error("Unknown error"),
    };
    notifyDataUpdated();
  }
}

// Notify App component of data updates
function notifyDataUpdated() {
  if (cachedSubtitleData) {
    window.dispatchEvent(
      new CustomEvent("subtitle-data-updated", {
        detail: cachedSubtitleData,
      }),
    );
  }
}

// Listen for popup requests
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log("Content script received a message:", request);

  if (request.reason === "check") {
    // Return cached data immediately if available
    if (cachedSubtitleData) {
      console.log("Returning cached subtitle data");
      sendResponse(cachedSubtitleData);
    } else {
      // If no cached data, initialize and return
      initializeSubtitleData().then(() => {
        sendResponse(cachedSubtitleData);
      });
      return true; // Keep message channel open for async response
    }
  }
});

async function getSubtitleList(videoId: string): Promise<SubtitleDataResponse> {
  try {
    const pageResult = await getVideoPageHtml(videoId);
    if (!pageResult.success) {
      throw pageResult.error;
    }
    const videoPageData = pageResult.value;

    const innerTubeConfig = parseInnerTubeConfig(videoPageData);
    console.log("INNERTUBE Config:", innerTubeConfig);

    const playerResult = await getPlayerData(videoId, innerTubeConfig);
    if (!playerResult.success) {
      throw playerResult.error;
    }
    const playerData = playerResult.value;

    console.log("Player Data:", playerData);

    // Extract captions from player data
    const captionTrackList = parseCaptionsFromPlayerData(playerData);

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

// Watch for URL changes (YouTube SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log("URL changed, reinitializing subtitle data");
    // Reset cache when navigating to a new video
    cachedSubtitleData = null;
    currentVideoId = null;
    initializeSubtitleData();
  }
}).observe(document, { subtree: true, childList: true });

// Initialize the app and data when content script loads
initializeApp();
initializeSubtitleData();
