import { Convertable } from "./convertable";
import { CsvConverter } from "./csvConverter";
import { LrcConverter } from "./lrcConverter";
import { SrtConverter } from "./srtConverter";
import { TxtConverter } from "./txtConverter";
import { VttConverter } from "./vttConverter";

export class ConverterFactory {
  public create(fileFormat: string): Convertable {
    switch (fileFormat) {
      case "csv":
        return new CsvConverter();
      case "srt":
        return new SrtConverter();
      case "vtt":
        return new VttConverter();
      case "lrc":
        return new LrcConverter();
      default:
        return new TxtConverter();
    }
  }
}
