import { Alines } from "../type/aline";

export interface Convertable {
  convert(xmlResponse: string, fileName: string): void;
  format(xmlResponse: string): Alines;
}
