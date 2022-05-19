import { ClientYoutube } from "./client/clientYoutube";
import { ConverterFactory, FileFormat } from "./converter/converterFactory";
import { CaptionTrack } from "./type/captionTrack";

const sendData: { [key: string]: string } = {
  reason: "check",
};

interface response {
  captionTrackList: CaptionTrack[];
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
      response.captionTrackList.forEach((track: CaptionTrack) =>
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
  const options = Object.values(FileFormat)
    .map((format) => `<option value=${format}>.${format}</option>`)
    .join();

  document
    .getElementById("content")!
    .insertAdjacentHTML(
      "afterbegin",
      `<select class='uk-select' style='margin-bottom:5px;font-size:larger;' id='format'>${options}</select>`
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

function addSelectBoxOption(captionTrack: CaptionTrack) {
  document
    .getElementById("language")!
    .insertAdjacentHTML(
      "beforeend",
      `<option value=${captionTrack.baseUrl}>${captionTrack.name.simpleText}</option>`
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

  const baseUrl: string = selectedLanguageElement.value;
  const content: string =
    selectedLanguageElement.options[selectedLanguageElement.selectedIndex]
      .label;

  const fileFormat = (<HTMLInputElement>document.getElementById("format"))
    .value as FileFormat;

  const client = new ClientYoutube();
  client
    .getSubtitle(baseUrl)
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
