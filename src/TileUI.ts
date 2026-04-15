import { CSS_PREFIX } from './constants';
import { BooleanController } from './controllers/BooleanController';
import { ButtonController } from './controllers/ButtonController';
import { ColorController } from './controllers/ColorController';
import type { Controller } from './controllers/Controller';
import { KnobController } from './controllers/KnobController';
import { NumberInputController } from './controllers/NumberInputController';
import { injectStyles } from './styles/inject';

/** コントローラーの共通操作（型パラメータに依存しない部分） */
interface Disposable {
	updateDisplay(): void;
	dispose(): void;
}

/** ドックの配置方向 */
export type DockPosition = 'left' | 'right' | 'top' | 'bottom';

/** TileUI コンストラクタのオプション */
export interface TileUIOptions {
	/** パネルの挿入先コンテナ（未指定なら document.body） */
	container?: HTMLElement;
	/** グリッドの列数（未指定なら auto-fill） */
	columns?: number;
	/** パネルのタイトル */
	title?: string;
	/** ドロワーとして画面端に配置する方向 */
	dock?: DockPosition;
}

/**
 * TileUI メインクラス
 * lil-gui / dat.gui / Tweakpane 風の API でタイルグリッド GUI を構築する
 */
export class TileUI {
	/** パネルのルート要素 */
	private panel: HTMLElement;

	/** 挿入先コンテナ */
	private container: HTMLElement;

	/** 管理中の全コントローラー */
	private controllers: Disposable[] = [];

	/** サブフォルダ一覧 */
	private folders: TileUI[] = [];

	/** ドロワー要素（dock 指定時のみ生成） */
	private drawer: HTMLElement | null = null;

	/** ドック方向（未指定なら null） */
	private dockPosition: DockPosition | null = null;

	/** ドロワーの開閉状態 */
	private _isOpen = false;

	constructor(options: TileUIOptions = {}) {
		// スタイルを注入
		injectStyles();

		const hasContainer = options.container !== undefined;
		this.container = options.container ?? document.body;

		// パネル要素を作成
		this.panel = document.createElement('div');
		this.panel.classList.add(`${CSS_PREFIX}-panel`);

		// columns オプション対応
		if (options.columns !== undefined) {
			const size = 'var(--tileui-tile-size)';
			this.panel.style.gridTemplateColumns = `repeat(${options.columns}, ${size})`;
		}

		// タイトル表示
		if (options.title) {
			const titleEl = document.createElement('div');
			titleEl.classList.add(`${CSS_PREFIX}-title`);
			titleEl.textContent = options.title;
			titleEl.style.gridColumn = '1 / -1';
			titleEl.style.padding = '4px 8px';
			titleEl.style.fontSize = '12px';
			titleEl.style.fontWeight = 'bold';
			this.panel.appendChild(titleEl);
		}

		// dock オプション: ドロワーラッパーを生成
		if (options.dock) {
			this.dockPosition = options.dock;
			this.drawer = document.createElement('div');
			this.drawer.classList.add(`${CSS_PREFIX}-drawer`);
			this.drawer.dataset.dock = options.dock;
			this.drawer.dataset.open = 'false';

			// container 指定の有無でポジションを切り替え
			this.drawer.style.position = hasContainer ? 'absolute' : 'fixed';

			// 初期状態ではトランジション無効（一瞬表示されるのを防ぐ）
			this.drawer.style.transition = 'none';

			// パネルをドロワー内に配置
			this.drawer.appendChild(this.panel);
			this.container.appendChild(this.drawer);

			// 次フレームでトランジションを有効化
			requestAnimationFrame(() => {
				if (this.drawer) {
					this.drawer.style.transition = '';
				}
			});
		} else {
			this.container.appendChild(this.panel);
		}
	}

	/** ドロワーの現在の開閉状態を返す（dock 未指定時は常に true） */
	get isOpen(): boolean {
		if (!this.dockPosition) {
			return true;
		}
		return this._isOpen;
	}

