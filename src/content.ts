import { Timestamp } from "./timestamp";
import { Sentence } from "./sentence";
import { Subtitle } from "./subtitle";
import { Display } from "./display";

console.log("check");

// 再生時間を取得する
function getPlaybackTime(): Timestamp {
  const playback_time: any = document.getElementsByClassName(
    "ytp-time-display"
  );
  return new Timestamp(playback_time[0].textContent);
}

// key:字幕 value:timestamp の配列 Subtitleクラスにする
// exists()とか
var subtitles: { [key: string]: string } = {};

// 字幕を取得する
function getCaptionInnerText() {
  const caption: any = document.getElementsByClassName("ytp-caption-segment");
  for (let c of caption) {
    if (c.textContent) {
      const sentence = new Sentence(c.textContent);
      const timestamp = getPlaybackTime();
      if (!subtitles[sentence.getSentence()]) {
        subtitles[sentence.getSentence()] = timestamp.getTime();
      }
    }
  }
}

var initialize = false;
const display = new Display();
// DOM の変更を検知するオブザーバ
const observer = new MutationObserver(function() {
  if (!initialize) {
    // 表示スペースを作成
    // initialize = display.init();
  }
  // getCaptionInnerText();
  // console.log(subtitles);
  // display.setSubtitle(subtitles);
});

//監視オプションの作成
const options = {
  childList: true,
  subtree: true
};

observer.observe(document, options);
