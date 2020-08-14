import VideoInfoParser from "../videoInfoParser";

var buffer: string;
beforeAll((done) => {
  const fs = require("fs-extra");
  fs.readFile("src/test/videoinfo.txt", "utf-8", (error: any, data: string) => {
    done();
    buffer = data;
  });
});

test("Get video title and replace + |", () => {
  const videoinfo = new VideoInfoParser(buffer);
  expect(videoinfo.getVideoTitle()).toBe(
    "How to learn any language in six months Chris Lonsdale TEDxLingnanUniversity"
  );
});

test("Convert Captions to JSON.", () => {
  const videoinfo = new VideoInfoParser(buffer);
  expect(videoinfo.getCaptionsData().length).toBe(22);
});

test("Captions data include video info response.", () => {
  const videoinfo = new VideoInfoParser(buffer);
  expect(videoinfo.getCaptionsData()[21]).toMatchObject({
    baseUrl:
      "https://www.youtube.com/api/timedtext?v=d0yGdNEWdn0&asr_langs=de,en,es,fr,it,ja,ko,nl,pt,ru&caps=asr&xorp=true&hl=ja&ip=0.0.0.0&ipbits=0&expire=1567106305&sparams=ip,ipbits,expire,v,asr_langs,caps,xorp&signature=B4954FC40AF6A4C78110AFCD2F1B06DFEB9FCF23.B2BCAF7AAD8C2BD392A89B035F9DCAACEDBC9F4C&key=yt8&lang=ja",
    languageCode: "ja",
    name: { simpleText: "日本語" },
  });
});
