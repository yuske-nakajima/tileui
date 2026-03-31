# tileui

[![CI](https://github.com/yuske-nakajima/tileui/actions/workflows/ci.yml/badge.svg)](https://github.com/yuske-nakajima/tileui/actions/workflows/ci.yml)

> CSS Grid タイル型 + SVG ノブの GUI パネルライブラリ

<!-- TODO: スクリーンショットを追加 -->

## 特徴

- CSS Grid による正方形タイルレイアウト
- SVG 回転ノブで直感的な数値操作（270度可動）
- ゼロ依存、軽量
- CSS 変数によるテーマカスタマイズ
- lil-gui / dat.gui 風の簡潔な API
- ESM / UMD 両対応、TypeScript 型定義付き

## インストール

> **Note:** npm 未公開です。公開後に以下のコマンドでインストールできます。

```bash
npm install tileui
```

## クイックスタート

```ts
import TileUI from 'tileui';

const params = { speed: 0.5, volume: 80, color: '#ff0000', enabled: true };

const gui = new TileUI({ title: 'Controls' });

// 数値（ノブ）: min, max, step を指定
gui.add(params, 'speed', 0, 1, 0.01).onChange((v) => console.log('speed:', v));

// 数値（入力欄）: min/max なし
gui.add(params, 'volume');

// カラーピッカー
gui.addColor(params, 'color');

// トグルスイッチ
gui.addBoolean(params, 'enabled');

// ボタン
gui.addButton('Reset', () => console.log('reset!'));

// フォルダ（サブグリッド）
const folder = gui.addFolder('Advanced');
folder.add(params, 'speed', 0, 1, 0.01);
```

## API リファレンス

### `new TileUI(options?)`

GUI パネルを作成する。

| オプション | 型 | デフォルト | 説明 |
|-----------|-----|----------|------|
| `container` | `HTMLElement` | `document.body` | パネルの挿入先 |
| `columns` | `number` | auto-fill | グリッドの列数 |
| `title` | `string` | — | パネルのタイトル |

### `gui.add(obj, prop, min?, max?, step?)`

数値コントローラーを追加する。`min`/`max` を指定すると SVG ノブ、省略すると数値入力欄になる。

### `gui.addBoolean(obj, prop)`

トグルスイッチを追加する。

### `gui.addColor(obj, prop)`

カラーピッカーを追加する。

### `gui.addButton(label, callback)`

クリック可能なボタンタイルを追加する。

### `gui.addFolder(title)`

サブグリッド（フォルダ）を追加する。戻り値は新しい `TileUI` インスタンス。

### `gui.updateDisplay()`

全コントローラーの表示を現在のオブジェクト値に同期する。

### `gui.dispose()`

全コントローラーと DOM 要素をクリーンアップする。

### `controller.onChange(callback)`

値変更時のコールバックを設定する。メソッドチェーン対応。

```ts
gui.add(params, 'speed', 0, 1).onChange((v) => {
  // v: number
});
```

## テーマカスタマイズ

CSS 変数をオーバーライドすることで、パネルの見た目をカスタマイズできる。

```css
:root {
  --tileui-tile-size: 120px;
  --tileui-bg: #1a1a2e;
  --tileui-tile-bg: #16213e;
  --tileui-tile-bg-hover: #1c2a4a;
  --tileui-border: #0f3460;
  --tileui-text: #e0e0e0;
  --tileui-text-muted: #8a8a9a;
  --tileui-accent: #0ea5e9;
  --tileui-knob-track: #2a2a4a;
  --tileui-knob-value: var(--tileui-accent);
  --tileui-knob-thumb: #ffffff;
  --tileui-toggle-off: #3a3a5a;
  --tileui-toggle-on: var(--tileui-accent);
  --tileui-radius: 4px;
  --tileui-font-size: 11px;
  --tileui-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

## ライセンス

[MIT](./LICENSE)

[English](./README.en.md)
