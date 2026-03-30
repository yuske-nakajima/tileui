---
paths:
  - "demo/**"
---
# デモページルール

- デモは `demo/` ディレクトリに配置する
- ライブラリは `../src/index.ts` から直接 import する（ビルド済み dist は使わない）
- デモの動作確認: `npm run dev` で Vite dev server を起動
