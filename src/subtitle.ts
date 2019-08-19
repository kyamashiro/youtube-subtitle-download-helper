export default class Subtitle {
    constructor(private subtitleData: any) { }

    public getVtt(filename: string): any {
        const blob = new Blob([this.subtitleData], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        chrome.downloads.download({
            url: url,
            filename: this.removeReservedCharacters(filename) + ".vtt"
        });
    };

    public getSrt(filename: string): any {
        const blob = new Blob([this.subtitleData], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        chrome.downloads.download({
            url: url,
            filename: filename + ".srt"
        });
    };

    public getCsv(filename: string): any {
        let converter = require('json-2-csv');
        let data: any;
        let json2csvCallback = function (err: any, csv: any) {
            if (err) throw err;
            data = csv
        };
        converter.json2csv(this.convertXMLtoCsv(this.subtitleData), json2csvCallback);

        chrome.downloads.download({
            url: URL.createObjectURL(new Blob([data], { type: "text/csv" })),
            filename: this.removeReservedCharacters(filename) + ".csv"
        });
    };

    public getText(filename: string): any {
        console.log(this.removeReservedCharacters(filename))
        let converter = require('json-2-csv');
        let data: any;
        let json2csvCallback = function (err: any, csv: any) {
            if (err) throw err;
            data = csv
        };
        converter.json2csv(this.convertXMLtoText(this.subtitleData), json2csvCallback);

        chrome.downloads.download({
            url: URL.createObjectURL(new Blob([data], { type: "text/plain" })),
            filename: this.removeReservedCharacters(filename) + ".txt"
        });
    }

    removeReservedCharacters(filename: string): string {
        return filename.replace(/[\/\\:;|=,."']/g, "");
    }

    convertXMLtoText(transcript: any) {
        const lines = transcript
            .replace('<?xml version="1.0" encoding="utf-8" ?><transcript>', '')
            .replace('</transcript>', '')
            .split('</text>')
            .filter((line: string) => line && line.trim())
            .map((line: string) => {
                const aline = this.extract(line)
                const startTime = aline.start
                const durationTime = aline.duration
                const text = aline.text.replace(/\n/, " ")
                return {
                    startTime,
                    durationTime,
                    text,
                };
            });

        return lines;
    }

    extract(aline: string) {
        const startRegex = /start="([\d.]+)"/;
        const durRegex = /dur="([\d.]+)"/;

        const [, start]: RegExpExecArray = startRegex.exec(aline)!;
        const [, dur]: RegExpExecArray = durRegex.exec(aline)!;
        const startTime = this.convertTime(start)
        const durationTime = this.mergeTime(start, dur)

        const htmlText = aline
            .replace(/<text.+>/, '')
            .replace(/&amp;/gi, '&')
            .replace(/<\/?[^>]+(>|$)/g, '');
        const striptags = require('striptags');
        const he = require('he');
        const decodedText = he.decode(htmlText);
        const text = striptags(decodedText);

        return { start: startTime, duration: durationTime, text: text }
    }


    convertXMLtoCsv(transcript: any) {
        const lines = transcript
            .replace('<?xml version="1.0" encoding="utf-8" ?><transcript>', '')
            .replace('</transcript>', '')
            .split('</text>')
            .filter((line: any) => line && line.trim())
            .map((line: any) => {
                const aline = this.extract(line)
                const startTime = aline.start
                const durationTime = aline.duration
                const text = aline.text.replace(/\n/, " ")
                return {
                    startTime,
                    durationTime,
                    text,
                };
            });

        return lines;
    }

    mergeTime(dateStartStr: any, dateEndStr: any) {
        return new Date(dateStartStr * 1000 + dateEndStr * 1000).toISOString().slice(11, -1);
    };

    convertTime(duration: any) {
        return new Date(duration * 1000).toISOString().slice(11, -1);
    }
}