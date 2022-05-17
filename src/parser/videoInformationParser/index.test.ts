import fs from "fs-extra";
import { VideoInformationResponseParse } from "./index";

let buffer: string;
let realData: any;

beforeAll((done) => {
  fs.readFile(
    "src/parser/videoInformationParser/testData/sampleResponse.txt",
    "utf-8",
    (error: any, data: string) => {
      done();
      buffer = data;
    }
  );
});

beforeAll((done) => {
  fs.readFile(
    "src/parser/videoInformationParser/testData/captionTrackList.json",
    "utf-8",
    (error: any, data: string) => {
      done();
      realData = JSON.parse(data);
    }
  );
});

test("Extract caption tracks list", () => {
  expect(VideoInformationResponseParse(buffer)).toStrictEqual(realData);
});
