export default class ClientYoutube {
  getVideoInfo(videoId: string): Promise<any> {
    return this.getRequest(`https://youtube.com/get_video_info?video_id=${videoId}`);
  }

  getSubtitle(languageUrl: string): Promise<any> {
    return this.getRequest(languageUrl);
  }

  getRequest(url: string): Promise<any> {
    return new Promise<any>(function (resolve, reject) {
      const request = new XMLHttpRequest();
      request.onload = function () {
        if (this.status === 200) {
          resolve(this.response);
        } else {
          reject(new Error(this.statusText));
        }
      };
      request.onerror = function () {
        reject(new Error("XMLHttpRequest Error: " + this.statusText));
      };
      request.open("GET", url);
      request.send();
    });
  }
}
