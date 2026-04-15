import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// package.json から version を読み取り
const pkg = JSON.parse(readFileSync(resolve(import.meta.dirname, 'package.json'), 'utf-8'));

// デモページ専用のビルド設定（マルチページ対応）
export default defineConfig({
	define: {
		__VERSION__: JSON.stringify(pkg.version),
	},
	root: resolve(import.meta.dirname, 'demo'),
	base: '/',
	build: {
		outDir: resolve(import.meta.dirname, 'demo-dist'),
		emptyOutDir: true,
		rollupOptions: {
			input: {
				main: resolve(import.meta.dirname, 'demo/index.html'),
				dock: resolve(import.meta.dirname, 'demo/dock.html'),
			},
		},
	},
});
