import fs from "fs-extra";
import { ConverterFactory, FileFormat } from "./converterFactory";
import {
  CsvAline,
  LrcAline,
  SrtAline,
  TextAline,
  VttAline,
} from "../type/aline";

let xml: string;
beforeAll((done) => {
  fs.readFile(
    "src/converter/testData/Grit the power of passion and perseverance  Angela Lee Duckworth - 英語.xml",
    "utf-8",
    (error: any, data: string) => {
      done();
      xml = data;
    }
  );
});

let csv: CsvAline[];
beforeAll((done) => {
  fs.readFile(
    "src/converter/testData/csv.json",
    "utf-8",
    (error: any, data: string) => {
      done();
      csv = JSON.parse(data) as CsvAline[];
    }
  );
});

test("CSV format conversion content test", () => {
  const converterFactory = new ConverterFactory();
  const converter = converterFactory.create(FileFormat.CSV);
  expect(converter.format(xml)).toStrictEqual(csv);
});

let lrc: LrcAline[];
beforeAll((done) => {
  fs.readFile(
    "src/converter/testData/lrc.json",
    "utf-8",
    (error: any, data: string) => {
      done();
      lrc = JSON.parse(data) as LrcAline[];
    }
  );
});

test("LRC format conversion content test", () => {
  const converterFactory = new ConverterFactory();
  const converter = converterFactory.create(FileFormat.LRC);
  expect(converter.format(xml)).toStrictEqual(lrc);
});

let srt: SrtAline[];
beforeAll((done) => {
  fs.readFile(
    "src/converter/testData/srt.json",
    "utf-8",
    (error: any, data: string) => {
      done();
      srt = JSON.parse(data) as SrtAline[];
    }
  );
});

test("SRT format conversion content test", () => {
  const converterFactory = new ConverterFactory();
  const converter = converterFactory.create(FileFormat.SRT);
  expect(converter.format(xml)).toStrictEqual(srt);
});

let vtt: VttAline[];
beforeAll((done) => {
  fs.readFile(
    "src/converter/testData/vtt.json",
    "utf-8",
    (error: any, data: string) => {
      done();
      vtt = JSON.parse(data) as VttAline[];
    }
  );
});

test("VTT format conversion content test", () => {
  const converterFactory = new ConverterFactory();
  const converter = converterFactory.create(FileFormat.VTT);
  expect(converter.format(xml)).toStrictEqual(vtt);
});

let txt: TextAline[];
beforeAll((done) => {
  fs.readFile(
    "src/converter/testData/txt.json",
    "utf-8",
    (error: any, data: string) => {
      done();
      txt = JSON.parse(data) as TextAline[];
    }
  );
});

test("Text format conversion content test", () => {
  const converterFactory = new ConverterFactory();
  const converter = converterFactory.create(FileFormat.TXT);
  expect(converter.format(xml)).toStrictEqual(txt);
});
