import type { Alines } from "@/shared/types/aline";

export interface Convertable<T extends Alines = Alines> {
  convert(xmlResponse: string, fileName: string): Promise<void>;
  format(xmlResponse: string): T;
}
