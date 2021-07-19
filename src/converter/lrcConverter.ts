import { CaptionsParser } from "../parser/captionsParser";
import { Aline, LrcAline } from "../type/aline";
import { Convertable } from "./convertable";

export class LrcConverter implements Convertable {
  public convert(xmlResponse: string, fileName: string): void {
    const file: string = this.format(xmlResponse).reduce((acc, cur) => {
      return acc + `${cur.timestamp}${cur.text}\n`;
    }, "");

    chrome.downloads.download({
      url: URL.createObjectURL(new Blob([file], { type: "text/lrc" })),
      filename: fileName + ".lrc",
    });
  }

  public format(xmlResponse: string): LrcAline[] {
    const parser = new CaptionsParser();
    const trimTranscript: string[] = parser.explode(
      parser.removeXmlTag(xmlResponse)
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
