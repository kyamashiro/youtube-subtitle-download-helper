export default class VideoInfoParser {
  constructor(private videoInfoResponse: any) {}

  private videoInfoParse(): any {
    const decodedData = this.parseQuery(this.videoInfoResponse);
    return JSON.parse(decodedData.player_response);
  }

  public getCaptionsData() {
    return this.videoInfoParse().captions.playerCaptionsTracklistRenderer.captionTracks;
  }

  /**
   * Get video title and replace extra word.
   * example:"How+to+learn+any+language+in+six+months+|+Chris+Lonsdale+|+TEDxLingnanUniversity"
   */
  public getVideoTitle() {
    return this.videoInfoParse()
      .videoDetails.title.replace(/\+\|/g, '')
      .replace(/[\+]/g, ' ');
  }

  private parseQuery(queryString: string) {
    let query: { [key: string]: any } = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split('=');
      query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
  }
}
