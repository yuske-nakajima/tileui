/**
 * メインデモページのアニメーション GIF 録画スクリプト
 * Playwright でフレームを撮影し、ffmpeg で GIF に変換する
 *
 * 使い方: npx tsx scripts/record-demo-gif.ts
 * 前提: Vite dev server が localhost:5173 で起動済み
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5173';
const FRAMES_DIR = path.resolve(__dirname, '../test-results/gif-frames');
const OUTPUT_GIF = path.resolve(__dirname, '../screenshots/demo.gif');

/** フレーム間隔（ミリ秒） */
const FRAME_INTERVAL = 100;

/** フレーム数の設定 */
const ANIMATION_FRAMES = 20;
const DRAG_FRAMES = 20;
const RESULT_FRAMES = 10;

async function main() {
	// フレーム出力ディレクトリを初期化
	if (fs.existsSync(FRAMES_DIR)) {
		fs.rmSync(FRAMES_DIR, { recursive: true });
	}
	fs.mkdirSync(FRAMES_DIR, { recursive: true });

	const browser = await chromium.launch();
	const context = await browser.newContext({
		viewport: { width: 1280, height: 720 },
	});
	const page = await context.newPage();

	// ページ読み込み・p5.js アニメーション安定待ち
	await page.goto(BASE_URL, { waitUntil: 'networkidle' });
	await page.waitForTimeout(2000);

	let frameIndex = 1;

	// フレーム撮影のヘルパー
	async function captureFrame() {
		const filename = `frame-${String(frameIndex).padStart(3, '0')}.png`;
		await page.screenshot({ path: path.join(FRAMES_DIR, filename) });
		frameIndex++;
	}

	// フェーズ 1: アニメーションをそのまま撮影
	console.log(`フェーズ 1: アニメーション撮影 (${ANIMATION_FRAMES} フレーム)`);
	for (let i = 0; i < ANIMATION_FRAMES; i++) {
		await captureFrame();
		await page.waitForTimeout(FRAME_INTERVAL);
	}

	// フェーズ 2: ノブをドラッグして値を変更
	console.log(`フェーズ 2: ノブ操作撮影 (${DRAG_FRAMES} フレーム)`);

	// 最初のノブ（gridSize）を見つけてドラッグ
	const knob = page.locator('.tileui-knob-thumb').first();
	const knobBox = await knob.boundingBox();

	if (knobBox) {
		const cx = knobBox.x + knobBox.width / 2;
		const cy = knobBox.y + knobBox.height / 2;

		// マウスダウンでドラッグ開始
		await page.mouse.move(cx, cy);
		await page.mouse.down();

		for (let i = 0; i < DRAG_FRAMES; i++) {
			// 上方向にゆっくりドラッグ（値を増やす）
			const dy = -2;
			await page.mouse.move(cx, cy + dy * (i + 1));
			await captureFrame();
			await page.waitForTimeout(FRAME_INTERVAL);
		}

		await page.mouse.up();
	} else {
		// ノブが見つからない場合はそのまま撮影
		console.log('  ノブが見つからないためスキップ');
		for (let i = 0; i < DRAG_FRAMES; i++) {
			await captureFrame();
			await page.waitForTimeout(FRAME_INTERVAL);
		}
	}

	// フェーズ 3: 結果の表示
	console.log(`フェーズ 3: 結果表示 (${RESULT_FRAMES} フレーム)`);
	for (let i = 0; i < RESULT_FRAMES; i++) {
		await captureFrame();
		await page.waitForTimeout(FRAME_INTERVAL);
	}

	await context.close();
	await browser.close();

	const totalFrames = frameIndex - 1;
	console.log(`\n合計 ${totalFrames} フレームを撮影しました。`);

	// ffmpeg で GIF に変換
	try {
		execSync('which ffmpeg', { stdio: 'ignore' });
	} catch {
		console.error('ffmpeg が見つかりません。GIF 変換をスキップします。');
		process.exit(1);
	}

	// 出力ディレクトリ確認
	const gifDir = path.dirname(OUTPUT_GIF);
	if (!fs.existsSync(gifDir)) {
		fs.mkdirSync(gifDir, { recursive: true });
	}

	const cmd = [
		'ffmpeg',
		'-framerate 10',
		`-i ${FRAMES_DIR}/frame-%03d.png`,
		'-vf "scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse"',
		`${OUTPUT_GIF}`,
		'-y',
	].join(' ');

	console.log(`GIF 変換中: ${cmd}`);
	execSync(cmd, { stdio: 'inherit' });
	console.log(`GIF 保存: ${OUTPUT_GIF}`);
}

main().catch((err) => {
	console.error('エラー:', err);
	process.exit(1);
});
