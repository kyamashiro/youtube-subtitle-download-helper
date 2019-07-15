# DOC

## Type Script Deep Diveの日本語版
https://typescript-jp.gitbook.io/deep-dive/styleguide

## Prerequisites
YouTube Data API でも字幕は取れるが認証情報が必要なので、配布型の Chrome 拡張では使えない  
https://developers.google.com/youtube/v3/getting-started?hl=ja

## Tool
コード変更時の自動リロードが便利
https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid/related


## init
使用したコマンド
```sh
// セットアップ形
npm init
npm i -D webpack webpack-cli typescript ts-loader webpack-merge
tsc --init
npm install --save-dev @types/chrome

// 開発で使用するコマンド
npm run watch // 自動で変更を検知してトランスパイルしてくれる
```

## 仕様
- [x] Chromeメニューにアイコンを表示する
- [x] タグ内の字幕を取得
```html
<span class="ytp-caption-segment">
```
- [x] 字幕が表示された再生時間を取得
- [ ] 字幕を表示するための新しいウィンドウを表示する
- [ ] 取得した再生時間・字幕(1:13/10:00 Hello, world)を右側に表示する
- [ ] 再生時間を押すとその場所へ飛ぶ

## 設計
Timestamp型とCaption型を作る

2行のときどうするか


array["0:00/14:00"] = "text"