import { Url } from "./url";
import { ClientYoutube } from "./client/clientYoutube";
import { VideoInformationResponseParse } from "./parser/videoInformationParser";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const videoId = new Url(document.URL).getParam("v");
  const client = new ClientYoutube();
  client
    .getVideoInformation(videoId)
    .then((response) => {
      const captionTrackList = VideoInformationResponseParse(response);

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
