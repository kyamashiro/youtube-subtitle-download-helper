export default class Url {
    constructor(private url: string) { }

    public getParam(name: string): string | null {
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(this.url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    public getSubtitleUrl(format: string): string {
        if (format === 'vtt') {
            return this.url + '&fmt=vtt'
        }
        return this.url
    }
}