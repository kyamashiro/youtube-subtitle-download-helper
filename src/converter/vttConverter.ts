import { decodeAline, explode, removeXmlTag } from "../parser/captionsParser";
import { formatVtt } from "../timestamp";
import type { Aline, VttAline } from "../types/aline";
import { DownloadHelper } from "../utils/downloadHelper";
import type { Convertable } from "./convertable";

export const VttConverter: Convertable<VttAline[]> = {
  async convert(xmlResponse: string, fileName: string): Promise<void> {
    const lines = this.format(xmlResponse);
    const file = lines.reduce((acc: string, cur: VttAline) => {
      return `${acc}${cur.timestamp}\n${cur.text}\n\n`;
    }, "WEBVTT\n\n");

    await DownloadHelper.downloadFile(file, `${fileName}.vtt`, "text/vtt");
  },

  format(xmlResponse: string): VttAline[] {
    const trimTranscript: string[] = explode(removeXmlTag(xmlResponse));
    return trimTranscript.map((line: string) => {
      const aline: Aline = decodeAline(line);
      const text: string = aline.text.replace(/\n/, " ");
      return {
        timestamp: formatVtt(aline.timestamp),
        text: text,
      };
    });
  },
};
