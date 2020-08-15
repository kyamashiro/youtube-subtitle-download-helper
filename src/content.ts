import Url from "./url";
import VideoInfoParser from "./videoInfoParser";
import ClientYoutube from "./client/clientYoutube";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const videoId = new Url(document.URL).getParam("v");
  const client = new ClientYoutube();
  client
    .getVideoInfo(videoId)
    .then((response) => {
      const videoInfoParser = new VideoInfoParser(response);
      sendResponse({
        captions: videoInfoParser.getCaptionsData(),
        videoId: videoId,
        title: videoInfoParser.getVideoTitle(),
        error: null,
      });
    })
    .catch((error) => {
      console.log(error);
      sendResponse({ error: error });
    });
  return true;
});
