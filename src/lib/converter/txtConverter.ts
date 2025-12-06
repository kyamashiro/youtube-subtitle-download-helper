import json2csv from "json-2-csv";
import { decodeAline, explode, removeXmlTag } from "@/lib/parser/captionsParser";
import type { Aline, TextAline } from "@/shared/types/aline";
import { DownloadHelper } from "@/shared/utils/downloadHelper";
import type { Convertable } from "./convertable";

const options = {
  delimiter: {
    wrap: "",
    field: "",
    eol: "\n",
  },
  prependHeader: false,
  excelBOM: true,
};

export const TxtConverter: Convertable = {
  async convert(xmlResponse: string, fileName: string): Promise<void> {
    const file = this.format(xmlResponse);

    try {
      const csv = await json2csv.json2csvAsync(file, options);
      await DownloadHelper.downloadFile(csv, `${fileName}.txt`, "text/plain");
    } catch (err) {
      throw new Error(`TXT conversion failed: ${err}`);
    }
  },

  format(xmlResponse: string): TextAline[] {
    const trimTranscript: string[] = explode(removeXmlTag(xmlResponse));
    return trimTranscript.map((line: string) => {
      const aline: Aline = decodeAline(line);
      return {
        text: aline.text,
      };
    });
  },
};
