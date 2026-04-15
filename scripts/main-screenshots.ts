/**
 * メインデモページのスクリーンショット撮影スクリプト
 * PC（上部・下部・カラー変更前後）とモバイル（上部・下部）を撮影
 *
 * 使い方: npx tsx scripts/main-screenshots.ts
 * 前提: Vite dev server が localhost:5173 で起動済み
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.resolve(__dirname, '../test-results/dock-screenshots');

async function main() {
	// 出力ディレクトリを準備
	if (!fs.existsSync(OUTPUT_DIR)) {
		fs.mkdirSync(OUTPUT_DIR, { recursive: true });
	}

	const browser = await chromium.launch();

	// === PC スクリーンショット ===
	console.log('PC スクリーンショット撮影中...');
	const pcContext = await browser.newContext({
		viewport: { width: 1280, height: 720 },
	});
	const pcPage = await pcContext.newPage();
	await pcPage.goto(BASE_URL, { waitUntil: 'networkidle' });
	await pcPage.waitForTimeout(2000);

	// 1. ページ上部
	await pcPage.screenshot({
		path: path.join(OUTPUT_DIR, 'main-pc-top.png'),
	});
	console.log('  main-pc-top.png');

	// 2. ページ下部にスクロール
	await pcPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
	await pcPage.waitForTimeout(500);
	await pcPage.screenshot({
		path: path.join(OUTPUT_DIR, 'main-pc-bottom.png'),
	});
	console.log('  main-pc-bottom.png');

	// 3. オレンジ適用状態（デフォルト）— 上部に戻る
	await pcPage.evaluate(() => window.scrollTo(0, 0));
	await pcPage.waitForTimeout(300);
	await pcPage.screenshot({
		path: path.join(OUTPUT_DIR, 'main-pc-color-before.png'),
	});
	console.log('  main-pc-color-before.png');

	// 4. カラーを緑に変更
	// ドロワーを開く（G キー）
	await pcPage.keyboard.press('g');
	await pcPage.waitForTimeout(500);

	// カラー入力を見つけて値を変更
	const colorInput = pcPage.locator('.tileui-drawer input[type="color"]');
	if ((await colorInput.count()) > 0) {
		await colorInput.evaluate((el: HTMLInputElement) => {
			const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
				window.HTMLInputElement.prototype,
				'value',
			)?.set;
			nativeInputValueSetter?.call(el, '#00cc66');
			el.dispatchEvent(new Event('input', { bubbles: true }));
			el.dispatchEvent(new Event('change', { bubbles: true }));
		});
		await pcPage.waitForTimeout(500);
	}

	// ドロワーを閉じる
	await pcPage.keyboard.press('g');
	await pcPage.waitForTimeout(500);

	await pcPage.screenshot({
		path: path.join(OUTPUT_DIR, 'main-pc-color-after.png'),
	});
	console.log('  main-pc-color-after.png');

	await pcContext.close();

	// === モバイルスクリーンショット ===
	console.log('モバイルスクリーンショット撮影中...');
	const mobileContext = await browser.newContext({
		viewport: { width: 390, height: 844 },
	});
	const mobilePage = await mobileContext.newPage();
	await mobilePage.goto(BASE_URL, { waitUntil: 'networkidle' });
	await mobilePage.waitForTimeout(2000);

	// 5. モバイル上部
	await mobilePage.screenshot({
		path: path.join(OUTPUT_DIR, 'main-mobile-top.png'),
	});
	console.log('  main-mobile-top.png');

	// 6. モバイル下部
	await mobilePage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
	await mobilePage.waitForTimeout(500);
	await mobilePage.screenshot({
		path: path.join(OUTPUT_DIR, 'main-mobile-bottom.png'),
	});
	console.log('  main-mobile-bottom.png');

	await mobileContext.close();
	await browser.close();
	console.log('\n全スクリーンショットの撮影が完了しました。');
}

main().catch((err) => {
	console.error('エラー:', err);
	process.exit(1);
});
