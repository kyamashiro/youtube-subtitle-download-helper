import { CaptionsParser } from "../parser/captionsParser";
import { Aline } from "../type/aline";
import { Convertable } from "./convertable";
import json2csv from "json-2-csv";
import { TextAline } from "../type/aline";

const options = {
  delimiter: {
    wrap: "",
    field: "",
    eol: "\n",
  },
  prependHeader: false,
  excelBOM: true,
};

export class TxtConverter implements Convertable {
  public convert(xmlResponse: string, fileName: string): void {
    const file = this.format(xmlResponse);
    json2csv
      .json2csvAsync(file, options)
      .then((csv: string) => {
        chrome.downloads.download({
          url: URL.createObjectURL(new Blob([csv], { type: "text/plane" })),
          filename: fileName + ".txt",
        });
      })
      .catch((err: any) => {
        if (err) throw err;
      });
  }

  private format(xmlResponse: string): TextAline[] {
    const parser = new CaptionsParser();
    const trimTranscript: string[] = parser.explode(
      parser.removeXmlTag(xmlResponse)
    );
    return trimTranscript.map((line: string) => {
      const aline: Aline = parser.decodeAline(line);
      return {
        text: aline.text,
      };
    });
  }
}
