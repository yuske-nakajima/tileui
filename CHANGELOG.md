## [0.2.1](https://github.com/yuske-nakajima/tileui/compare/v0.2.0...v0.2.1) (2026-04-10)

### Features

* .style()にborderColorオプションを追加 ([51ced21](https://github.com/yuske-nakajima/tileui/commit/51ced216972c7f853d6a4a969a3de8968d286144))
* **demo:** p5.jsジェネラティブアートを実装 ([83ea83d](https://github.com/yuske-nakajima/tileui/commit/83ea83db96d81b4300747af97045a3ab9235dc34))
* **demo:** tileui↔p5.jsリアルタイム連携を実装 ([a706d49](https://github.com/yuske-nakajima/tileui/commit/a706d49863cf67d765109b0a695e9359c805a393))
* **demo:** ショーケースセクションを追加、パネル幅をフィット ([36ff889](https://github.com/yuske-nakajima/tileui/commit/36ff889015ab1d59984838fc3c6f52adc9b9c148))
* **demo:** ショーケースのCustom StylesにborderColorを追加 ([742e764](https://github.com/yuske-nakajima/tileui/commit/742e7641d87c630dfedce9a413b257ca5c478190))
* **demo:** デモページ骨格とNothing designスタイルを実装 ([b3ce0c4](https://github.com/yuske-nakajima/tileui/commit/b3ce0c4a3a460ef62302867c30ddd60a1a99e764))
* **demo:** レスポンシブ対応とデモ専用ビルド設定を追加 ([981887a](https://github.com/yuske-nakajima/tileui/commit/981887a0c633366cc01c0fa76a7e6137aa2db84a))
* **demo:** 仕上げ（OGP、ダークモード、READMEリンク） ([c05da81](https://github.com/yuske-nakajima/tileui/commit/c05da8147cc17c22745b399a123ce239e56fe60c))
* タイルの背景色・フォントカラーを個別設定可能にする ([9f86cc7](https://github.com/yuske-nakajima/tileui/commit/9f86cc7c29cb97b92cf8c4dbb8e9b0ff7793ce30)), closes [#28](https://github.com/yuske-nakajima/tileui/issues/28)

### Bug Fixes

* demo用tsconfig.jsonを追加してTS6059エラーを解消 ([abb927f](https://github.com/yuske-nakajima/tileui/commit/abb927f1f01d6901a3acf2eee7d43c35e25ccb40))
* タイルのborderを重ねて隙間を解消 ([e20d573](https://github.com/yuske-nakajima/tileui/commit/e20d573b7dde98e097de4d23aeb07378239ef382))
* タイル間の余白を除去してピタッと並べる ([f8a10a8](https://github.com/yuske-nakajima/tileui/commit/f8a10a859f1b78dc9a215ae117e8784c6d7950d4)), closes [#27](https://github.com/yuske-nakajima/tileui/issues/27)
* ノブの値表示で小数点以下の桁数を制限 ([e20b8a7](https://github.com/yuske-nakajima/tileui/commit/e20b8a7179b664b3b4bf006d2e9db550345081af)), closes [#26](https://github.com/yuske-nakajima/tileui/issues/26)

## [0.2.0](https://github.com/yuske-nakajima/tileui/compare/v0.1.1...v0.2.0) (2026-04-10)

### ⚠ BREAKING CHANGES

* パッケージ名が tileui から @yuske-nakajima/tileui に変更

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>

### Features

* パッケージ名を @yuske-nakajima/tileui に変更 ([45efdee](https://github.com/yuske-nakajima/tileui/commit/45efdeefa865601d9f2605e71e3e5850d6204393))

## [0.1.1](https://github.com/yuske-nakajima/tileui/compare/b99531ce616e51710fbda17f2ab3678ceda24c08...v0.1.1) (2026-04-10)

### Features

* **build:** Vite + TypeScript + Biome のビルド基盤を構築 ([b99531c](https://github.com/yuske-nakajima/tileui/commit/b99531ce616e51710fbda17f2ab3678ceda24c08)), closes [#1](https://github.com/yuske-nakajima/tileui/issues/1)
* **controllers:** 5種のコントローラーを実装 ([68f8131](https://github.com/yuske-nakajima/tileui/commit/68f813128b15983a13304e2148f78e84061e019b)), closes [#3](https://github.com/yuske-nakajima/tileui/issues/3)
* **core:** ユーティリティ・基底クラス・スタイルを実装 ([72a4461](https://github.com/yuske-nakajima/tileui/commit/72a4461980cfcbcb2aea3a7e820166a1156435c4)), closes [#2](https://github.com/yuske-nakajima/tileui/issues/2)
* **scripts:** dev serverのバックグラウンド管理コマンドを追加 ([5f1ef06](https://github.com/yuske-nakajima/tileui/commit/5f1ef06e20729c80ef2fe860d6ae9a58985c7302))
* **tileui:** メインクラス TileUI とデモページを実装 ([68c6188](https://github.com/yuske-nakajima/tileui/commit/68c6188bfc1243f4770750f72fe71667df5893a4)), closes [#4](https://github.com/yuske-nakajima/tileui/issues/4)

### Bug Fixes

* **ci:** auto-tag.ymlにpublishジョブを統合 ([43017a7](https://github.com/yuske-nakajima/tileui/commit/43017a7c103c79fad79813298d088e653953cbd2))
* **deps:** vite セキュリティ脆弱性の修正 ([b643752](https://github.com/yuske-nakajima/tileui/commit/b6437526c6bf5edc0b6d69537f21cbf8f050259f)), closes [#22](https://github.com/yuske-nakajima/tileui/issues/22)
