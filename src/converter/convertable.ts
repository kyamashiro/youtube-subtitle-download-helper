export interface Convertable {
  convert(xmlResponse: string, fileName: string): void;
}
