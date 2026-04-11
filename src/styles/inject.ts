import { STYLE_ELEMENT_ID } from '../constants';
import TILEUI_CSS from './tileui.css?inline';

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
