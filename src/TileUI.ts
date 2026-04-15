import { CSS_PREFIX, TILE_SIZE } from './constants';
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

/** レスポンシブ列数のオプション（min〜max の範囲で自動調整） */
export interface ColumnOption {
	/** 最小列数 */
	min: number;
	/** 最大列数 */
	max: number;
}

/** columns オプションがオブジェクト形式かどうかを判定する型ガード */
function isColumnOption(columns: number | ColumnOption): columns is ColumnOption {
	return typeof columns === 'object' && 'min' in columns && 'max' in columns;
}

/** TileUI コンストラクタのオプション */
export interface TileUIOptions {
	/** パネルの挿入先コンテナ（未指定なら document.body） */
	container?: HTMLElement;
	/** グリッドの列数（数値で固定、{ min, max } でレスポンシブ、未指定で auto-fill） */
	columns?: number | ColumnOption;
	/** パネルのタイトル */
	title?: string;
	/** ドロワーとして画面端に配置する方向 */
	dock?: DockPosition;
	/** true でドロワーにトグルボタンを表示（dock 指定時のみ有効） */
	collapsible?: boolean;
	/** ドロワー開閉に使用するキーボードショートカット（KeyboardEvent.key の値） */
	toggleKey?: string;
	/** true でドロワー展開時に背景オーバーレイを表示（dock 指定時のみ有効） */
	overlay?: boolean;
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

	/** レスポンシブ列数監視用の ResizeObserver（columns がオブジェクト型の場合のみ） */
	private resizeObserver: ResizeObserver | null = null;

	/** トグルボタン要素（collapsible + dock 指定時のみ生成） */
	private toggleBtn: HTMLElement | null = null;

	/** オーバーレイ要素（overlay + dock 指定時のみ生成） */
	private overlayEl: HTMLElement | null = null;

	/** overlay オプションが有効かどうか */
	private useOverlay = false;

	/** toggleKey オプションの値 */
	private _toggleKey: string | null = null;

	/** キーボードイベントハンドラの参照（dispose 時に解除用） */
	private keydownHandler: ((e: KeyboardEvent) => void) | null = null;

	/** window resize ハンドラの参照（dispose 用） */
	private _resizeHandler: (() => void) | null = null;

	/** left/right ドロワーの列数再計算コールバック（open 時に呼び出す） */
	private _recalcVertical: (() => void) | null = null;

	constructor(options: TileUIOptions = {}) {
		// スタイルを注入
		injectStyles();

		const hasContainer = options.container !== undefined;
		this.container = options.container ?? document.body;

		// パネル要素を作成
		this.panel = document.createElement('div');
		this.panel.classList.add(`${CSS_PREFIX}-panel`);

		// columns オプション対応
		this.setupColumns(options.columns, options.dock);

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

			// アクセシビリティ属性を設定
			this.drawer.setAttribute('role', 'region');
			this.drawer.setAttribute('aria-label', options.title ?? 'TileUI panel');

			// container 指定の有無でポジションを切り替え
			this.drawer.style.position = hasContainer ? 'absolute' : 'fixed';

			// 初期状態ではトランジション無効（一瞬表示されるのを防ぐ）
			this.drawer.style.transition = 'none';

			// パネルをドロワー内に配置
			this.drawer.appendChild(this.panel);
			this.container.appendChild(this.drawer);

			// collapsible オプション: トグルボタンを生成
			if (options.collapsible) {
				this.setupToggleButton(options.dock);
			}

			// overlay オプション: オーバーレイ要素を生成
			if (options.overlay) {
				this.useOverlay = true;
				this.setupOverlay(hasContainer);
			}

			// キーボードショートカットを設定
			this._toggleKey = options.toggleKey ?? null;
			this.setupKeyboardShortcuts();

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
		this.updateToggleButtonState();
		this.updateOverlayVisibility();

		// left/right ドロワーの列数を再計算（コンテンツ量と高さに基づく）
		if (this._recalcVertical) {
			this._recalcVertical();
		}
	}

