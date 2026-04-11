# E2E テストルール

- E2E テストは `e2e/` ディレクトリに配置する
- Playwright を使用（`npm run test:e2e`）
- CI には組み込まない（ローカル実行のみ）
- **demo ページを変更した場合は `npm run test:e2e` を実行してリグレッション確認すること**
- モバイルエミュレーション（Pixel 7）とデスクトップ Chrome の 2 プロジェクトで実行
- Vite dev server は Playwright が自動起動する
