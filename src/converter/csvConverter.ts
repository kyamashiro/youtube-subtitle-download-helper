import { CaptionsParser } from "../parser/captionsParser";
import type { Aline, CsvAline } from "../types/aline";
import type { Convertable } from "./convertable";
import { DownloadHelper } from "../utils/downloadHelper";
import json2csv from "json-2-csv";

export class CsvConverter implements Convertable {
  public async convert(xmlResponse: string, fileName: string): Promise<void> {
    const csvAlines = this.format(xmlResponse);

    try {
      const csv = await json2csv.json2csvAsync(csvAlines, {
        excelBOM: true,
      });

      await DownloadHelper.downloadFile(csv, `${fileName}.csv`, "text/csv");
    } catch (err) {
      throw new Error(`CSV conversion failed: ${err}`);
    }
  }

  public format(xmlResponse: string): CsvAline[] {
    const parser = new CaptionsParser();
    const trimTranscript: string[] = parser.explode(
      parser.removeXmlTag(xmlResponse),
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
