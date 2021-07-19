import fs from "fs-extra";
import "jest-extended";
// import { TranscriptListParser } from "../parser/transcriptListParser";
import { TranscriptListParser } from "../parser/transcriptListParser";

let sampleResponse: string;
let emptyResponse: string;
beforeAll((done) => {
  fs.readFile(
    "src/test/transcriptListData/sampleResponse.xml",
    "utf-8",
    (error: any, data: string) => {
      done();
      sampleResponse = data;
    }
  );

  fs.readFile(
    "src/test/transcriptListData/emptyResponse.xml",
    "utf-8",
    (error: any, data: string) => {
      done();
      emptyResponse = data;
    }
  );
});

test("Throw error when empty response", () => {
  const parser = new TranscriptListParser(emptyResponse);
  expect(() => parser.parse()).toThrowError();
});

test("Parse subtitle list API response", () => {
  const parser = new TranscriptListParser(sampleResponse);
  const transcriptList = parser.parse();
  expect(25).toBe(transcriptList.length);
  expect([{ lang: "ja", langCode: "Japanese(日本語)" }]).toIncludeAnyMembers(
    transcriptList
  );
});
