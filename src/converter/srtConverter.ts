import { CaptionsParser } from "../parser/captionsParser";
import { Aline, SrtAline } from "../type/aline";
import { Convertable } from "./convertable";

export class SrtConverter implements Convertable {
  public convert(xmlResponse: string, fileName: string): void {
    const file = this.format(xmlResponse).reduce((acc, cur) => {
      return acc + `${cur.index}\n${cur.timestamp}\n${cur.text}\n\n`;
    }, "");

    chrome.downloads.download({
      url: URL.createObjectURL(new Blob([file], { type: "text/srt" })),
      filename: fileName + ".srt",
    });
  }

  public format(xmlResponse: string): SrtAline[] {
    const parser = new CaptionsParser();
    const trimTranscript: string[] = parser.explode(
      parser.removeXmlTag(xmlResponse)
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
