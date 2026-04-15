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

	describe('style()', () => {
		it('bgColor を指定するとタイルの backgroundColor が変更される', () => {
			const gui = new TileUI({ container });
			const params = { speed: 50 };
			const ctrl = gui.add(params, 'speed', 0, 100);
			ctrl.style({ bgColor: '#ff0000' });
			const tile = container.querySelector(`.${CSS_PREFIX}-tile-knob`) as HTMLElement;
			expect(tile.style.backgroundColor).toBe('rgb(255, 0, 0)');
			gui.dispose();
		});

		it('textColor を指定するとタイルの color が変更される', () => {
			const gui = new TileUI({ container });
			const params = { speed: 50 };
			const ctrl = gui.add(params, 'speed', 0, 100);
			ctrl.style({ textColor: '#ffffff' });
			const tile = container.querySelector(`.${CSS_PREFIX}-tile-knob`) as HTMLElement;
			expect(tile.style.color).toBe('rgb(255, 255, 255)');
			gui.dispose();
		});

		it('bgColor と textColor を同時に指定できる', () => {
			const gui = new TileUI({ container });
			const params = { speed: 50 };
			const ctrl = gui.add(params, 'speed', 0, 100);
			ctrl.style({ bgColor: '#ff0000', textColor: '#ffffff' });
			const tile = container.querySelector(`.${CSS_PREFIX}-tile-knob`) as HTMLElement;
			expect(tile.style.backgroundColor).toBe('rgb(255, 0, 0)');
			expect(tile.style.color).toBe('rgb(255, 255, 255)');
			gui.dispose();
		});

		it('onChange と style をチェーンで呼び出せる', () => {
			const gui = new TileUI({ container });
			const params = { speed: 50 };
			const callback = vi.fn();
			const ctrl = gui.add(params, 'speed', 0, 100);
			// onChange → style のチェーン
			const result = ctrl.onChange(callback).style({ bgColor: '#00ff00' });
			expect(result).toBe(ctrl);
			const tile = container.querySelector(`.${CSS_PREFIX}-tile-knob`) as HTMLElement;
			expect(tile.style.backgroundColor).toBe('rgb(0, 255, 0)');
			// コールバックも正常動作
			ctrl.value = 75;
			expect(callback).toHaveBeenCalledWith(75);
			gui.dispose();
		});

		it('style → onChange のチェーンも動作する', () => {
			const gui = new TileUI({ container });
			const params = { speed: 50 };
			const callback = vi.fn();
			const ctrl = gui.add(params, 'speed', 0, 100);
			const result = ctrl.style({ textColor: '#000000' }).onChange(callback);
			expect(result).toBe(ctrl);
			ctrl.value = 25;
			expect(callback).toHaveBeenCalledWith(25);
			gui.dispose();
		});

		it('borderColor を指定するとタイルの borderColor が変更される', () => {
			const gui = new TileUI({ container });
			const params = { speed: 50 };
			const ctrl = gui.add(params, 'speed', 0, 100);
			ctrl.style({ borderColor: '#ff0000' });
			const tile = container.querySelector(`.${CSS_PREFIX}-tile-knob`) as HTMLElement;
			expect(tile.style.borderColor).toBe('rgb(255, 0, 0)');
			gui.dispose();
		});

		it('accentColor を指定するとCSS変数がタイルにローカル設定される', () => {
			const gui = new TileUI({ container });
			const params = { enabled: true };
			const ctrl = gui.addBoolean(params, 'enabled');
			ctrl.style({ accentColor: '#ff6600' });
			const tile = container.querySelector(`.${CSS_PREFIX}-tile-boolean`) as HTMLElement;
			expect(tile.style.getPropertyValue('--tileui-accent')).toBe('#ff6600');
			expect(tile.style.getPropertyValue('--tileui-toggle-on')).toBe('#ff6600');
			expect(tile.style.getPropertyValue('--tileui-knob-value')).toBe('#ff6600');
			gui.dispose();
		});
	});

	describe('columns オプション', () => {
		it('columns: number を指定するとグリッド列数が固定される', () => {
			const gui = new TileUI({ container, columns: 3 });
			const panel = container.querySelector(`.${CSS_PREFIX}-panel`) as HTMLElement;
			expect(panel.style.gridTemplateColumns).toContain('repeat(3');
			gui.dispose();
		});

		it('columns 未指定時は auto-fill が維持される', () => {
			const gui = new TileUI({ container });
			const panel = container.querySelector(`.${CSS_PREFIX}-panel`) as HTMLElement;
			// gridTemplateColumns をインラインで設定しないので空文字
			expect(panel.style.gridTemplateColumns).toBe('');
			gui.dispose();
		});

		it('columns: { min, max } でインスタンスを生成できる', () => {
			vi.stubGlobal(
				'ResizeObserver',
				class {
					observe = vi.fn();
					unobserve = vi.fn();
					disconnect = vi.fn();
					constructor(public cb: ResizeObserverCallback) {}
				},
			);
			const gui = new TileUI({ container, columns: { min: 2, max: 4 } });
			const panel = container.querySelector(`.${CSS_PREFIX}-panel`) as HTMLElement;
			expect(panel).not.toBeNull();
			// レスポンシブモードでは gridTemplateColumns が設定される（初期値は min）
			expect(panel.style.gridTemplateColumns).toContain('repeat(2');
			gui.dispose();
			vi.unstubAllGlobals();
		});

		it('columns: { min, max } で min > max の場合は min が max にクランプされる', () => {
			vi.stubGlobal(
				'ResizeObserver',
				class {
					observe = vi.fn();
					unobserve = vi.fn();
					disconnect = vi.fn();
					constructor(public cb: ResizeObserverCallback) {}
				},
			);
			const gui = new TileUI({ container, columns: { min: 5, max: 2 } });
			const panel = container.querySelector(`.${CSS_PREFIX}-panel`) as HTMLElement;
			// min > max でもエラーにならず、min が max の値にクランプされる
			expect(panel.style.gridTemplateColumns).toContain('repeat(2');
			gui.dispose();
			vi.unstubAllGlobals();
		});
	});

	describe('レスポンシブ列数（ResizeObserver）', () => {
		it('columns: { min, max } で ResizeObserver が設定される', () => {
			const observeSpy = vi.fn();
			const disconnectSpy = vi.fn();
			vi.stubGlobal(
				'ResizeObserver',
				class {
					observe = observeSpy;
					unobserve = vi.fn();
					disconnect = disconnectSpy;
					constructor(public cb: ResizeObserverCallback) {}
				},
			);
			const gui = new TileUI({ container, columns: { min: 2, max: 4 } });
			expect(observeSpy).toHaveBeenCalledTimes(1);
			gui.dispose();
			vi.unstubAllGlobals();
		});

		it('columns: number では ResizeObserver が設定されない', () => {
			const observeSpy = vi.fn();
			vi.stubGlobal(
				'ResizeObserver',
				class {
					observe = observeSpy;
					unobserve = vi.fn();
					disconnect = vi.fn();
					constructor(public cb: ResizeObserverCallback) {}
				},
			);
			const gui = new TileUI({ container, columns: 3 });
			expect(observeSpy).not.toHaveBeenCalled();
			gui.dispose();
			vi.unstubAllGlobals();
		});

		it('dispose() で ResizeObserver が disconnect される', () => {
			const disconnectSpy = vi.fn();
			vi.stubGlobal(
				'ResizeObserver',
				class {
					observe = vi.fn();
					unobserve = vi.fn();
					disconnect = disconnectSpy;
					constructor(public cb: ResizeObserverCallback) {}
				},
			);
			const gui = new TileUI({ container, columns: { min: 2, max: 4 } });
			gui.dispose();
			expect(disconnectSpy).toHaveBeenCalledTimes(1);
			vi.unstubAllGlobals();
		});

		it('パネル幅に応じて列数が動的に計算される', () => {
			let resizeCallback: ResizeObserverCallback | null = null;
			vi.stubGlobal(
				'ResizeObserver',
				class {
					observe = vi.fn();
					unobserve = vi.fn();
					disconnect = vi.fn();
					constructor(cb: ResizeObserverCallback) {
						resizeCallback = cb;
					}
				},
			);
			const gui = new TileUI({ container, columns: { min: 2, max: 6 } });
			const panel = container.querySelector(`.${CSS_PREFIX}-panel`) as HTMLElement;

			// パネル幅 350px / タイルサイズ 100px = 3.5 → floor で 3列
			resizeCallback?.(
				[{ contentRect: { width: 350 } } as unknown as ResizeObserverEntry],
				{} as ResizeObserver,
			);
			expect(panel.style.gridTemplateColumns).toContain('repeat(3');

			// パネル幅 600px / タイルサイズ 100px = 6 → max にクランプして 6列
			resizeCallback?.(
				[{ contentRect: { width: 600 } } as unknown as ResizeObserverEntry],
				{} as ResizeObserver,
			);
			expect(panel.style.gridTemplateColumns).toContain('repeat(6');

			// パネル幅 100px / タイルサイズ 100px = 1 → min にクランプして 2列
			resizeCallback?.(
				[{ contentRect: { width: 100 } } as unknown as ResizeObserverEntry],
				{} as ResizeObserver,
			);
			expect(panel.style.gridTemplateColumns).toContain('repeat(2');

			gui.dispose();
			vi.unstubAllGlobals();
		});
	});

	describe('dock オプション', () => {
		it('dock 未指定時は .tileui-drawer が生成されない', () => {
			const gui = new TileUI({ container });
			expect(container.querySelector(`.${CSS_PREFIX}-drawer`)).toBeNull();
			gui.dispose();
		});

		it('dock: "right" 指定時に .tileui-drawer が生成される', () => {
			const gui = new TileUI({ container, dock: 'right' });
			const drawer = container.querySelector(`.${CSS_PREFIX}-drawer`);
			expect(drawer).not.toBeNull();
			gui.dispose();
		});

		it('dock: "left" 指定時に .tileui-drawer が生成される', () => {
			const gui = new TileUI({ container, dock: 'left' });
			const drawer = container.querySelector(`.${CSS_PREFIX}-drawer`);
			expect(drawer).not.toBeNull();
			gui.dispose();
		});

		it('dock: "top" 指定時に .tileui-drawer が生成される', () => {
			const gui = new TileUI({ container, dock: 'top' });
			const drawer = container.querySelector(`.${CSS_PREFIX}-drawer`);
			expect(drawer).not.toBeNull();
			gui.dispose();
		});

		it('dock: "bottom" 指定時に .tileui-drawer が生成される', () => {
			const gui = new TileUI({ container, dock: 'bottom' });
			const drawer = container.querySelector(`.${CSS_PREFIX}-drawer`);
			expect(drawer).not.toBeNull();
			gui.dispose();
		});

		it('dock 指定時にパネルがドロワー内に配置される', () => {
			const gui = new TileUI({ container, dock: 'right' });
			const drawer = container.querySelector(`.${CSS_PREFIX}-drawer`);
			const panel = drawer?.querySelector(`.${CSS_PREFIX}-panel`);
			expect(panel).not.toBeNull();
			gui.dispose();
		});

		it('dock 指定 + container 指定時は position: absolute になる', () => {
			const gui = new TileUI({ container, dock: 'right' });
			const drawer = container.querySelector(`.${CSS_PREFIX}-drawer`) as HTMLElement;
			expect(drawer.style.position).toBe('absolute');
			gui.dispose();
		});

		it('dock 指定 + container 未指定時は position: fixed になる', () => {
			const gui = new TileUI({ dock: 'right' });
			const drawer = document.body.querySelector(`.${CSS_PREFIX}-drawer`) as HTMLElement;
			expect(drawer.style.position).toBe('fixed');
			gui.dispose();
		});

		it('dock 方向に応じた data-dock 属性が設定される', () => {
			const gui = new TileUI({ container, dock: 'left' });
			const drawer = container.querySelector(`.${CSS_PREFIX}-drawer`) as HTMLElement;
			expect(drawer.dataset.dock).toBe('left');
			gui.dispose();
		});
	});

	describe('open() / close() / toggle() / isOpen', () => {
		it('初期状態では閉じている', () => {
			const gui = new TileUI({ container, dock: 'right' });
			expect(gui.isOpen).toBe(false);
			gui.dispose();
		});

		it('open() でドロワーが開く', () => {
			const gui = new TileUI({ container, dock: 'right' });
			gui.open();
			expect(gui.isOpen).toBe(true);
			const drawer = container.querySelector(`.${CSS_PREFIX}-drawer`) as HTMLElement;
			expect(drawer.dataset.open).toBe('true');
			gui.dispose();
		});

		it('close() でドロワーが閉じる', () => {
			const gui = new TileUI({ container, dock: 'right' });
			gui.open();
			gui.close();
			expect(gui.isOpen).toBe(false);
			const drawer = container.querySelector(`.${CSS_PREFIX}-drawer`) as HTMLElement;
			expect(drawer.dataset.open).toBe('false');
			gui.dispose();
		});

		it('toggle() で開閉が切り替わる', () => {
			const gui = new TileUI({ container, dock: 'right' });
			gui.toggle();
			expect(gui.isOpen).toBe(true);
			gui.toggle();
			expect(gui.isOpen).toBe(false);
			gui.dispose();
		});

		it('dock 未指定時に open() を呼んでもエラーにならない', () => {
			const gui = new TileUI({ container });
			expect(() => gui.open()).not.toThrow();
			gui.dispose();
		});

		it('dock 未指定時に close() を呼んでもエラーにならない', () => {
			const gui = new TileUI({ container });
			expect(() => gui.close()).not.toThrow();
			gui.dispose();
		});

		it('dock 未指定時に toggle() を呼んでもエラーにならない', () => {
			const gui = new TileUI({ container });
			expect(() => gui.toggle()).not.toThrow();
			gui.dispose();
		});

		it('dock 未指定時の isOpen は常に true', () => {
			const gui = new TileUI({ container });
			expect(gui.isOpen).toBe(true);
			gui.dispose();
		});
	});

	describe('dock + dispose()', () => {
		it('dispose() でドロワー要素が DOM から除去される', () => {
			const gui = new TileUI({ container, dock: 'right' });
			gui.dispose();
			expect(container.querySelector(`.${CSS_PREFIX}-drawer`)).toBeNull();
		});

		it('dispose() 後にパネルも除去される', () => {
			const gui = new TileUI({ container, dock: 'right' });
			gui.dispose();
			expect(container.querySelector(`.${CSS_PREFIX}-panel`)).toBeNull();
		});
	});
});
