import { CaptionsParser } from "../parser/captionsParser";
import type { Aline, VttAline } from "../types/aline";
import type { Convertable } from "./convertable";
import { DownloadHelper } from "../utils/downloadHelper";

export class VttConverter implements Convertable {
  public async convert(xmlResponse: string, fileName: string): Promise<void> {
    const file = this.format(xmlResponse).reduce((acc, cur) => {
      return `${acc}${cur.timestamp}\n${cur.text}\n\n`;
    }, "WEBVTT\n\n");

    await DownloadHelper.downloadFile(file, `${fileName}.vtt`, "text/vtt");
  }

  public format(xmlResponse: string): VttAline[] {
    const parser = new CaptionsParser();
    const trimTranscript: string[] = parser.explode(
      parser.removeXmlTag(xmlResponse),
    );
    return trimTranscript.map((line: string) => {
      const aline: Aline = parser.decodeAline(line);
      const text: string = aline.text.replace(/\n/, " ");
      return {
        timestamp: aline.timestamp.formatVtt(),
        text: text,
      };
    });
  }
}
