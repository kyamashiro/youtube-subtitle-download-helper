export default class Url {
  constructor(private url: string) {}

  public getParam(name: string): string {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(this.url);
    if (!results) {
      throw new ErrorEvent('Url query parameter does not contain videoid.');
    }
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }
}
