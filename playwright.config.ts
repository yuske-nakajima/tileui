import { defineConfig, devices } from '@playwright/test';

// E2E 専用ポート。開発用 5173 と分離し、別の vite プロセスとの衝突を避ける
const E2E_PORT = 5174;
const E2E_BASE_URL = `http://localhost:${E2E_PORT}`;

export default defineConfig({
	testDir: './e2e',
	timeout: 30_000,
	retries: 0,
	use: {
		baseURL: E2E_BASE_URL,
		screenshot: 'only-on-failure',
	},
	// demo ページの Vite dev server を自動起動
	// --strictPort で別ポートへのフォールバックを禁止し、baseURL とのズレを早期に検出する
	webServer: {
		command: `pnpm exec vite --strictPort --port=${E2E_PORT}`,
		url: E2E_BASE_URL,
		reuseExistingServer: !process.env.CI,
	},
	projects: [
		{
			name: 'desktop-chrome',
			use: { ...devices['Desktop Chrome'] },
		},
		{
			name: 'mobile-chrome',
			use: { ...devices['Pixel 7'] },
		},
	],
});
