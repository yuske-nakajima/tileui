# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - Unreleased

### Added

- CSS Grid ベースのタイルレイアウト GUI パネル (`TileUI`)
- SVG 回転ノブによる数値コントローラー (`KnobController`)
- 数値入力コントローラー (`NumberInputController`)
- 真偽値トグルコントローラー (`BooleanController`)
- カラーピッカーコントローラー (`ColorController`)
- ボタンコントローラー (`ButtonController`)
- フォルダ（サブグリッド）による階層構造サポート
- CSS 変数によるテーマカスタマイズ
- ESM / UMD 両形式でのビルド出力
- TypeScript 型定義の自動生成
- ゼロ依存（外部ライブラリ不要）
- GitHub Actions CI（lint, test, build）
- タグ push による npm 自動公開ワークフロー
