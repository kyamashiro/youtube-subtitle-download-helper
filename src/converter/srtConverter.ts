import { CaptionsParser } from "../parser/captionsParser";
import { Aline } from "../type/aline";
import { Convertable } from "./convertable";
import json2csv from "json-2-csv";
import { SrtAline } from "../type/aline";

export class SrtConverter implements Convertable {
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
          url: URL.createObjectURL(new Blob([csv], { type: "text/srt" })),
          filename: fileName + ".srt",
        });
      })
      .catch((err: any) => {
        if (err) throw err;
      });
  }

  public format(xmlResponse: string): SrtAline[] {
    const parser = new CaptionsParser();
    const trimTranscript: string[] = parser.explode(
      parser.removeXmlTag(xmlResponse)
    );
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
}
