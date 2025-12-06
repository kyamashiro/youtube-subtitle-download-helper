import fs from "fs-extra";
import { beforeAll, expect, test } from "vitest";
import * as CaptionsParser from "./captionsParser";

let buffer: string;
beforeAll(async () => {
  buffer = await fs.readFile("src/lib/parser/sample-response.xml", "utf-8");
});

test("Remove <xml> tag.", () => {
  expect(
    CaptionsParser.removeXmlTag(
      `<?xml version="1.0" encoding="utf-8" ?><transcript><text start="0" dur="7">Translator: TED Translators admin
    Reviewer: Allam Zedan</text>
    <text start="1097.963" dur="1.389">Thank you.</text><text start="1099.352" dur="0.78">(Applause)</text></transcript>`,
    ),
  ).toBe(
    `<text start="0" dur="7">Translator: TED Translators admin
    Reviewer: Allam Zedan</text>
    <text start="1097.963" dur="1.389">Thank you.</text><text start="1099.352" dur="0.78">(Applause)</text>`,
  );
});

test("Split text into lines.", () => {
  expect(
    CaptionsParser.explode(CaptionsParser.removeXmlTag(buffer)).length,
  ).toBe(13);
});

test("Decompose line start time, duration, subtitles.", () => {
  expect(
    CaptionsParser.decodeAline(
      '<text start="0" dur="7">Translator: TED Translators admin\n Reviewer: Allam Zedan',
    ),
  ).toStrictEqual({
    text: "Translator: TED Translators admin  Reviewer: Allam Zedan",
    timestamp: { start: 0, duration: 7 },
  });
});

test("If start time or duration time is null, return 0", () => {
  expect(CaptionsParser.decodeAline('<text start="0">')).toStrictEqual({
    text: "",
    timestamp: { start: 0, duration: 0 },
  });
});
