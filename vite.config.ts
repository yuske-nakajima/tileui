import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// package.json から version を読み取り
const pkg = JSON.parse(readFileSync(resolve(import.meta.dirname, 'package.json'), 'utf-8'));

// Vite 8.x では import.meta.dirname を使用
export default defineConfig(({ command }) => ({
	// dev server はデモページをルートにする
	root: command === 'serve' ? resolve(import.meta.dirname, 'demo') : undefined,
	define: {
		__VERSION__: JSON.stringify(pkg.version),
	},
	build: {
		minify: 'oxc',
		rollupOptions: {
			output: {
				exports: 'named',
			},
		},
		lib: {
			entry: resolve(import.meta.dirname, 'src/index.ts'),
			name: 'TileUI',
			formats: ['es', 'umd'],
			fileName: (format) => {
				if (format === 'es') return 'tileui.js';
				if (format === 'umd') return 'tileui.umd.cjs';
				return `tileui.${format}.js`;
			},
		},
	},
}));
