import { createComponent } from "solid-js";
import { render } from "solid-js/web";
import { Url } from "../url";
import { ClientYoutube } from "../client/clientYoutube";
import { VideoInformationResponseParser } from "../parser/videoInformationParser";
import App from "./views/App.tsx";

console.log("[CRXJS] Hello world from content script!");

// YouTube subtitle download functionality
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const videoId = new Url(document.URL).getParam("v");
  const client = new ClientYoutube();
  client
    .getVideoInformation(videoId)
    .then((response) => {
      const captionTrackList = VideoInformationResponseParser.parse(response);

      sendResponse({
        captionTrackList,
        videoId,
        videoTitle: getVideoTitle(),
        error: null,
      });
    })
    .catch((error: Error) => {
      console.log(error);
      sendResponse({ error: error });
    });
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
