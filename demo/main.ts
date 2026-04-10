// TileUI デモ — パネル + p5.js ジェネラティブアート連携

declare const __VERSION__: string;

import TileUI from '../src';
import { artParams, initSketch, resizeSketch } from './sketch';

// バージョン表示（package.json から自動注入）
document.getElementById('version')!.textContent = `v${__VERSION__}`;

// p5.js スケッチを初期化
initSketch(document.getElementById('sketch')!);

// ウィンドウリサイズ時にキャンバスサイズを追従
window.addEventListener('resize', resizeSketch);

// tileui パネルを #gui コンテナに生成
const gui = new TileUI({
	container: document.getElementById('gui')!,
	columns: 2,
	title: 'Controls',
});

// artParams を GUI パネルで操作（参照を共有）
const params = artParams;

// 初期値を保持（Reset ボタン用）
const defaults = { ...artParams };

// メインパネルのアクセントカラー
const mainAccent = '#8fb359';

// ノブコントローラー
gui
	.add(params, 'gridSize', 3, 20, 1)
	.style({ accentColor: mainAccent })
	.onChange((v) => {
		artParams.gridSize = v;
	});
gui
	.add(params, 'noiseScale', 0.01, 0.5, 0.01)
	.style({ accentColor: mainAccent })
	.onChange((v) => {
		artParams.noiseScale = v;
	});
gui
	.add(params, 'speed', 0, 2, 0.01)
	.style({ accentColor: mainAccent })
	.onChange((v) => {
		artParams.speed = v;
	});
gui
	.add(params, 'rotation', 0, 360, 1)
	.style({ accentColor: mainAccent })
	.onChange((v) => {
		artParams.rotation = v;
	});

// カラーコントローラー
gui
	.addColor(params, 'bgColor')
	.style({ accentColor: mainAccent })
	.onChange((v) => {
		artParams.bgColor = v;
	});
gui
	.addColor(params, 'fgColor')
	.style({ accentColor: mainAccent })
	.onChange((v) => {
		artParams.fgColor = v;
	});

// 真偽値コントローラー
gui
	.addBoolean(params, 'animate')
	.style({ accentColor: mainAccent })
	.onChange((v) => {
		artParams.animate = v;
	});
gui
	.addBoolean(params, 'fill')
	.style({ accentColor: mainAccent })
	.onChange((v) => {
		artParams.fill = v;
	});

/** ランダムな hex カラーを生成 */
function randomHexColor(): string {
	return `#${Math.floor(Math.random() * 0xffffff)
		.toString(16)
		.padStart(6, '0')}`;
}

// Randomize ボタン
gui
	.addButton('Randomize', () => {
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
	})
	.style({ accentColor: mainAccent });

// Reset ボタン
gui
	.addButton('Reset', () => {
		Object.assign(params, defaults);
		Object.assign(artParams, defaults);
		gui.updateDisplay();
	})
	.style({ accentColor: mainAccent });

// === ショーケース ===

const sampleParams = { speed: 50, volume: 0.8, color: '#ff6600', enabled: true };

// ショーケースごとのアクセントカラー（HSB 彩度50% 明度70%）
const showcaseAccents = {
	col2: '#b35959', // 色相0° — レッド系
	col3: '#59b3a2', // 色相170° — ティール系
	col4: '#7a59b3', // 色相270° — パープル系
};

function addSampleControls(g: TileUI, ac: string) {
	g.add(sampleParams, 'speed', 0, 100, 1).style({ accentColor: ac });
	g.add(sampleParams, 'volume', 0, 1, 0.01).style({ accentColor: ac });
	g.addColor(sampleParams, 'color').style({ accentColor: ac });
	g.addBoolean(sampleParams, 'enabled').style({ accentColor: ac });
	g.addButton('Reset', () => {}).style({ accentColor: ac });
	g.addButton('Action', () => {}).style({ accentColor: ac });
}

// 2列
const s2 = new TileUI({
	container: document.getElementById('showcase-2col')!,
	columns: 2,
	title: '2 Columns',
});
addSampleControls(s2, showcaseAccents.col2);

// 3列
const s3 = new TileUI({
	container: document.getElementById('showcase-3col')!,
	columns: 3,
	title: '3 Columns',
});
addSampleControls(s3, showcaseAccents.col3);

// 4列
const s4 = new TileUI({
	container: document.getElementById('showcase-4col')!,
	columns: 4,
	title: '4 Columns',
});
addSampleControls(s4, showcaseAccents.col4);

// 個別スタイル
const s5 = new TileUI({
	container: document.getElementById('showcase-styled')!,
	columns: 3,
	title: 'Custom Styles',
});
s5.add(sampleParams, 'speed', 0, 100, 1).style({ bgColor: '#2d1b69', borderColor: '#5b3cc4' });
s5.add(sampleParams, 'volume', 0, 1, 0.01).style({
	bgColor: '#1b4d3e',
	textColor: '#80ffdb',
	borderColor: '#2d8a6e',
});
s5.addColor(sampleParams, 'color').style({ bgColor: '#4a1942', borderColor: '#7a2d6d' });
s5.addBoolean(sampleParams, 'enabled').style({ bgColor: '#0d3b66', borderColor: '#1a6db5' });
s5.addButton('Reset', () => {}).style({
	bgColor: '#6b2737',
	textColor: '#ffccd5',
	borderColor: '#a33d52',
});
s5.addButton('Action', () => {}).style({
	bgColor: '#1a472a',
	textColor: '#90ee90',
	borderColor: '#2d8a4e',
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
