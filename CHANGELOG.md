# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1] - 2026-04-03

### Changed

- @biomejs/biome 2.4.9 → 2.4.10
- Node.js 22.21.1 → 22.22.2

### Added

- 依存性チェック用の定期 GitHub Actions ワークフロー (dep-check.yml)
- typescript-eslint による deprecated API チェック
- バージョニングルール (.claude/rules/versioning.md)
- .vite/ を biome チェック対象・.gitignore から除外

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
