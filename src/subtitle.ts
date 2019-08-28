export default class Subtitle {
  constructor(private subtitleData: any) {}

  public getVtt(filename: string): any {
    let converter = require('json-2-csv');
    const options = {
      delimiter: {
        wrap: '', // Double Quote (") character
        field: '', // Comma field delimiter
        eol: '\n' // Newline delimiter
      },
      prependHeader: false
    };
    converter
      .json2csvAsync(this.convertXMLtoVtt(this.subtitleData), options)
      .then((csv: any) => {
        chrome.downloads.download({
          url: URL.createObjectURL(new Blob(['WEBVTT\n\n' + csv], { type: 'text/plain' })),
          filename: this.removeReservedCharacters(filename) + '.vtt'
        });
      })
      .catch((err: any) => {
        if (err) throw err;
      });
  }

  convertXMLtoVtt(transcript: any) {
    const lines: Array<string> = transcript
      .replace('<?xml version="1.0" encoding="utf-8" ?><transcript>', '')
      .replace('</transcript>', '')
      .split('</text>')
      .filter((line: string) => line && line.trim())
      .map((line: string) => {
        const aline = this.extract(line);
        const timestamp = aline.start + ' --> ' + aline.duration + '\n';
        const text = aline.text.replace(/\n/, ' ') + '\n';
        return {
          timestamp,
          text
        };
      });

    return lines;
  }

  public getSrt(filename: string): any {
    const blob = new Blob([this.subtitleData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
      url: url,
      filename: filename + '.srt'
    });
  }

  public getCsv(filename: string): any {
    let converter = require('json-2-csv');
    converter
      .json2csvAsync(this.convertXMLtoCsv(this.subtitleData))
      .then((csv: any) => {
        chrome.downloads.download({
          url: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
          filename: this.removeReservedCharacters(filename) + '.csv'
        });
      })
      .catch((err: any) => {
        if (err) throw err;
      });
  }

  public getText(filename: string): any {
    console.log(this.removeReservedCharacters(filename));
    let converter = require('json-2-csv');
    converter
      .json2csvAsync(this.convertXMLtoCsv(this.subtitleData))
      .then((csv: any) => {
        chrome.downloads.download({
          url: URL.createObjectURL(new Blob([csv], { type: 'text/plane' })),
          filename: this.removeReservedCharacters(filename) + '.txt'
        });
      })
      .catch((err: any) => {
        if (err) throw err;
      });
  }

  removeReservedCharacters(filename: string): string {
    return filename.replace(/[\/\\:;|=,."']/g, '');
  }

  convertXMLtoText(transcript: any) {
    const lines = transcript
      .replace('<?xml version="1.0" encoding="utf-8" ?><transcript>', '')
      .replace('</transcript>', '')
      .split('</text>')
      .filter((line: string) => line && line.trim())
      .map((line: string) => {
        const aline = this.extract(line);
        const startTime = aline.start;
        const durationTime = aline.duration;
        const text = aline.text.replace(/\n/, ' ');
        return {
          startTime,
          durationTime,
          text
        };
      });

    return lines;
  }

  extract(aline: string) {
    const startRegex = /start="([\d.]+)"/;
    const durRegex = /dur="([\d.]+)"/;

    const [, start]: RegExpExecArray = startRegex.exec(aline)!;
    const [, dur]: RegExpExecArray = durRegex.exec(aline)!;
    const startTime = this.convertTime(start);
    const durationTime = this.mergeTime(start, dur);

    const htmlText = aline
      .replace(/<text.+>/, '')
      .replace(/&amp;/gi, '&')
      .replace(/<\/?[^>]+(>|$)/g, '');
    const striptags = require('striptags');
    const he = require('he');
    const decodedText = he.decode(htmlText);
    const text = striptags(decodedText);

    return { start: startTime, duration: durationTime, text: text };
  }

  convertXMLtoCsv(transcript: any) {
    const lines = transcript
      .replace('<?xml version="1.0" encoding="utf-8" ?><transcript>', '')
      .replace('</transcript>', '')
      .split('</text>')
      .filter((line: any) => line && line.trim())
      .map((line: any) => {
        const aline = this.extract(line);
        const startTime = aline.start;
        const durationTime = aline.duration;
        const text = aline.text.replace(/\n/, ' ');
        return {
          startTime,
          durationTime,
          text
        };
      });

    return lines;
  }

  mergeTime(dateStartStr: any, dateEndStr: any) {
    return new Date(dateStartStr * 1000 + dateEndStr * 1000).toISOString().slice(11, -1);
  }

  convertTime(duration: any) {
    return new Date(duration * 1000).toISOString().slice(11, -1);
  }
}
