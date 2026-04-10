// TileUI デモ — パネル + p5.js ジェネラティブアート連携

import TileUI from '../src';
import { artParams, initSketch, resizeSketch } from './sketch';

// p5.js スケッチを初期化
initSketch(document.getElementById('sketch')!);

// ウィンドウリサイズ時にキャンバスサイズを追従
window.addEventListener('resize', resizeSketch);

// tileui パネルを #gui コンテナに生成
const gui = new TileUI({
	container: document.getElementById('gui')!,
	title: 'Controls',
});

// artParams を GUI パネルで操作（参照を共有）
const params = artParams;

// 初期値を保持（Reset ボタン用）
const defaults = { ...artParams };

// ノブコントローラー（onChange でリアルタイム連携）
gui.add(params, 'gridSize', 3, 20, 1).onChange((v) => {
	artParams.gridSize = v;
});
gui.add(params, 'noiseScale', 0.01, 0.5, 0.01).onChange((v) => {
	artParams.noiseScale = v;
});
gui.add(params, 'speed', 0, 2, 0.01).onChange((v) => {
	artParams.speed = v;
});
gui.add(params, 'rotation', 0, 360, 1).onChange((v) => {
	artParams.rotation = v;
});

// カラーコントローラー
gui.addColor(params, 'bgColor').onChange((v) => {
	artParams.bgColor = v;
});
gui.addColor(params, 'fgColor').onChange((v) => {
	artParams.fgColor = v;
});

// 真偽値コントローラー
gui.addBoolean(params, 'animate').onChange((v) => {
	artParams.animate = v;
});
gui.addBoolean(params, 'fill').onChange((v) => {
	artParams.fill = v;
});

/** ランダムな hex カラーを生成 */
function randomHexColor(): string {
	return `#${Math.floor(Math.random() * 0xffffff)
		.toString(16)
		.padStart(6, '0')}`;
}

// Randomize ボタン — 全パラメータをランダム値に設定
gui.addButton('Randomize', () => {
	params.gridSize = Math.floor(Math.random() * 18) + 3;
	params.noiseScale = Math.random() * 0.49 + 0.01;
	params.speed = Math.random() * 2;
	params.rotation = Math.floor(Math.random() * 360);
	params.bgColor = randomHexColor();
	params.fgColor = randomHexColor();
	params.animate = Math.random() > 0.3;
	params.fill = Math.random() > 0.3;
	Object.assign(artParams, params);
	gui.updateDisplay();
});

// Reset ボタン — 初期値に戻す
gui.addButton('Reset', () => {
	Object.assign(params, defaults);
	Object.assign(artParams, defaults);
	gui.updateDisplay();
});

// インストールコマンドのクリックコピー
const installCmd = document.getElementById('install-cmd');
if (installCmd) {
	installCmd.addEventListener('click', () => {
		navigator.clipboard.writeText('npm install @yuske-nakajima/tileui').then(
			() => {
				const original = installCmd.textContent;
				installCmd.textContent = 'Copied!';
				setTimeout(() => {
					installCmd.textContent = original;
				}, 1500);
			},
			() => {
				// クリップボード API が使えない場合は何もしない
			},
		);
	});
}
