import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// デモページ専用のビルド設定
export default defineConfig({
	root: resolve(import.meta.dirname, 'demo'),
	base: '/',
	build: {
		outDir: resolve(import.meta.dirname, 'demo-dist'),
		emptyOutDir: true,
	},
});
