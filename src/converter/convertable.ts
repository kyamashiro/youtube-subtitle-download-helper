import type { Alines } from "../types/aline";

export interface Convertable {
  convert(xmlResponse: string, fileName: string): void;
  format(xmlResponse: string): Alines;
}
