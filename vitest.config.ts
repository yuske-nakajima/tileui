import { defineConfig } from 'vitest/config';

// vitest 専用設定（vite.config.ts の root 設定と競合しないように分離）
export default defineConfig({
	test: {
		include: ['src/**/*.{test,spec}.ts'],
	},
});
