export class Url {
  constructor(private url: string) {}

  /**
   * Retrieve a value from a specific query string.
   * @param {string} query
   * @returns {string}
   * @member Url
   */
  public getParam(query: string): string {
    query = query.replace(/[[]]/g, "\\$&");
    const regex = new RegExp("[?&]" + query + "(=([^&#]*)|&|#|$)");
    const results = regex.exec(this.url);
    if (!results) {
      throw new Error("Url query parameter does not contain videoid.");
    }
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
}
