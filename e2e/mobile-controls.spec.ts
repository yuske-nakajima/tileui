import { expect, test } from '@playwright/test';

test.describe('モバイルでのコントロール操作', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		// パネルが描画されるまで待機
		await page.waitForSelector('.tileui-panel');
	});

	test('ノブをタッチドラッグで操作できる', async ({ page }) => {
		// 最初のノブを含むタイルを特定
		const tile = page.locator('.tileui-tile:has(.tileui-knob)').first();
		const knob = tile.locator('.tileui-knob');
		await expect(knob).toBeVisible();

		const valueBefore = await tile.locator('.tileui-value').textContent();

		// 上方向にドラッグ（値が増加する）
		const box = await knob.boundingBox();
		if (!box) throw new Error('ノブが見つかりません');
		const cx = box.x + box.width / 2;
		const cy = box.y + box.height / 2;

		await page.mouse.move(cx, cy);
		await page.mouse.down();
		// 50px 上方向にドラッグ
		for (let i = 0; i < 10; i++) {
			await page.mouse.move(cx, cy - (i + 1) * 5);
		}
		await page.mouse.up();

		const valueAfter = await tile.locator('.tileui-value').textContent();
		expect(valueBefore).not.toEqual(valueAfter);
	});

	test('トグルをタップで切り替えられる', async ({ page }) => {
		const toggle = page.locator('.tileui-toggle').first();
		await expect(toggle).toBeVisible();

		const before = await toggle.getAttribute('data-active');
		await toggle.click();
		const after = await toggle.getAttribute('data-active');

		expect(before).not.toEqual(after);
	});

	test('カラー入力のタップ領域が十分な大きさ', async ({ page }) => {
		const wrapper = page.locator('.tileui-color-wrapper').first();
		await expect(wrapper).toBeVisible();

		// タップ領域が十分な大きさか確認（44px）
		const box = await wrapper.boundingBox();
		expect(box).toBeTruthy();
		expect(box?.width).toBeGreaterThanOrEqual(44);
		expect(box?.height).toBeGreaterThanOrEqual(44);

		// プレビュー丸が表示されている
		const preview = wrapper.locator('.tileui-color-preview');
		await expect(preview).toBeVisible();
	});

	test('トグルのタップ領域が十分な大きさ', async ({ page }) => {
		const toggle = page.locator('.tileui-toggle').first();
		const box = await toggle.boundingBox();
		expect(box).toBeTruthy();
		// モバイル推奨最小タップ領域 44px
		expect(box?.width).toBeGreaterThanOrEqual(44);
		expect(box?.height).toBeGreaterThanOrEqual(24);
	});

	test('ノブに touch-action: none が設定されている', async ({ page }) => {
		const knob = page.locator('.tileui-knob').first();
		const touchAction = await knob.evaluate((el) => getComputedStyle(el).touchAction);
		expect(touchAction).toBe('none');
	});

	test('タイルに touch-action: manipulation が設定されている', async ({ page }) => {
		const tile = page.locator('.tileui-tile').first();
		const touchAction = await tile.evaluate((el) => getComputedStyle(el).touchAction);
		expect(touchAction).toBe('manipulation');
	});
});

test.describe('デモページの表示', () => {
	test('全セクションが表示される', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('.tileui-panel').first()).toBeVisible();

		// ショーケースセクション
		await expect(page.locator('#showcase-2col .tileui-panel')).toBeVisible();
		await expect(page.locator('#showcase-3col .tileui-panel')).toBeVisible();
		await expect(page.locator('#showcase-4col .tileui-panel')).toBeVisible();
		await expect(page.locator('#showcase-styled .tileui-panel')).toBeVisible();
	});

	test('モバイルで4列パネルが横スクロール可能', async ({ page }, testInfo) => {
		// mobile-chrome プロジェクトのみ実行
		if (testInfo.project.name !== 'mobile-chrome') {
			test.skip();
			return;
		}

		await page.goto('/');
		await page.waitForSelector('#showcase-4col .tileui-panel');

		const viewportWidth = page.viewportSize()?.width ?? 0;

		// 4列パネルの grid が 4 * 100px = 400px を要求していることを確認
		const panelScrollWidth = await page
			.locator('#showcase-4col .tileui-panel')
			.evaluate((el) => el.scrollWidth);
		expect(panelScrollWidth).toBeGreaterThanOrEqual(400);

		// ラッパー（.showcase__item > div = #showcase-4col）が overflow-x: auto であることを確認
		const wrapper = page.locator('#showcase-4col');
		const overflowX = await wrapper.evaluate((el) => getComputedStyle(el).overflowX);
		expect(overflowX).toBe('auto');

		// ラッパーの幅がビューポート幅以下であることを確認（はみ出していない）
		const wrapperBox = await wrapper.boundingBox();
		expect(wrapperBox).toBeTruthy();
		expect(wrapperBox?.width).toBeLessThanOrEqual(viewportWidth);
	});
});
