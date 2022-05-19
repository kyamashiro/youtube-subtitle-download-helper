import { CaptionsParser } from "../parser/captionsParser";
import { Aline, CsvAline } from "../type/aline";
import { Convertable } from "./convertable";
import json2csv from "json-2-csv";

export class CsvConverter implements Convertable {
  public convert(xmlResponse: string, fileName: string): void {
    const csvAlines = this.format(xmlResponse);

    json2csv
      .json2csvAsync(csvAlines, {
        excelBOM: true,
      })
      .then((csv: string) => {
        chrome.downloads.download({
          url: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
          filename: fileName + ".csv",
        });
      })
      .catch((err: Error) => {
        if (err) throw err;
      });
  }

  public format(xmlResponse: string): CsvAline[] {
    const parser = new CaptionsParser();
    const trimTranscript: string[] = parser.explode(
      parser.removeXmlTag(xmlResponse)
    );

    return trimTranscript.map((line: string) => {
      const aline: Aline = parser.decodeAline(line);
      return {
        startTime: aline.timestamp.getStartTime(),
        durationTime: aline.timestamp.getDurationTime(),
        text: aline.text,
      };
    });
  }
}
