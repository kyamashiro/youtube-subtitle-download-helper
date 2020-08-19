import { Converter } from "../converter";
import fs from "fs-extra";

let buffer: string;
let converter: Converter;
beforeAll((done) => {
  fs.readFile("src/test/sample-response.xml", "utf-8", (error: any, data: string) => {
    done();
    buffer = data;
    converter = new Converter(buffer);
  });
});

describe("Convert to CSV format", () => {
  test("startTime", () => {
    expect(converter.toCsv()[0]).toHaveProperty("startTime", "00:00:00.000");
  });

  test("durationTime", () => {
    expect(converter.toCsv()[0]).toHaveProperty("durationTime", "00:00:07.000");
  });

  test("text", () => {
    expect(converter.toCsv()[0]).toHaveProperty("text", "Translator: TED Translators admin Reviewer: Allam Zedan");
  });
});

describe("Convert to SRT format", () => {
  test("index", () => {
    expect(converter.toSrt()[0]).toHaveProperty("index", "1\n");
  });

  test("timestamp", () => {
    expect(converter.toSrt()[0]).toHaveProperty("timestamp", "00:00:00,000 --> 00:00:07,000\n");
  });

  test("text", () => {
    expect(converter.toSrt()[0]).toHaveProperty("text", "Translator: TED Translators admin Reviewer: Allam Zedan\n");
  });
});

describe("Convert to VTT format", () => {
  test("timestamp", () => {
    expect(converter.toVtt()[0]).toHaveProperty("timestamp", "00:00:00.000 --> 00:00:07.000\n");
  });

  test("text", () => {
    expect(converter.toVtt()[0]).toHaveProperty("text", "Translator: TED Translators admin Reviewer: Allam Zedan\n");
  });
});

describe("Convert to LRC format", () => {
  test("timestamp", () => {
    expect(converter.toLrc()[0]).toHaveProperty("timestamp", "[00:00.00]");
  });

  test("text", () => {
    expect(converter.toLrc()[0]).toHaveProperty("text", "Translator: TED Translators admin Reviewer: Allam Zedan");
  });
});
