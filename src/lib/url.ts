/**
 * Retrieve a value from a specific query string.
 * @returns {string}
 * @param url
 */
export const getParam = (url: string): string | null => {
  const query = "v".replace(/[[]]/g, "\\$&");
  const regex = new RegExp(`[?&]${query}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);
  if (!results) {
    return null;
  }
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};
