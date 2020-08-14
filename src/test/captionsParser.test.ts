import CaptionsParser from "../captionsParser";
import Timestamp from "../timestamp";

var buffer: string;
beforeAll((done) => {
  const fs = require("fs-extra");
  fs.readFile(
    "src/test/sample-response.xml",
    "utf-8",
    (error: any, data: string) => {
      done();
      buffer = data;
    }
  );
});

test("Remove <xml> tag.", () => {
  const parser = new CaptionsParser();
  expect(
    parser.removeXmlTag(
      `<?xml version="1.0" encoding="utf-8" ?><transcript><text start="0" dur="7">Translator: TED Translators admin
    Reviewer: Allam Zedan</text>
    <text start="1097.963" dur="1.389">Thank you.</text><text start="1099.352" dur="0.78">(Applause)</text></transcript>`
    )
  ).toBe(
    `<text start="0" dur="7">Translator: TED Translators admin
    Reviewer: Allam Zedan</text>
    <text start="1097.963" dur="1.389">Thank you.</text><text start="1099.352" dur="0.78">(Applause)</text>`
  );
});

test("Split text into lines.", () => {
  const parser = new CaptionsParser();
  expect(parser.explode(parser.removeXmlTag(buffer)).length).toBe(13);
});

test("Decompose line start time, duration, subtitles.", () => {
  const parser = new CaptionsParser();
  expect(
    parser.decodeAline(
      `<text start="0" dur="7">Translator: TED Translators admin\n Reviewer: Allam Zedan`
    )
  ).toStrictEqual({
    text: "Translator: TED Translators admin  Reviewer: Allam Zedan",
    timestamp: new Timestamp(0, 7),
  });
});

test("If start time or duration time is null, return 0", () => {
  const parser = new CaptionsParser();
  expect(parser.decodeAline(`<text start="0">`)).toStrictEqual({
    text: "",
    timestamp: new Timestamp(0, 0),
  });
});
