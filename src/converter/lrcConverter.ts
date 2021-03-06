import { CaptionsParser } from "../parser/captionsParser";
import { Aline } from "../type/aline";
import { Convertable } from "./convertable";
import json2csv from "json-2-csv";
import { LrcAline } from "../type/aline";

export class LrcConverter implements Convertable {
  public convert(xmlResponse: string, fileName: string): void {
    const file = this.format(xmlResponse);

    const options = {
      delimiter: {
        wrap: "",
        field: "",
        eol: "\n",
      },
      prependHeader: false,
      excelBOM: true,
    };

    json2csv
      .json2csvAsync(file, options)
      .then((csv: string) => {
        chrome.downloads.download({
          url: URL.createObjectURL(new Blob([csv], { type: "text/lrc" })),
          filename: fileName + ".lrc",
        });
      })
      .catch((err: any) => {
        if (err) throw err;
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
