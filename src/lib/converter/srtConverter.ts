import { decodeAline, explode, removeXmlTag } from "@/lib/parser/captionsParser";
import { formatSrt } from "@/lib/timestamp";
import type { Aline, SrtAline } from "@/shared/types/aline";
import { DownloadHelper } from "@/shared/utils/downloadHelper";
import type { Convertable } from "./convertable";

export const SrtConverter: Convertable<SrtAline[]> = {
  async convert(xmlResponse: string, fileName: string): Promise<void> {
    const lines = this.format(xmlResponse);
    const file = lines.reduce((acc: string, cur: SrtAline) => {
      return `${acc}${cur.index}\n${cur.timestamp}\n${cur.text}\n\n`;
    }, "");

    await DownloadHelper.downloadFile(file, `${fileName}.srt`, "text/srt");
  },

  format(xmlResponse: string): SrtAline[] {
    const trimTranscript: string[] = explode(removeXmlTag(xmlResponse));
    return trimTranscript.map((line: string, index: number) => {
      const numericCounter = index + 1;
      const aline: Aline = decodeAline(line);
      const text: string = aline.text.replace(/\n/, " ");
      return {
        index: numericCounter,
        timestamp: formatSrt(aline.timestamp),
        text: text,
      };
    });
  },
};
