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

// ノブコントローラー
gui.add(params, 'gridSize', 3, 20, 1);
gui.add(params, 'noiseScale', 0.01, 0.5, 0.01);
gui.add(params, 'speed', 0, 2, 0.01);
gui.add(params, 'rotation', 0, 360, 1);

// カラーコントローラー
gui.addColor(params, 'bgColor');
gui.addColor(params, 'fgColor');

// 真偽値コントローラー
gui.addBoolean(params, 'animate');
gui.addBoolean(params, 'fill');

// ボタン
gui.addButton('Randomize', () => console.log('TODO'));
gui.addButton('Reset', () => console.log('TODO'));

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
