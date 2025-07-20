import { CaptionsParser } from "../parser/captionsParser";
import type { Aline, TextAline } from "../types/aline";
import type { Convertable } from "./convertable";
import { DownloadHelper } from "../utils/downloadHelper";
import json2csv from "json-2-csv";

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
  public async convert(xmlResponse: string, fileName: string): Promise<void> {
    const file = this.format(xmlResponse);
    
    try {
      const csv = await json2csv.json2csvAsync(file, options);
      await DownloadHelper.downloadFile(csv, `${fileName}.txt`, "text/plain");
    } catch (err) {
      throw new Error(`TXT conversion failed: ${err}`);
    }
  }

  public format(xmlResponse: string): TextAline[] {
    const parser = new CaptionsParser();
    const trimTranscript: string[] = parser.explode(
      parser.removeXmlTag(xmlResponse),
    );
    return trimTranscript.map((line: string) => {
      const aline: Aline = parser.decodeAline(line);
      return {
        text: aline.text,
      };
    });
  }
}
