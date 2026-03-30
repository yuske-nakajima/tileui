import { describe, expect, it } from 'vitest';
import { describeArc, polarToCartesian } from '../svg';

describe('polarToCartesian', () => {
	it('角度0度で右端の座標を返す', () => {
		const result = polarToCartesian(50, 50, 40, 0);
		expect(result.x).toBeCloseTo(90, 5);
		expect(result.y).toBeCloseTo(50, 5);
	});

	it('角度90度で下端の座標を返す', () => {
		const result = polarToCartesian(50, 50, 40, 90);
		expect(result.x).toBeCloseTo(50, 5);
		expect(result.y).toBeCloseTo(90, 5);
	});

	it('角度180度で左端の座標を返す', () => {
		const result = polarToCartesian(50, 50, 40, 180);
		expect(result.x).toBeCloseTo(10, 5);
		expect(result.y).toBeCloseTo(50, 5);
	});

	it('角度270度で上端の座標を返す', () => {
		const result = polarToCartesian(50, 50, 40, 270);
		expect(result.x).toBeCloseTo(50, 5);
		expect(result.y).toBeCloseTo(10, 5);
	});

	it('半径0で中心座標を返す', () => {
		const result = polarToCartesian(50, 50, 0, 45);
		expect(result.x).toBeCloseTo(50, 5);
		expect(result.y).toBeCloseTo(50, 5);
	});

	it('中心座標がオフセットされている場合', () => {
		const result = polarToCartesian(100, 200, 40, 0);
		expect(result.x).toBeCloseTo(140, 5);
		expect(result.y).toBeCloseTo(200, 5);
	});
});

describe('describeArc', () => {
	it('小さい弧（180度未満）の SVG パスを生成する', () => {
		const path = describeArc(50, 50, 40, 0, 90);
		// M で始まり A を含む
		expect(path).toMatch(/^M\s/);
		expect(path).toContain('A');
		// 短い弧なので largeArcFlag は 0
		expect(path).toMatch(/A\s+40\s+40\s+0\s+0\s+1/);
	});

	it('大きい弧（180度超）の SVG パスを生成する', () => {
		const path = describeArc(50, 50, 40, 0, 270);
		// 長い弧なので largeArcFlag は 1
		expect(path).toMatch(/A\s+40\s+40\s+0\s+1\s+1/);
	});

	it('開始角度と終了角度が同じ場合に空文字列を返す', () => {
		const path = describeArc(50, 50, 40, 0, 0);
		expect(path).toBe('');
	});

	it('360度の弧を正しく処理する', () => {
		const path = describeArc(50, 50, 40, 0, 360);
		// 360度は完全な円に近い弧
		expect(path).toContain('A');
	});

	it('ノブの典型的な設定で正しいパスを生成する', () => {
		// 135度開始、270度レンジ → 135度〜405度
		const path = describeArc(50, 50, 40, 135, 405);
		expect(path).toMatch(/^M\s/);
		expect(path).toContain('A');
	});
});
