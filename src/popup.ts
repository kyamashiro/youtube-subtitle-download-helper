import { ClientYoutube } from "./client/clientYoutube";
import { ConverterFactory } from "./converter/converterFactory";
import { Track } from "./response/track";

const sendData: { [key: string]: string } = {
  reason: "check",
};

interface response {
  transcriptList: Track[];
  videoTitle: string;
  videoId: string;
  error: Error | null;
}

let videoId: string;
let videoTitle: string;

window.onload = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id!, sendData, (response: response) => {
      if (!response) {
        displayErrorMessage(
          "<p class='uk-text-danger'>This page is not on Youtube.</p>"
        );
        return;
      }

      if (response.error) {
        console.log(response.error);
        displayErrorMessage(
          "<p class='uk-text-danger'>This video has no captions.</p><p class='uk-text-danger'>If you can't download the subtitles, try disabling adblock.</p>"
        );
        return;
      }
      addSelectBox();
      response.transcriptList.forEach((track: Track) =>
        addSelectBoxOption(track)
      );
      addDownloadButton();
      addSelectBoxFormat();
      videoId = response.videoId;
      videoTitle = response.videoTitle;
    });
  });
};

function addSelectBoxFormat() {
  document
    .getElementById("content")!
    .insertAdjacentHTML(
      "afterbegin",
      "<select class='uk-select' style='margin-bottom:5px;font-size:larger;' id='format'><option value='csv'>.csv</option><option value='text'>.txt</option><option value='vtt'>.vtt</option><option value='srt'>.srt</option><option value='lrc'>.lrc</option></select>"
    );
}

function addSelectBox() {
  document
    .getElementById("content")!
    .insertAdjacentHTML(
      "afterbegin",
      "<select class='uk-select' id='language' style='font-size:larger;'></select>"
    );
}

function addSelectBoxOption(track: Track) {
  document
    .getElementById("language")!
    .insertAdjacentHTML(
      "beforeend",
      `<option value=${track.lang}>${track.langCode}</option>`
    );
}

function addDownloadButton() {
  document
    .getElementById("content")!
    .insertAdjacentHTML(
      "afterend",
      "<div class='uk-margin'><button id='download-button' class='uk-button uk-button-primary' onclick=download()>Download</button></div>"
    );
  (<HTMLInputElement>document.getElementById("download-button")).onclick = () =>
    download();
}

function debug(response: any) {
  const debug: HTMLElement = <HTMLElement>document.getElementById("debug");
  debug.insertAdjacentHTML("beforebegin", response);
}

function displayErrorMessage(message: string) {
  const content: HTMLElement = <HTMLElement>document.getElementById("content");
  content.insertAdjacentHTML("beforebegin", message);
}

function download() {
  const selectedLanguageElement = <HTMLSelectElement>(
    document.getElementById("language")
  );

  const langCode: string = selectedLanguageElement.value;
  const content: string =
    selectedLanguageElement.options[selectedLanguageElement.selectedIndex]
      .label;

  console.log(content);

  const fileFormat: string = (<HTMLInputElement>(
    document.getElementById("format")
  )).value;

  const client = new ClientYoutube();
  client
    .getSubtitle(videoId, langCode)
    .then((xmlResponse: string) => {
      if (!xmlResponse) throw new Error("Response empty.");

      const converterFactory = new ConverterFactory();
      const converter = converterFactory.create(fileFormat);
      converter.convert(xmlResponse, `${videoTitle} - ${content}`);
    })
    .catch((error) => {
      console.log(error);
      debug(error);
    });
}
