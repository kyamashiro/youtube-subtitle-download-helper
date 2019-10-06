import Subtitle from './subtitle';
import ClientYoutube from './client/clientYoutube';

const sendData: { [key: string]: string } = {
  reason: 'check'
};

var videoTitle: string;

window.onload = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id!, sendData, (response) => {
      if (response.error) {
        console.log(response.error);
        displayMessage('This video has none caption.');
        return;
      }
      if (response.captions) {
        videoTitle = response.title;
        addSelectBox();
        response.captions.filter((value: any) => addSelectBoxOption(value));
        addDownloadButton();
        addSelectBoxFormat();
      }
    });
  });
};

function addSelectBoxFormat() {
  document
    .getElementById('content')!
    .insertAdjacentHTML(
      'afterbegin',
      "<select class='uk-select' style='margin-bottom:5px' id='format'><option value='csv'>.csv</option><option value='text'>.txt</option><option value='vtt'>.vtt</option><option value='srt'>.srt</option></select>"
    );
}

function addSelectBox() {
  document.getElementById('content')!.insertAdjacentHTML('afterbegin', "<select class='uk-select' id='language'></select>");
}

function addSelectBoxOption(value: any) {
  document.getElementById('language')!.insertAdjacentHTML('beforeend', `<option value=${value.baseUrl}>${value.name.simpleText}</option>`);
}

function addDownloadButton() {
  document
    .getElementById('content')!
    .insertAdjacentHTML('afterend', "<div class='uk-margin'><button id='download-button' class='uk-button uk-button-primary' onclick=download()>Download</button></div>");
  // register eventHandler function download()
  (<HTMLInputElement>document.getElementById('download-button')).onclick = () => download();
}

function debug(response: any) {
  const debug: HTMLElement = <HTMLElement>document.getElementById('debug');
  debug.insertAdjacentHTML('beforebegin', response);
}

function displayMessage(message: string) {
  const content: HTMLElement = <HTMLElement>document.getElementById('content');
  content.insertAdjacentHTML('beforebegin', `<p class='uk-text-danger'>${message}</p>`);
}

function download() {
  const language_url: string = (<HTMLInputElement>document.getElementById('language')).value;
  const format: string = (<HTMLInputElement>document.getElementById('format')).value;
  const client = new ClientYoutube();
  client
    .getSubtitle(language_url)
    .then((xmlResponse: string) => {
      if (!xmlResponse) throw new Error('Response empty.');
      const subtitle = new Subtitle(xmlResponse);
      if (format === 'csv') {
        subtitle.getCsv(videoTitle);
      } else if (format === 'text') {
        subtitle.getText(videoTitle);
      } else if (format === 'vtt') {
        subtitle.getVtt(videoTitle);
      } else {
        subtitle.getSrt(videoTitle);
      }
    })
    .catch((error) => {
      console.log(error);
      debug(error);
    });
}
