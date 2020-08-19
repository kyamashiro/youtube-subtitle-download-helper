import { Aline } from "./type/aline/aline";
import { VttAline } from "./type/aline/vttAline";
import { CsvAline } from "./type/aline/csvAline";
import { SrtAline } from "./type/aline/srtAline";
import { TextAline } from "./type/aline/textAline";
import { LrcAline } from "./type/aline/lrcAline";
import { CaptionsParser } from "./captionsParser";

export class Converter {
  constructor(private xmlResponse: string) {}

  /**
   * Convert to save in CSV format
   *
   * @returns {CsvAline[]}
   * @memberof Converter
   */
  public toCsv(): CsvAline[] {
    const parser = new CaptionsParser();
    const trimTranscript: string[] = parser.explode(parser.removeXmlTag(this.xmlResponse));
    return trimTranscript.map((line: string) => {
      const aline: Aline = parser.decodeAline(line);
      return {
        startTime: aline.timestamp.getStartTime(),
        durationTime: aline.timestamp.getDurationTime(),
        text: aline.text,
      };
    });
  }

  /**
   * Convert to save in Text format
   *
   * @returns {TextAline[]}
   * @memberof Converter
   */
  public toText(): TextAline[] {
    const parser = new CaptionsParser();
    const trimTranscript: string[] = parser.explode(parser.removeXmlTag(this.xmlResponse));
    return trimTranscript.map((line: string) => {
      const aline: Aline = parser.decodeAline(line);
      return {
        text: aline.text,
      };
    });
  }

  /**
   * Convert to save in Srt format
   *
   * @returns {SrtAline[]}
   * @memberof Converter
   */
  public toSrt(): SrtAline[] {
    const parser = new CaptionsParser();
    const trimTranscript: string[] = parser.explode(parser.removeXmlTag(this.xmlResponse));
    return trimTranscript.map((line: string, index: number) => {
      const numericCounter: string = index + 1 + "\n";
      const aline: Aline = parser.decodeAline(line);
      const text: string = aline.text.replace(/\n/, " ") + "\n";
      return {
        index: numericCounter,
        timestamp: aline.timestamp.formatSrt(),
        text: text,
      };
    });
  }

  /**
   * Convert to save in Vtt format
   *
   * @returns {VttAline[]}
   * @memberof Converter
   */
  public toVtt(): VttAline[] {
    const parser = new CaptionsParser();
    const trimTranscript: string[] = parser.explode(parser.removeXmlTag(this.xmlResponse));
    return trimTranscript.map((line: string) => {
      const aline: Aline = parser.decodeAline(line);
      const text: string = aline.text.replace(/\n/, " ") + "\n";
      return {
        timestamp: aline.timestamp.formatVtt(),
        text: text,
      };
    });
  }

  /**
   * Convert to save in LRC format
   *
   * @returns {LrcAline[]}
   * @memberof Converter
   */
  public toLrc(): LrcAline[] {
    const parser = new CaptionsParser();
    const trimTranscript: string[] = parser.explode(parser.removeXmlTag(this.xmlResponse));
    return trimTranscript.map((line: string) => {
      const aline: Aline = parser.decodeAline(line);
      const text: string = aline.text.replace(/\n/, " ");
      return {
        timestamp: aline.timestamp.formatLrc(),
        text: text,
      };
    });
  }
}
