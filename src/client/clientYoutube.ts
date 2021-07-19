export class ClientYoutube {
  /**
   * Get a list of translations by language
   * @param videoId
   */
  async getTranscriptList(videoId: string): Promise<any> {
    return this.getRequest(
      `https://www.youtube.com/api/timedtext?type=list&v=${videoId}`
    );
  }

  getSubtitle(videoId: string, lang: string): Promise<any> {
    return this.getRequest(
      `https://www.youtube.com/api/timedtext?type=track&v=${videoId}&lang=${lang}`
    );
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
