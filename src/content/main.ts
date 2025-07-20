import { createComponent } from "solid-js";
import { render } from "solid-js/web";
import { ClientYoutube } from "../client/clientYoutube";
import { VideoInformationResponseParser } from "../parser/videoInformationParser";
import { Url } from "../url";
import App from "./views/App.tsx";

// YouTube subtitle download functionality
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received message:", request);

  if (request.reason === "check") {
    // Handle caption track list request
    const videoId = new Url(document.URL).getParam("v");
    console.log("Extracted video ID:", videoId);

    if (!videoId) {
      console.error("No video ID found in URL");
      sendResponse({ error: new Error("No video ID found") });
      return true;
    }

    const client = new ClientYoutube();
    client
      .getVideoInformation(videoId)
      .then((response) => {
        console.log("Got video information response:", response);
        const captionTrackList = VideoInformationResponseParser.parse(response);
        console.log("Parsed caption tracks:", captionTrackList);

        const responseData = {
          captionTrackList,
          videoId,
          videoTitle: getVideoTitle(),
          error: null,
        };

        console.log("Sending response:", responseData);
        sendResponse(responseData);
      })
      .catch((error: Error) => {
        console.error("Error getting video information:", error);
        sendResponse({ error: error });
      });
  } else if (request.reason === "download") {
    // Handle subtitle download request
    console.log("Downloading subtitle from:", request.baseUrl);

    const client = new ClientYoutube();
    client
      .getSubtitle(request.baseUrl)
      .then((xmlResponse) => {
        console.log("Got subtitle response:", {
          length: xmlResponse?.length,
          preview: xmlResponse?.substring(0, 200),
        });

        sendResponse({
          success: true,
          data: xmlResponse,
          error: null,
        });
      })
      .catch((error: Error) => {
        console.error("Error downloading subtitle:", error);
        sendResponse({
          success: false,
          data: null,
          error: error.message,
        });
      });
  }

  return true;
});

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
