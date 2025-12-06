import json2csv from "json-2-csv";
import { decodeAline, explode, removeXmlTag } from "../parser/captionsParser";
import { getDurationTime, getStartTime } from "../timestamp";
import type { Aline, CsvAline } from "../types/aline";
import { DownloadHelper } from "../utils/downloadHelper";
import type { Convertable } from "./convertable";

export const CsvConverter: Convertable = {
  async convert(xmlResponse: string, fileName: string): Promise<void> {
    const csvAlines = this.format(xmlResponse);

    try {
      const csv = await json2csv.json2csvAsync(csvAlines, {
        excelBOM: true,
      });

      await DownloadHelper.downloadFile(csv, `${fileName}.csv`, "text/csv");
    } catch (err) {
      throw new Error(`CSV conversion failed: ${err}`);
    }
  },

  format(xmlResponse: string): CsvAline[] {
    const trimTranscript: string[] = explode(removeXmlTag(xmlResponse));

    return trimTranscript.map((line: string) => {
      const aline: Aline = decodeAline(line);
      return {
        startTime: getStartTime(aline.timestamp),
        durationTime: getDurationTime(aline.timestamp),
        text: aline.text,
      };
    });
  },
};
