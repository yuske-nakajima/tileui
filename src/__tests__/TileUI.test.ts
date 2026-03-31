// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CSS_PREFIX, STYLE_ELEMENT_ID } from '../constants';
import { resetStyleInjection } from '../styles/inject';
import { TileUI } from '../TileUI';

describe('TileUI', () => {
	let container: HTMLDivElement;

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
		resetStyleInjection();
	});

	afterEach(() => {
		container.remove();
		// スタイル要素もクリーンアップ
		const style = document.getElementById(STYLE_ELEMENT_ID);
		if (style) style.remove();
		resetStyleInjection();
	});

	describe('コンストラクタ', () => {
		it('container を指定した場合そこにパネルを追加する', () => {
			const gui = new TileUI({ container });
			expect(container.querySelector(`.${CSS_PREFIX}-panel`)).not.toBeNull();
			gui.dispose();
		});

		it('container 未指定の場合 document.body に追加する', () => {
			const gui = new TileUI();
			expect(document.body.querySelector(`.${CSS_PREFIX}-panel`)).not.toBeNull();
			gui.dispose();
		});

		it('title を指定した場合タイトル要素が表示される', () => {
			const gui = new TileUI({ container, title: 'Test Panel' });
			const title = container.querySelector(`.${CSS_PREFIX}-title`);
			expect(title).not.toBeNull();
			expect(title?.textContent).toBe('Test Panel');
			gui.dispose();
		});

		it('スタイルが注入される', () => {
			const gui = new TileUI({ container });
			expect(document.getElementById(STYLE_ELEMENT_ID)).not.toBeNull();
			gui.dispose();
		});
	});

	describe('add()', () => {
		it('min/max あり → KnobController を返す', () => {
			const gui = new TileUI({ container });
			const params = { speed: 50 };
			const ctrl = gui.add(params, 'speed', 0, 100, 1);
			expect(ctrl).toBeDefined();
			expect(ctrl.value).toBe(50);
			// ノブ用タイルがあるか確認
			expect(container.querySelector(`.${CSS_PREFIX}-tile-knob`)).not.toBeNull();
			gui.dispose();
		});

		it('min/max なし → NumberInputController を返す', () => {
			const gui = new TileUI({ container });
			const params = { count: 10 };
			const ctrl = gui.add(params, 'count');
			expect(ctrl).toBeDefined();
			expect(ctrl.value).toBe(10);
			expect(container.querySelector(`.${CSS_PREFIX}-tile-number`)).not.toBeNull();
			gui.dispose();
		});

		it('onChange コールバックが動作する', () => {
			const gui = new TileUI({ container });
			const params = { speed: 50 };
			const callback = vi.fn();
			const ctrl = gui.add(params, 'speed', 0, 100);
			ctrl.onChange(callback);
			ctrl.value = 75;
			expect(callback).toHaveBeenCalledWith(75);
			gui.dispose();
		});
	});

	describe('addBoolean()', () => {
		it('BooleanController を追加する', () => {
			const gui = new TileUI({ container });
			const params = { enabled: true };
			const ctrl = gui.addBoolean(params, 'enabled');
			expect(ctrl.value).toBe(true);
			expect(container.querySelector(`.${CSS_PREFIX}-tile-boolean`)).not.toBeNull();
			gui.dispose();
		});
	});

	describe('addColor()', () => {
		it('ColorController を追加する', () => {
			const gui = new TileUI({ container });
			const params = { color: '#ff6600' };
			const ctrl = gui.addColor(params, 'color');
			expect(ctrl.value).toBe('#ff6600');
			expect(container.querySelector(`.${CSS_PREFIX}-tile-color`)).not.toBeNull();
			gui.dispose();
		});
	});

	describe('addButton()', () => {
		it('ButtonController を追加する', () => {
			const gui = new TileUI({ container });
			const callback = vi.fn();
			gui.addButton('Click Me', callback);
			expect(container.querySelector(`.${CSS_PREFIX}-tile-button`)).not.toBeNull();
			gui.dispose();
		});
	});

	describe('addFolder()', () => {
		it('サブ TileUI を返す', () => {
			const gui = new TileUI({ container });
			const folder = gui.addFolder('Advanced');
			expect(folder).toBeInstanceOf(TileUI);
			gui.dispose();
		});

		it('フォルダ内にコントローラーを追加できる', () => {
			const gui = new TileUI({ container });
			const folder = gui.addFolder('Advanced');
			const params = { x: 10 };
			folder.add(params, 'x', 0, 100);
			gui.dispose();
		});
	});

	describe('updateDisplay()', () => {
		it('全コントローラーの表示を更新する', () => {
			const gui = new TileUI({ container });
			const params = { speed: 50, enabled: true };
			gui.add(params, 'speed', 0, 100);
			gui.addBoolean(params, 'enabled');

			// 値を直接変更
			params.speed = 75;
			params.enabled = false;

			// updateDisplay で反映
			gui.updateDisplay();
			gui.dispose();
		});
	});

	describe('dispose()', () => {
		it('パネル要素が DOM から除去される', () => {
			const gui = new TileUI({ container });
			gui.dispose();
			expect(container.querySelector(`.${CSS_PREFIX}-panel`)).toBeNull();
		});

		it('全コントローラーが dispose される', () => {
			const gui = new TileUI({ container });
			const params = { speed: 50 };
			gui.add(params, 'speed', 0, 100);
			gui.dispose();
			expect(container.querySelector(`.${CSS_PREFIX}-tile-knob`)).toBeNull();
		});
	});

	describe('columns オプション', () => {
		it('columns を指定するとグリッド列数が固定される', () => {
			const gui = new TileUI({ container, columns: 3 });
			const panel = container.querySelector(`.${CSS_PREFIX}-panel`) as HTMLElement;
			expect(panel.style.gridTemplateColumns).toContain('repeat(3');
			gui.dispose();
		});
	});
});
