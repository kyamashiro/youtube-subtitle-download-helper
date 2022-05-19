import fs from "fs-extra";
import { VideoInformationResponseParser } from "./videoInformationParser";

let buffer: string;
let realData: any;

beforeAll((done) => {
  fs.readFile(
    "src/parser/testData/sampleResponse.html",
    "utf-8",
    (error: any, data: string) => {
      done();
      buffer = data;
    }
  );
});

beforeAll((done) => {
  fs.readFile(
    "src/parser/testData/captionTrackList.json",
    "utf-8",
    (error: any, data: string) => {
      done();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      realData = JSON.parse(data);
    }
  );
});

test("Extract caption tracks list", () => {
  expect(VideoInformationResponseParser.parse(buffer)).toStrictEqual(realData);
});
