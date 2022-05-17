export class ClientYoutube {
  /**
   * Get a list of translations by language
   * @param videoId
   */
  async getVideoInformation(videoId: string): Promise<string> {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.text();
  }

  async getSubtitle(baseUrl: string): Promise<string> {
    const response = await fetch(baseUrl);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.text();
  }
}
