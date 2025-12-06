import fs from "fs-extra";
import { beforeAll, expect, test } from "vitest";
import type {
  CsvAline,
  LrcAline,
  SrtAline,
  TextAline,
  VttAline,
} from "../types/aline";
import { createConverter, FileFormat } from "./converterFactory";

let xml: string;
beforeAll(async () => {
  xml = await fs.readFile(
    "src/converter/testData/Grit the power of passion and perseverance  Angela Lee Duckworth - 英語.xml",
    "utf-8",
  );
});

let csv: CsvAline[];
beforeAll(async () => {
  const data = await fs.readFile("src/converter/testData/csv.json", "utf-8");
  csv = JSON.parse(data) as CsvAline[];
});

test("CSV format conversion content test", () => {
  const converter = createConverter(FileFormat.CSV);
  expect(converter.format(xml)).toStrictEqual(csv);
});

let lrc: LrcAline[];
beforeAll(async () => {
  const data = await fs.readFile("src/converter/testData/lrc.json", "utf-8");
  lrc = JSON.parse(data) as LrcAline[];
});

test("LRC format conversion content test", () => {
  const converter = createConverter(FileFormat.LRC);
  expect(converter.format(xml)).toStrictEqual(lrc);
});

let srt: SrtAline[];
beforeAll(async () => {
  const data = await fs.readFile("src/converter/testData/srt.json", "utf-8");
  srt = JSON.parse(data) as SrtAline[];
});

test("SRT format conversion content test", () => {
  const converter = createConverter(FileFormat.SRT);
  expect(converter.format(xml)).toStrictEqual(srt);
});

let vtt: VttAline[];
beforeAll(async () => {
  const data = await fs.readFile("src/converter/testData/vtt.json", "utf-8");
  vtt = JSON.parse(data) as VttAline[];
});

test("VTT format conversion content test", () => {
  const converter = createConverter(FileFormat.VTT);
  expect(converter.format(xml)).toStrictEqual(vtt);
});

let txt: TextAline[];
beforeAll(async () => {
  const data = await fs.readFile("src/converter/testData/txt.json", "utf-8");
  txt = JSON.parse(data) as TextAline[];
});

test("Text format conversion content test", () => {
  const converter = createConverter(FileFormat.TXT);
  expect(converter.format(xml)).toStrictEqual(txt);
});
