import { STYLE_ELEMENT_ID } from '../constants';

/** TileUI のデフォルト CSS */
const TILEUI_CSS = `
/* TileUI CSS 変数（テーマカスタマイズ用） */
:root {
	--tileui-tile-size: 100px;
	--tileui-gap: 0px;
	--tileui-bg: #1a1a2e;
	--tileui-tile-bg: #16213e;
	--tileui-tile-bg-hover: #1c2a4a;
	--tileui-border: #0f3460;
	--tileui-text: #e0e0e0;
	--tileui-text-muted: #8a8a9a;
	--tileui-accent: #0ea5e9;
	--tileui-accent-dim: rgba(14, 165, 233, 0.3);
	--tileui-knob-track: #2a2a4a;
	--tileui-knob-value: var(--tileui-accent);
	--tileui-knob-thumb: #ffffff;
	--tileui-toggle-off: #3a3a5a;
	--tileui-toggle-on: var(--tileui-accent);
	--tileui-radius: 4px;
	--tileui-font-size: 11px;
	--tileui-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* パネルコンテナ（CSS Grid） */
.tileui-panel {
	display: inline-grid;
	grid-template-columns: repeat(auto-fill, var(--tileui-tile-size));
	gap: var(--tileui-gap);
	padding: var(--tileui-gap);
	background: var(--tileui-bg);
	border-radius: var(--tileui-radius);
	font-family: var(--tileui-font-family);
	font-size: var(--tileui-font-size);
	color: var(--tileui-text);
	box-sizing: border-box;
	user-select: none;
}

/* タイル共通 */
.tileui-tile {
	width: var(--tileui-tile-size);
	height: var(--tileui-tile-size);
	background: var(--tileui-tile-bg);
	border: 1px solid var(--tileui-border);
	margin: -0.5px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	box-sizing: border-box;
	transition: background 0.15s ease;
}

.tileui-tile:hover {
	background: var(--tileui-tile-bg-hover);
}

/* タイルラベル */
.tileui-label {
	font-size: var(--tileui-font-size);
	color: var(--tileui-text-muted);
	text-align: center;
	line-height: 1.2;
	padding: 2px 4px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 100%;
}

/* タイル値表示 */
.tileui-value {
	font-size: calc(var(--tileui-font-size) + 1px);
	color: var(--tileui-text);
	text-align: center;
	font-variant-numeric: tabular-nums;
}

/* SVG ノブ */
.tileui-knob {
	cursor: grab;
}

.tileui-knob:active {
	cursor: grabbing;
}

.tileui-knob-track {
	fill: none;
	stroke: var(--tileui-knob-track);
	stroke-linecap: round;
}

.tileui-knob-value {
	fill: none;
	stroke: var(--tileui-accent);
	stroke-linecap: round;
	transition: d 0.05s ease;
}

.tileui-knob-thumb {
	fill: var(--tileui-knob-thumb);
	filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

/* トグルスイッチ */
.tileui-toggle {
	width: 36px;
	height: 20px;
	border-radius: 10px;
	background: var(--tileui-toggle-off);
	cursor: pointer;
	position: relative;
	transition: background 0.2s ease;
}

.tileui-toggle[data-active='true'] {
	background: var(--tileui-accent);
}

.tileui-toggle-thumb {
	width: 16px;
	height: 16px;
	border-radius: 50%;
	background: var(--tileui-knob-thumb);
	position: absolute;
	top: 2px;
	left: 2px;
	transition: transform 0.2s ease;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.tileui-toggle[data-active='true'] .tileui-toggle-thumb {
	transform: translateX(16px);
}

/* カラーコントローラ */
.tileui-color-preview {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	border: 2px solid var(--tileui-border);
	cursor: pointer;
}

.tileui-color-input {
	opacity: 0;
	position: absolute;
	width: 0;
	height: 0;
}

/* ボタンタイル */
.tileui-button {
	cursor: pointer;
	font-family: var(--tileui-font-family);
	font-size: var(--tileui-font-size);
	color: var(--tileui-text);
	background: none;
	border: none;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.tileui-button:active {
	background: var(--tileui-accent-dim);
}

/* 数値入力 */
.tileui-number-input {
	background: transparent;
	border: 1px solid var(--tileui-border);
	border-radius: var(--tileui-radius);
	color: var(--tileui-text);
	font-family: var(--tileui-font-family);
	font-size: var(--tileui-font-size);
	font-variant-numeric: tabular-nums;
	text-align: center;
	width: 60px;
	padding: 2px 4px;
	outline: none;
}

.tileui-number-input:focus {
	border-color: var(--tileui-accent);
}

/* フォルダ */
.tileui-folder-header {
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	padding: 4px 8px;
	box-sizing: border-box;
}

.tileui-folder-arrow {
	transition: transform 0.2s ease;
}

.tileui-folder-arrow[data-open='true'] {
	transform: rotate(90deg);
}
`;

/** 注入済みかどうか */
let injected = false;

/**
 * TileUI のスタイルを <head> に注入する。
 * 重複注入を防止する。
 */
export function injectStyles(): void {
	// 既にフラグが立っているなら何もしない
	if (injected) {
		return;
	}

	// DOM 上にも存在チェック（外部から挿入された場合の対策）
	if (document.getElementById(STYLE_ELEMENT_ID)) {
		injected = true;
		return;
	}

	const style = document.createElement('style');
	style.id = STYLE_ELEMENT_ID;
	style.textContent = TILEUI_CSS;
	document.head.appendChild(style);
	injected = true;
}

/**
 * テスト用: 注入状態をリセットする
 */
export function resetStyleInjection(): void {
	injected = false;
	const existing = document.getElementById(STYLE_ELEMENT_ID);
	if (existing) {
		existing.remove();
	}
}
