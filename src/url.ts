export const Url = {
  /**
   * Retrieve a value from a specific query string.
   * @returns {string}
   * @param url
   */
  getParam(url: string): string {
    const query = "v".replace(/[[]]/g, "\\$&");
    const regex = new RegExp(`[?&]${query}(=([^&#]*)|&|#|$)`);
    const results = regex.exec(url);
    if (!results) {
      throw new Error("Url query parameter does not contain videoid.");
    }
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  },
};