	/** ドロワーを閉じる（dock 未指定時は何もしない） */
	close(): void {
		if (!this.drawer || !this.dockPosition) {
			return;
		}
		this._isOpen = false;
		this.drawer.dataset.open = 'false';
		this.updateToggleButtonState();
		this.updateOverlayVisibility();
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
		// ResizeObserver を停止
		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
			this.resizeObserver = null;
		}

		// window resize リスナーを解除
		if (this._resizeHandler) {
			window.removeEventListener('resize', this._resizeHandler);
			this._resizeHandler = null;
		}

		// 列数再計算コールバックをクリア
		this._recalcVertical = null;

		// キーボードイベントリスナーを解除
		if (this.keydownHandler) {
			document.removeEventListener('keydown', this.keydownHandler);
			this.keydownHandler = null;
		}

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

		// オーバーレイ要素を除去
		if (this.overlayEl) {
			if (this.overlayEl.parentNode) {
				this.overlayEl.parentNode.removeChild(this.overlayEl);
			}
			this.overlayEl = null;
		}

		// トグルボタン要素を除去
		if (this.toggleBtn) {
			this.toggleBtn = null;
		}

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

	/**
	 * columns オプションに応じてグリッド列数を設定する
	 * - left/right ドロワーはドロワーの高さに基づいて列数を動的計算
	 * - number: 固定列数
	 * - ColumnOption: ResizeObserver でパネル幅に応じて動的計算
	 * - undefined: CSS の auto-fill に任せる（何もしない）
	 */
	private setupColumns(columns: number | ColumnOption | undefined, dock?: DockPosition): void {
		if (columns === undefined) {
			return;
		}

		const size = 'var(--tileui-tile-size)';

		if (!isColumnOption(columns)) {
			// 固定列数（left/right ドロワーでも固定指定は尊重）
			this.panel.style.gridTemplateColumns = `repeat(${columns}, ${size})`;
			return;
		}

		// レスポンシブ列数: min/max を正規化（min > max の場合は max にクランプ）
		const minCols = Math.min(columns.min, columns.max);
		const maxCols = Math.max(columns.min, columns.max);

		// 初期値として min を設定
		this.panel.style.gridTemplateColumns = `repeat(${minCols}, ${size})`;

		if (dock === 'left' || dock === 'right') {
			// left/right ドロワー: ビューポートの高さに収まる列数を計算する
			const recalcVertical = () => {
				const h = window.innerHeight;
				if (h === 0) return;
				// タイトル要素は全幅で別行を取るためタイル数から除外し、高さから差し引く
				const titleEl = this.panel.querySelector(`.${CSS_PREFIX}-title`);
				const titleHeight = titleEl ? TILE_SIZE : 0;
				const tileItems = this.panel.querySelectorAll(`:scope > :not(.${CSS_PREFIX}-title)`).length;
				if (tileItems === 0) return;
				const availableHeight = h - titleHeight;
				const maxRows = Math.max(1, Math.floor(availableHeight / TILE_SIZE));
				const neededCols = Math.ceil(tileItems / maxRows);
				const clamped = Math.max(minCols, Math.min(neededCols, maxCols));
				this.panel.style.gridTemplateColumns = `repeat(${clamped}, ${size})`;
			};

			this._resizeHandler = () => recalcVertical();
			window.addEventListener('resize', this._resizeHandler);
			this._recalcVertical = recalcVertical;
		} else if (dock === 'top' || dock === 'bottom') {
			// top/bottom ドロワー: ビューポートの幅に収まる列数を計算する
			// left/right と同じアプローチ: 利用可能な幅から最大列数を求め、
			// 行数を最小化しつつ均等に配置する
			const recalcHorizontal = () => {
				const w = window.innerWidth;
				if (w === 0) return;
				// タイトル要素は grid-column: 1/-1 で全幅を取るためタイル数から除外
				const tileItems = this.panel.querySelectorAll(`:scope > :not(.${CSS_PREFIX}-title)`).length;
				if (tileItems === 0) return;
				// 画面幅に収まる最大列数
				const maxColsByWidth = Math.max(1, Math.floor(w / TILE_SIZE));
				// 最大列数で配置した場合の行数
				const rows = Math.ceil(tileItems / maxColsByWidth);
				// その行数で均等に配置する列数（各行のアイテム数を揃える）
				const neededCols = Math.ceil(tileItems / rows);
				const clamped = Math.max(minCols, Math.min(neededCols, maxCols));
				this.panel.style.gridTemplateColumns = `repeat(${clamped}, ${size})`;
			};

			this._resizeHandler = () => recalcHorizontal();
			window.addEventListener('resize', this._resizeHandler);
			this._recalcVertical = recalcHorizontal;
		} else {
			// 通常パネル: 幅ベースで列数を動的計算
			this.resizeObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					const panelWidth = entry.contentRect.width;
					const idealCols = Math.floor(panelWidth / TILE_SIZE);
					const clampedCols = Math.max(minCols, Math.min(idealCols, maxCols));
					this.panel.style.gridTemplateColumns = `repeat(${clampedCols}, ${size})`;
				}
			});
			this.resizeObserver.observe(this.panel);
		}
	}

	/** トグルボタンを生成してドロワーに配置する */
	private setupToggleButton(dock: DockPosition): void {
		if (!this.drawer) {
			return;
		}

		const btn = document.createElement('button');
		btn.classList.add(`${CSS_PREFIX}-toggle-btn`);
		btn.setAttribute('aria-label', 'Toggle panel');
		btn.setAttribute('aria-expanded', 'false');
		btn.dataset.dock = dock;

		// SVG 矢印アイコンを設定
		btn.innerHTML = this.createToggleArrowSVG(dock);

		btn.addEventListener('click', () => {
			this.toggle();
		});

		this.drawer.appendChild(btn);
		this.toggleBtn = btn;
	}

	/** トグルボタンの aria-expanded と矢印方向を更新する */
	private updateToggleButtonState(): void {
		if (!this.toggleBtn || !this.dockPosition) {
			return;
		}
		this.toggleBtn.setAttribute('aria-expanded', String(this._isOpen));
		this.toggleBtn.innerHTML = this.createToggleArrowSVG(this.dockPosition);
	}

	/** dock 方向と開閉状態に応じた SVG 矢印を生成する */
	private createToggleArrowSVG(dock: DockPosition): string {
		// 閉じている時: ドロワーが出てくる方向を指す矢印
		// 開いている時: ドロワーが隠れる方向を指す矢印（反転）
		const rotations: Record<DockPosition, { closed: number; open: number }> = {
			right: { closed: 180, open: 0 },
			left: { closed: 0, open: 180 },
			top: { closed: 90, open: 270 },
			bottom: { closed: 270, open: 90 },
		};
		const angle = this._isOpen ? rotations[dock].open : rotations[dock].closed;
		return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(${angle} 8 8)"/></svg>`;
	}

	/** オーバーレイ要素を生成してコンテナに配置する */
	private setupOverlay(hasContainer: boolean): void {
		this.overlayEl = document.createElement('div');
		this.overlayEl.classList.add(`${CSS_PREFIX}-overlay`);
		this.overlayEl.style.display = 'none';
		this.overlayEl.style.position = hasContainer ? 'absolute' : 'fixed';

		this.overlayEl.addEventListener('click', () => {
			this.close();
		});

		this.container.appendChild(this.overlayEl);
	}

	/** オーバーレイの表示/非表示を開閉状態に同期する */
	private updateOverlayVisibility(): void {
		if (!this.overlayEl || !this.useOverlay) {
			return;
		}
		this.overlayEl.style.display = this._isOpen ? '' : 'none';
	}

	/** キーボードショートカット（Escape + toggleKey）を設定する */
	private setupKeyboardShortcuts(): void {
		this.keydownHandler = (e: KeyboardEvent) => {
			// Escape キーでドロワーを閉じる
			if (e.key === 'Escape' && this._isOpen) {
				this.close();
				return;
			}

			// toggleKey でトグル
			if (this._toggleKey && e.key === this._toggleKey) {
				this.toggle();
			}
		};

		document.addEventListener('keydown', this.keydownHandler);
	}
}
