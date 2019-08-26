import VideoInfo from './videoinfo';
import Url from './url';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  const videoId = new Url(document.URL).getParam('v');
  getRequest(`https://youtube.com/get_video_info?video_id=${videoId}`)
    .then(response => {
      const videoInfo = new VideoInfo(response);
      sendResponse({
        captions: videoInfo.getCaptionsData(),
        videoId: videoId,
        title: videoInfo.getVideoTitle(),
        error: null
      });
    })
    .catch(error => {
      console.log(error);
      sendResponse({ error: error });
    });
  return true;
});

function getRequest(url: string): Promise<any> {
  return new Promise<any>(function(resolve, reject) {
    const request = new XMLHttpRequest();
    request.onload = function() {
      if (this.status === 200) {
        resolve(this.response);
      } else {
        reject(new Error(this.statusText));
      }
    };
    request.onerror = function() {
      reject(new Error('XMLHttpRequest Error: ' + this.statusText));
    };
    request.open('GET', url);
    request.send();
  });
}
