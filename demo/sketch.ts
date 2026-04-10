// p5.js ジェネラティブアート — tilerhyme エッセンス
// グリッドタイルベースのパターン生成器（Perlin ノイズ駆動）

// p5.js はグローバルに読み込まれる前提（CDN）
declare class p5 {
	constructor(sketch: (p: p5) => void, node?: HTMLElement);
	createCanvas(w: number, h: number): unknown;
	resizeCanvas(w: number, h: number): void;
	background(color: string): void;
	fill(color: string): void;
	noFill(): void;
	stroke(color: string): void;
	noStroke(): void;
	strokeWeight(weight: number): void;
	push(): void;
	pop(): void;
	translate(x: number, y: number): void;
	rotate(angle: number): void;
	rect(x: number, y: number, w: number, h: number): void;
	ellipse(x: number, y: number, w: number, h: number): void;
	triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void;
	arc(x: number, y: number, w: number, h: number, start: number, stop: number): void;
	noise(x: number, y?: number, z?: number): number;
	millis(): number;
	width: number;
	height: number;
	PI: number;
	HALF_PI: number;
	TWO_PI: number;
	radians(degrees: number): number;
	rectMode(mode: unknown): void;
	CENTER: unknown;
}

/** アートパラメータ（外部から書き換え可能） */
export const artParams = {
	gridSize: 8, // グリッド分割数 3-20
	noiseScale: 0.1, // ノイズスケール 0.01-0.5
	speed: 0.5, // アニメーション速度 0-2
	rotation: 0, // グローバル回転 0-360
	bgColor: '#000000', // 背景色
	fgColor: '#faf9f6', // 図形色
	animate: true, // アニメーション ON/OFF
	fill: true, // 塗り/線のみ
};

// p5 インスタンスへの参照（リサイズ時に使用）
let p5Instance: p5 | null = null;
let containerEl: HTMLElement | null = null;

/** コンテナの幅に基づいて正方形サイズを算出 */
function calcSize(container: HTMLElement): number {
	const rect = container.getBoundingClientRect();
	return Math.floor(Math.min(rect.width, rect.height));
}

/**
 * ノイズ値に基づいて図形を描画
 * 5 種の図形を均等に割り当て
 */
function drawShape(p: p5, noiseVal: number, size: number): void {
	const s = size * 0.8; // タイル内のマージン

	if (noiseVal < 0.2) {
		// 矩形
		p.rect(0, 0, s, s);
	} else if (noiseVal < 0.4) {
		// 円
		p.ellipse(0, 0, s, s);
	} else if (noiseVal < 0.6) {
		// 三角形
		const half = s / 2;
		p.triangle(0, -half, -half, half, half, half);
	} else if (noiseVal < 0.8) {
		// 十字（2つの矩形）
		const thick = s * 0.25;
		p.rect(0, 0, thick, s);
		p.rect(0, 0, s, thick);
	} else {
		// 弧
		p.arc(0, 0, s, s, 0, p.PI + p.HALF_PI);
	}
}

/** スケッチを初期化してキャンバスを配置 */
export function initSketch(container: HTMLElement): void {
	containerEl = container;

	p5Instance = new p5((p: p5) => {
		let time = 0;

		p.setup = () => {
			const size = calcSize(container);
			p.createCanvas(size, size);
			p.rectMode(p.CENTER);
		};

		p.draw = () => {
			const { gridSize, noiseScale, speed, rotation, bgColor, fgColor, animate, fill } = artParams;

			// 背景描画
			p.background(bgColor);

			// 時間を進める（animate が有効な場合のみ）
			if (animate) {
				time += speed * 0.01;
			}

			const cellSize = p.width / gridSize;

			// キャンバス中心を原点にしてグローバル回転
			p.push();
			p.translate(p.width / 2, p.height / 2);
			p.rotate(p.radians(rotation));
			p.translate(-p.width / 2, -p.height / 2);

			// 塗りまたは線のみモード設定
			if (fill) {
				p.fill(fgColor);
				p.noStroke();
			} else {
				p.noFill();
				p.stroke(fgColor);
				p.strokeWeight(1.5);
			}

			// グリッドを走査して各タイルに図形を描画
			for (let row = 0; row < gridSize; row++) {
				for (let col = 0; col < gridSize; col++) {
					const noiseVal = p.noise(col * noiseScale, row * noiseScale, time);

					p.push();
					// タイル中心に移動
					p.translate(col * cellSize + cellSize / 2, row * cellSize + cellSize / 2);
					drawShape(p, noiseVal, cellSize);
					p.pop();
				}
			}

			p.pop();
		};

		// p5.js 内蔵の windowResized は使わず、外部から resizeSketch() を呼ぶ
	}, container);
}

/** ウィンドウリサイズ時にキャンバスサイズを再計算 */
export function resizeSketch(): void {
	if (!p5Instance || !containerEl) return;
	const size = calcSize(containerEl);
	p5Instance.resizeCanvas(size, size);
}
