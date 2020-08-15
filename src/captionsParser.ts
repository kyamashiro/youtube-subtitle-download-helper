import Timestamp from "./timestamp";
import Aline from "./interface/aline";
import striptags from "striptags";
import he from "he";

export default class CaptionsParser {
  /**
   * Decompose xml text line by line.
   *
   * @param {string} aline
   * @returns {Aline}
   * @memberof CaptionsParser
   */
  public decodeAline(aline: string): Aline {
    const timestamp: Timestamp = this.pullTime(aline);
    const htmlText: string = aline
      .replace(/<text.+>/, "")
      .replace(/&amp;/gi, "&")
      .replace(/<\/?[^>]+(>|$)/g, "")
      .replace(/\r?\n/g, " ");
    const decodedText: string = he.decode(htmlText);
    const text: string = striptags(decodedText);

    return {
      timestamp: timestamp,
      text: text,
    };
  }

  /**
   * Split lines into by a line.
   *
   * @param {string} lines
   * @returns {string[]}
   * @memberof CaptionsParser
   */
  public explode(lines: string): string[] {
    return lines.split("</text>").filter((line: string) => line && line.trim());
  }

  /**
   * Trim xml tag in first line
   *
   * @param {string} transcript
   * @returns {string[]}
   * @memberof CaptionsParser
   */
  public removeXmlTag(transcript: string): string {
    return transcript.replace('<?xml version="1.0" encoding="utf-8" ?><transcript>', "").replace("</transcript>", "");
  }

  /**
   * Pull time from text data.
   * <text start="10.159" dur="2.563">
   * @param {string} aline
   * @returns {Timestamp}
   * @memberof CaptionsParser
   */
  private pullTime(aline: string): Timestamp {
    const startRegex = /start="([\d.]+)"/;
    const durRegex = /dur="([\d.]+)"/;
    return new Timestamp(this.getTimeFromText(startRegex, aline), this.getTimeFromText(durRegex, aline));
  }

  /**
   * Execute RegExp.
   *
   * @private
   * @param {RegExp} regex
   * @param {string} aline
   * @returns {number}
   * @memberof CaptionsParser
   */
  private getTimeFromText(regex: RegExp, aline: string): number {
    if (regex.test(aline)) {
      const [, time]: RegExpExecArray = regex.exec(aline)!;
      return Number(time);
    }

    return 0;
  }
}
