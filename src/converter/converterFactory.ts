import { Convertable } from "./convertable";
import { CsvConverter } from "./csvConverter";
import { LrcConverter } from "./lrcConverter";
import { SrtConverter } from "./srtConverter";
import { TxtConverter } from "./txtConverter";
import { VttConverter } from "./vttConverter";

export const FileFormat = {
  CSV: "csv",
  TXT: "txt",
  SRT: "srt",
  VTT: "vtt",
  LRC: "lrc",
} as const;

export type FileFormat = typeof FileFormat[keyof typeof FileFormat];

export class ConverterFactory {
  public create(fileFormat: FileFormat): Convertable {
    switch (fileFormat) {
      case FileFormat.CSV:
        return new CsvConverter();
      case FileFormat.SRT:
        return new SrtConverter();
      case FileFormat.VTT:
        return new VttConverter();
      case FileFormat.LRC:
        return new LrcConverter();
      default:
        return new TxtConverter();
    }
  }
}
