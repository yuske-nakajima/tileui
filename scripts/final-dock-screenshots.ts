/**
 * 最終検証用スクリーンショット撮影スクリプト
 * - メインページ: PC (1280x720) + モバイル (390x844)
 * - ドックデモ: PC/モバイル × 4方向 = 8パターン
 *
 * 使い方: npx tsx scripts/final-dock-screenshots.ts
 * 前提: Vite dev server が localhost:5173 で起動済み
 */

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCK_URL = 'http://localhost:5173/dock.html';
const MAIN_URL = 'http://localhost:5173/';
const OUTPUT_DIR = path.resolve(__dirname, '../test-results/dock-screenshots');

/** 方向ボタンのテキスト */
type Direction = 'Left' | 'Right' | 'Top' | 'Bottom';

interface DockTask {
	/** 保存ファイル名（拡張子なし） */
	name: string;
	/** ビューポート幅 */
	width: number;
	/** ビューポート高さ */
	height: number;
	/** ドロワーの方向（ボタンテキスト） */
	direction: Direction;
}

interface MainTask {
	/** 保存ファイル名（拡張子なし） */
	name: string;
	/** ビューポート幅 */
	width: number;
	/** ビューポート高さ */
	height: number;
}

const dockTasks: DockTask[] = [
	// PC (1280x720)
	{ name: 'final-pc-right', width: 1280, height: 720, direction: 'Right' },
	{ name: 'final-pc-left', width: 1280, height: 720, direction: 'Left' },
	{ name: 'final-pc-top', width: 1280, height: 720, direction: 'Top' },
	{ name: 'final-pc-bottom', width: 1280, height: 720, direction: 'Bottom' },

	// スマホ (390x844)
	{ name: 'final-mobile-right', width: 390, height: 844, direction: 'Right' },
	{ name: 'final-mobile-left', width: 390, height: 844, direction: 'Left' },
	{ name: 'final-mobile-top', width: 390, height: 844, direction: 'Top' },
	{ name: 'final-mobile-bottom', width: 390, height: 844, direction: 'Bottom' },
];

const mainTasks: MainTask[] = [
	{ name: 'main-pc', width: 1280, height: 720 },
	{ name: 'main-mobile', width: 390, height: 844 },
];

async function main() {
	// 出力ディレクトリを作成
	await mkdir(OUTPUT_DIR, { recursive: true });

	const browser = await chromium.launch();

	// メインページのスクリーンショット
	for (const task of mainTasks) {
		console.log(`撮影中: ${task.name} (${task.width}x${task.height})`);

		const context = await browser.newContext({
			viewport: { width: task.width, height: task.height },
		});
		const page = await context.newPage();

		await page.goto(MAIN_URL, { waitUntil: 'networkidle' });

		// ドックセクションまでスクロール
		const dockSection = page.locator('.showcase__dock-link');
		await dockSection.scrollIntoViewIfNeeded();
		await page.waitForTimeout(300);

		const filePath = path.join(OUTPUT_DIR, `${task.name}.png`);
		await page.screenshot({ path: filePath, fullPage: false });
		console.log(`  保存: ${filePath}`);

		await context.close();
	}

	// ドックデモページのスクリーンショット
	for (const task of dockTasks) {
		console.log(`撮影中: ${task.name} (${task.width}x${task.height}, ${task.direction})`);

		const context = await browser.newContext({
			viewport: { width: task.width, height: task.height },
		});
		const page = await context.newPage();

		// ページ読み込み
		await page.goto(DOCK_URL, { waitUntil: 'networkidle' });

		// 初期状態は right で open 済み。方向を切り替える必要がある場合はボタンをクリック
		if (task.direction !== 'Right') {
			const btn = page.locator('.tileui-button', { hasText: task.direction });
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
	console.log('\n全10パターンのスクリーンショット撮影が完了しました。');
}

main().catch((err) => {
	console.error('エラー:', err);
	process.exit(1);
});
