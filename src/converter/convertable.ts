import { Alines } from "../type/aline.ts";

export interface Convertable {
  convert(xmlResponse: string, fileName: string): void;
  format(xmlResponse: string): Alines;
}
