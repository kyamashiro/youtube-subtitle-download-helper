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

## TODO

1. ファイル名を動画名+langCode.csvにする
2. txtで保存できるようにする
3. 字幕があるのに保存できない動画をなんとかする
4. 見た目カスタマイズ