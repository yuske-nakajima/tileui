// TileUI ドロワー（Dock）デモ — 方向切替インタラクション

import type { DockPosition } from '../src';
import TileUI from '../src';

/** ドロワーのアクセントカラー（ゴールド系） */
const ACCENT = '#b38f59';

/** ドロワーで操作するサンプルパラメータ（インスタンス間で共有） */
const params = {
	speed: 50,
	intensity: 0.7,
	color: '#ff6600',
	enabled: true,
};

/** 現在のドック方向 */
let currentDock: DockPosition = 'right';

/** 現在の TileUI インスタンス */
let gui: TileUI | null = null;

/** 方向ラベルの DOM 要素 */
const directionLabel = document.getElementById('direction-label');

/** 方向ラベルを更新する */
function updateDirectionLabel(): void {
	if (directionLabel) {
		directionLabel.textContent = currentDock.toUpperCase();
	}
}

/** ドロワーを生成してコントロールを配置する */
function createDrawer(dock: DockPosition): TileUI {
	// top/bottom はタイル数に応じてレスポンシブ列数、left/right は制限付きレスポンシブ
	const columns = dock === 'top' || dock === 'bottom' ? { min: 3, max: 9 } : { min: 1, max: 3 };

	const instance = new TileUI({
		dock,
		columns,
		title: 'Dock Controls',
		collapsible: true,
		overlay: true,
		toggleKey: 'g',
	});

	// 方向切替ボタン群
	const directions: DockPosition[] = ['left', 'right', 'top', 'bottom'];
	for (const dir of directions) {
		instance
			.addButton(dir.charAt(0).toUpperCase() + dir.slice(1), () => {
				switchDock(dir);
			})
			.style({ accentColor: ACCENT });
	}

	// ノブ（数値スライダー）
	instance
		.add(params, 'speed', 0, 100, 1)
		.style({ accentColor: ACCENT })
		.onChange((v) => {
			params.speed = v;
		});

	instance
		.add(params, 'intensity', 0, 1, 0.01)
		.style({ accentColor: ACCENT })
		.onChange((v) => {
			params.intensity = v;
		});

	// カラーピッカー
	instance
		.addColor(params, 'color')
		.style({ accentColor: ACCENT })
		.onChange((v) => {
			params.color = v;
		});

	// トグル（boolean）
	instance
		.addBoolean(params, 'enabled')
		.style({ accentColor: ACCENT })
		.onChange((v) => {
			params.enabled = v;
		});

	// 初期状態: open
	instance.open();

	return instance;
}

/** ドック方向を切り替える（現在のインスタンスを破棄して再生成） */
function switchDock(dock: DockPosition): void {
	if (dock === currentDock) {
		return;
	}

	// 現在のインスタンスを破棄
	if (gui) {
		gui.dispose();
		gui = null;
	}

	// 新しい方向で再生成
	currentDock = dock;
	updateDirectionLabel();
	gui = createDrawer(dock);
}

// 初期生成
updateDirectionLabel();
gui = createDrawer(currentDock);
