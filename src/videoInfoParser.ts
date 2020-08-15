export default class VideoInfoParser {
  constructor(private videoInfoResponse: any) {}

  public getCaptionsData(): Array<any> {
    if (!this.decodeVideoInfoResponse().captions.playerCaptionsTracklistRenderer.captionTracks) {
      throw new Error("This video has not caption.");
    }
    return this.decodeVideoInfoResponse().captions.playerCaptionsTracklistRenderer.captionTracks;
  }

  /**
   * Get video title and replace extra word.
   *
   * @returns {string}
   * @memberof VideoInfoParser
   */
  public getVideoTitle(): string {
    return this.decodeVideoInfoResponse()
      .videoDetails.title.replace(/\+\|/g, "")
      .replace(/[+]/g, " ")
      .replace(/[?^.<>":]/g, "");
  }

  /**
   * Decode response JSON format.
   *
   * @private
   * @returns {*}
   * @memberof VideoInfoParser
   */
  private decodeVideoInfoResponse(): any {
    const decodedData = this.parseQuery(this.videoInfoResponse);
    return JSON.parse(decodedData.player_response);
  }

  /**
   * Parse videoinfo response.
   *
   * @private
   * @param {string} queryString
   * @returns
   * @memberof VideoInfoParser
   */
  private parseQuery(queryString: string) {
    const query: { [key: string]: any } = {};
    const pairs = (queryString[0] === "?" ? queryString.substr(1) : queryString).split("&");
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i].split("=");
      query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
    }
    return query;
  }
}
