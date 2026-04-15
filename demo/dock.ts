// TileUI ドロワー（Dock）デモ — 方向切替インタラクション + グラデーション背景

import type { DockPosition } from '../src';
import TileUI from '../src';

/** ドロワーのアクセントカラー（ゴールド系） */
const ACCENT = '#b38f59';

// ─── グラデーションアニメーション エンジン ───

/** HEX カラーを HSL (h: 0-360, s: 0-1, l: 0-1) に変換する */
function hexToHsl(hex: string): [number, number, number] {
	const raw = hex.replace('#', '');
	const r = Number.parseInt(raw.substring(0, 2), 16) / 255;
	const g = Number.parseInt(raw.substring(2, 4), 16) / 255;
	const b = Number.parseInt(raw.substring(4, 6), 16) / 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const l = (max + min) / 2;

	if (max === min) {
		return [0, 0, l];
	}

	const d = max - min;
	const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

	let h = 0;
	if (max === r) {
		h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
	} else if (max === g) {
		h = ((b - r) / d + 2) / 6;
	} else {
		h = ((r - g) / d + 4) / 6;
	}

	return [h * 360, s, l];
}

/** アニメーションフレームの ID */
let animFrameId: number | null = null;

/** 停止時のタイムスタンプオフセット（再開時にジャンプを防ぐ） */
let pausedOffset = 0;

/** 停止した瞬間の performance.now() */
let pausedAt = 0;

/** 1 フレーム分のグラデーション計算と DOM 更新 */
function updateGradient(): void {
	const [baseH] = hexToHsl(params.color);
	const s = params.intensity * 100;
	const l = 10 + params.intensity * 30;

	// 時間ベースの角度計算（オフセットで一時停止→再開をスムーズに）
	const effectiveTime = performance.now() - pausedOffset;
	const angle = (effectiveTime * params.speed) / 5000;
	const deg = angle % 360;

	// トライアドカラー（+120度、+240度）
	const h1 = baseH;
	const h2 = (baseH + 120) % 360;
	const h3 = (baseH + 240) % 360;

	const c1 = `hsl(${h1}, ${s}%, ${l}%)`;
	const c2 = `hsl(${h2}, ${s}%, ${l}%)`;
	const c3 = `hsl(${h3}, ${s}%, ${l}%)`;

	// 最後に c1 を繰り返してシームレスな回転を実現
	document.body.style.background = `linear-gradient(${deg}deg, ${c1}, ${c2}, ${c3}, ${c1})`;

	animFrameId = requestAnimationFrame(updateGradient);
}

/** アニメーションを開始する */
function startGradientAnimation(): void {
	if (animFrameId !== null) {
		return;
	}
	// 一時停止中のオフセットを反映
	if (pausedAt > 0) {
		pausedOffset += performance.now() - pausedAt;
		pausedAt = 0;
	}
	animFrameId = requestAnimationFrame(updateGradient);
}

/** アニメーションを停止する（角度を保持して再開時ジャンプなし） */
function stopGradientAnimation(): void {
	if (animFrameId !== null) {
		cancelAnimationFrame(animFrameId);
		animFrameId = null;
		pausedAt = performance.now();
	}
}

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
			if (v) {
				startGradientAnimation();
			} else {
				stopGradientAnimation();
			}
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

// グラデーションアニメーション開始
startGradientAnimation();
