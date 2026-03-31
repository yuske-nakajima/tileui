---
paths:
  - "src/**/__tests__/**/*.test.ts"
---
# テストルール

- テストファイルは `__tests__/` ディレクトリ内に `*.test.ts` パターンで作成する
- テストランナーは Vitest を使用する（`describe`, `it`, `expect` を import）
- DOM テストが必要な場合は jsdom 環境を使用する
- テスト実行コマンド: `npm run test`