	/** ドロワーを開く（dock 未指定時は何もしない） */
	open(): void {
		if (!this.drawer || !this.dockPosition) {
			return;
		}
		this._isOpen = true;
		this.drawer.dataset.open = 'true';
	}

	/** ドロワーを閉じる（dock 未指定時は何もしない） */
	close(): void {
		if (!this.drawer || !this.dockPosition) {
			return;
		}
		this._isOpen = false;
		this.drawer.dataset.open = 'false';
	}

	/** ドロワーの開閉を切り替える（dock 未指定時は何もしない） */
	toggle(): void {
		if (this._isOpen) {
			this.close();
		} else {
			this.open();
		}
	}

	/**
	 * 数値コントローラーを追加する
	 * min/max が指定されていれば KnobController、なければ NumberInputController
	 */
	add(
		obj: Record<string, unknown>,
		prop: string,
		min?: number,
		max?: number,
		step?: number,
	): Controller<number> {
		const useKnob = min !== undefined && max !== undefined;

		const ctrl = useKnob
			? new KnobController(obj, prop, {
					min,
					max,
					step,
					label: prop,
				})
			: new NumberInputController(obj, prop, {
					step,
					label: prop,
				});

		const dom = ctrl.createDOM();
		this.panel.appendChild(dom);
		this.controllers.push(ctrl);
		return ctrl;
	}

	/** 真偽値コントローラーを追加する */
	addBoolean(obj: Record<string, unknown>, prop: string): Controller<boolean> {
		const ctrl = new BooleanController(obj, prop, { label: prop });
		const dom = ctrl.createDOM();
		this.panel.appendChild(dom);
		this.controllers.push(ctrl);
		return ctrl;
	}

	/** カラーコントローラーを追加する */
	addColor(obj: Record<string, unknown>, prop: string): Controller<string> {
		const ctrl = new ColorController(obj, prop, { label: prop });
		const dom = ctrl.createDOM();
		this.panel.appendChild(dom);
		this.controllers.push(ctrl);
		return ctrl;
	}

	/** ボタンを追加する */
	addButton(label: string, callback: () => void): Controller<() => void> {
		// ButtonController はオブジェクトのプロパティにバインドする設計
		// ボタン用の一時オブジェクトを生成
		const btnObj: Record<string, unknown> = { __callback: callback };
		const ctrl = new ButtonController(btnObj, '__callback', { label });
		const dom = ctrl.createDOM();
		this.panel.appendChild(dom);
		this.controllers.push(ctrl);
		return ctrl;
	}

	/** フォルダ（サブグリッド）を追加する */
	addFolder(title: string): TileUI {
		// フォルダ用のコンテナ要素を作成
		const folderWrapper = document.createElement('div');
		folderWrapper.classList.add(`${CSS_PREFIX}-folder`);
		folderWrapper.style.gridColumn = '1 / -1';

		this.panel.appendChild(folderWrapper);

		// サブ TileUI を再帰的に生成
		const folder = new TileUI({
			container: folderWrapper,
			title,
		});

		this.folders.push(folder);
		return folder;
	}

	/** 全コントローラーの表示を現在値に同期する */
	updateDisplay(): void {
		for (const ctrl of this.controllers) {
			ctrl.updateDisplay();
		}
		for (const folder of this.folders) {
			folder.updateDisplay();
		}
	}

	/** 全コントローラーとDOM要素をクリーンアップする */
	dispose(): void {
		// サブフォルダを先に dispose
		for (const folder of this.folders) {
			folder.dispose();
		}
		this.folders = [];

		// コントローラーを dispose
		for (const ctrl of this.controllers) {
			ctrl.dispose();
		}
		this.controllers = [];

		// ドロワー要素がある場合はドロワーごと除去（パネルも内包される）
		if (this.drawer) {
			if (this.drawer.parentNode) {
				this.drawer.parentNode.removeChild(this.drawer);
			}
			this.drawer = null;
		} else {
			// dock 未指定時はパネル要素を直接除去
			if (this.panel.parentNode) {
				this.panel.parentNode.removeChild(this.panel);
			}
		}
	}
}
