import { Url } from "./url";
import { ClientYoutube } from "./client/clientYoutube";
import { TranscriptListParser } from "./parser/transcriptListParser";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const videoId = new Url(document.URL).getParam("v");
  console.log("check");
  const client = new ClientYoutube();
  client
    .getTranscriptList(videoId)
    .then((response) => {
      const parser = new TranscriptListParser(response);
      const transcriptList = parser.parse();
      sendResponse({
        transcriptList,
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
