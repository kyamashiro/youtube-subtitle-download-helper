import { CaptionsParser } from "../parser/captionsParser";
import type { Aline, SrtAline } from "../types/aline";
import type { Convertable } from "./convertable";
import { DownloadHelper } from "../utils/downloadHelper";

export class SrtConverter implements Convertable {
  public async convert(xmlResponse: string, fileName: string): Promise<void> {
    const file = this.format(xmlResponse).reduce((acc, cur) => {
      return `${acc}${cur.index}\n${cur.timestamp}\n${cur.text}\n\n`;
    }, "");

    await DownloadHelper.downloadFile(file, `${fileName}.srt`, "text/srt");
  }

  public format(xmlResponse: string): SrtAline[] {
    const parser = new CaptionsParser();
    const trimTranscript: string[] = parser.explode(
      parser.removeXmlTag(xmlResponse),
    );
    return trimTranscript.map((line: string, index: number) => {
      const numericCounter = index + 1;
      const aline: Aline = parser.decodeAline(line);
      const text: string = aline.text.replace(/\n/, " ");
      return {
        index: numericCounter,
        timestamp: aline.timestamp.formatSrt(),
        text: text,
      };
    });
  }
}
