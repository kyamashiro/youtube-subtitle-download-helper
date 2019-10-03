import Timestamp from './timestamp';
import Aline from './interface/aline';

export default class CaptionsParser {
  constructor() {}

  /**
   * Decompose xml text line by line.
   *
   * @param {string} aline
   * @returns {Aline}
   * @memberof Converter
   */
  public decodeAline(aline: string): Aline {
    const timestamp: Timestamp = this.pullTime(aline);
    const htmlText: string = aline
      .replace(/<text.+>/, '')
      .replace(/&amp;/gi, '&')
      .replace(/<\/?[^>]+(>|$)/g, '')
      .replace(/\r?\n/g, ' ');
    const striptags = require('striptags');
    const he = require('he');
    const decodedText: string = he.decode(htmlText);
    const text: string = striptags(decodedText);

    return {
      timestamp: timestamp,
      text: text
    };
  }

  /**
   * Split lines into by a line.
   *
   * @param {string} lines
   * @returns {string[]}
   * @memberof Converter
   */
  public explode(lines: string): string[] {
    return lines.split('</text>').filter((line: string) => line && line.trim());
  }

  /**
   * Trim xml tag in first line
   *
   * @param {string} transcript
   * @returns {string[]}
   * @memberof Converter
   */
  public removeXmlTag(transcript: string): string {
    return transcript.replace('<?xml version="1.0" encoding="utf-8" ?><transcript>', '').replace('</transcript>', '');
  }

  /**
   * Pull time from text data.
   * <text start="10.159" dur="2.563">
   * @param {string} aline
   * @returns {Timestamp}
   * @memberof Converter
   */
  private pullTime(aline: string): Timestamp {
    const startRegex: RegExp = /start="([\d.]+)"/;
    const durRegex: RegExp = /dur="([\d.]+)"/;

    const [, start]: RegExpExecArray = startRegex.exec(aline)!;
    const [, dur]: RegExpExecArray = durRegex.exec(aline)!;

    return new Timestamp(Number(start), Number(dur));
  }
}
