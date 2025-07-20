import { CaptionsParser } from "../parser/captionsParser";
import type { Aline, LrcAline } from "../types/aline";
import type { Convertable } from "./convertable";
import { DownloadHelper } from "../utils/downloadHelper";

export class LrcConverter implements Convertable {
  public async convert(xmlResponse: string, fileName: string): Promise<void> {
    const file: string = this.format(xmlResponse).reduce((acc, cur) => {
      return `${acc}${cur.timestamp}${cur.text}\n`;
    }, "");

    await DownloadHelper.downloadFile(file, `${fileName}.lrc`, "text/lrc");
  }

  public format(xmlResponse: string): LrcAline[] {
    const parser = new CaptionsParser();
    const trimTranscript: string[] = parser.explode(
      parser.removeXmlTag(xmlResponse),
    );
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
