/**
 * dock デモページのスクリーンショット撮影スクリプト
 * 各ウィンドウサイズ・各方向でドロワーを開いた状態を撮影する
 *
 * 使い方: npx tsx scripts/dock-screenshots.ts
 * 前提: Vite dev server が localhost:5173 で起動済み
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5173/dock.html';
const OUTPUT_DIR = path.resolve(__dirname, '../test-results/dock-screenshots');

/** 方向ボタンのテキストとドック方向の対応 */
type Direction = 'Left' | 'Right' | 'Top' | 'Bottom';

interface ScreenshotTask {
	name: string;
	width: number;
	height: number;
	direction: Direction;
}

const tasks: ScreenshotTask[] = [
	// デスクトップ (1280x720)
	{ name: 'desktop-right', width: 1280, height: 720, direction: 'Right' },
	{ name: 'desktop-left', width: 1280, height: 720, direction: 'Left' },
	{ name: 'desktop-top', width: 1280, height: 720, direction: 'Top' },
	{ name: 'desktop-bottom', width: 1280, height: 720, direction: 'Bottom' },

	// 小さいウィンドウ (800x500)
	{ name: 'small-right', width: 800, height: 500, direction: 'Right' },
	{ name: 'small-left', width: 800, height: 500, direction: 'Left' },

	// モバイル (390x844, Pixel 7 相当)
	{ name: 'mobile-right', width: 390, height: 844, direction: 'Right' },
	{ name: 'mobile-bottom', width: 390, height: 844, direction: 'Bottom' },
];

async function main() {
	const browser = await chromium.launch();

	for (const task of tasks) {
		console.log(`撮影中: ${task.name} (${task.width}x${task.height}, ${task.direction})`);

		const context = await browser.newContext({
			viewport: { width: task.width, height: task.height },
		});
		const page = await context.newPage();

		// ページ読み込み
		await page.goto(BASE_URL, { waitUntil: 'networkidle' });

		// 初期状態は right で open 済み。方向を切り替える必要がある場合はボタンをクリック
		if (task.direction !== 'Right') {
			// 現在のドロワーが開いている状態で方向ボタンをクリック
			// ボタンは tileui-button クラスで、テキストで特定する
			const btn = page.locator(`.tileui-button`, { hasText: task.direction });
			await btn.click();
			// 方向切替後のアニメーションを待つ
			await page.waitForTimeout(500);
		}

		// ドロワーが開いていることを確認
		const drawer = page.locator('.tileui-drawer[data-open="true"]');
		await drawer.waitFor({ state: 'visible', timeout: 3000 });

		// スクリーンショット撮影
		const filePath = path.join(OUTPUT_DIR, `${task.name}.png`);
		await page.screenshot({ path: filePath, fullPage: false });
		console.log(`  保存: ${filePath}`);

		await context.close();
	}

	await browser.close();
	console.log('\n全スクリーンショットの撮影が完了しました。');
}

main().catch((err) => {
	console.error('エラー:', err);
	process.exit(1);
});
