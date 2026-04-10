// TileUI デモ — Sprint 1: パネル生成と Nothing design スタイル

import TileUI from '../src';

// tileui パネルを #gui コンテナに生成
const gui = new TileUI({
	container: document.getElementById('gui')!,
	title: 'Controls',
});

// ダミーパラメータ（Sprint 3 で p5.js と連携予定）
const params = {
	gridSize: 8,
	noiseScale: 0.1,
	speed: 0.5,
	rotation: 0,
	bgColor: '#000000',
	fgColor: '#faf9f6',
	animate: true,
	fill: true,
};

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
