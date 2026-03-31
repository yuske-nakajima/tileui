// TileUI デモ — 全機能を網羅的にテストする

import TileUI from '../src';

const params = {
	speed: 50,
	volume: 0.8,
	count: 10,
	enabled: true,
	color: '#ff6600',
};

// メインパネル
const gui = new TileUI({ title: 'TileUI Demo' });

// ノブコントローラー（min/max あり）
gui.add(params, 'speed', 0, 100, 1).onChange((v) => {
	console.log('speed:', v);
});

// ノブコントローラー（小数ステップ）
gui.add(params, 'volume', 0, 1, 0.01);

// 数値入力（範囲なし → NumberInput）
gui.add(params, 'count');

// 真偽値コントローラー
gui.addBoolean(params, 'enabled');

// カラーコントローラー
gui.addColor(params, 'color');

// ボタン
gui.addButton('Reset', () => {
	params.speed = 50;
	params.volume = 0.8;
	params.count = 10;
	params.enabled = true;
	params.color = '#ff6600';
	gui.updateDisplay();
	console.log('Reset!');
});

// フォルダ（サブグリッド）
const folder = gui.addFolder('Advanced');
folder.add(params, 'speed', 0, 200, 5);
