import {
	CSS_PREFIX,
	KNOB_CENTER,
	KNOB_RADIUS,
	KNOB_RANGE_DEG,
	KNOB_START_DEG,
	KNOB_SVG_SIZE,
	KNOB_THUMB_RADIUS,
	KNOB_TRACK_WIDTH,
	KNOB_VALUE_WIDTH,
} from '../constants';
import { formatValue } from '../utils/number';
import { describeArc, polarToCartesian } from '../utils/svg';
import { Controller } from './Controller';

/** KnobController のオプション */
export interface KnobOptions {
	/** 最小値 */
	min?: number;
	/** 最大値 */
	max?: number;
	/** ステップ値 */
	step?: number;
	/** 表示ラベル */
	label?: string;
}

/**
 * 回転ノブコントローラー
 * SVG ベースの270度可動範囲ノブで数値を制御する
 */
export class KnobController extends Controller<number> {
	private readonly min: number;
	private readonly max: number;
	private readonly step: number;
	private readonly label: string;

	/** SVG パス要素（値表示用） */
	private valuePath: SVGPathElement | null = null;

	/** SVG つまみ要素 */
	private thumb: SVGCircleElement | null = null;

	/** 値表示用 span */
	private valueSpan: HTMLElement | null = null;

	/** ドラッグ中フラグ */
	private dragging = false;

	/** ドラッグ開始時の Y 座標 */
	private dragStartY = 0;

	/** ドラッグ開始時の値 */
	private dragStartValue = 0;

	/** バインド済みハンドラ（クリーンアップ用） */
	private readonly handlePointerMove: (e: PointerEvent) => void;
	private readonly handlePointerUp: (e: PointerEvent) => void;

	constructor(obj: Record<string, unknown>, prop: string, options: KnobOptions = {}) {
		super(obj, prop);
		this.min = options.min ?? 0;
		this.max = options.max ?? 100;
		this.step = options.step ?? 1;
		this.label = options.label ?? prop;

		// ハンドラをバインド
		this.handlePointerMove = this.onPointerMove.bind(this);
		this.handlePointerUp = this.onPointerUp.bind(this);
	}

	/** 正規化した値（0-1）を取得 */
	private get normalizedValue(): number {
		const range = this.max - this.min;
		if (range === 0) return 0;
		return (this.value - this.min) / range;
	}

	/** 値をステップに合わせて丸め、浮動小数点誤差を除去する */
	private clampAndStep(raw: number): number {
		const stepped = Math.round(raw / this.step) * this.step;
		const clamped = Math.min(this.max, Math.max(this.min, stepped));
		// step の小数桁数に合わせて丸めることで浮動小数点誤差を除去
		const decimals = (this.step.toString().split('.')[1] || '').length;
		return Number(clamped.toFixed(decimals));
	}

	createDOM(): HTMLElement {
		const tile = document.createElement('div');
		tile.classList.add(`${CSS_PREFIX}-tile`, `${CSS_PREFIX}-tile-knob`);

		// ラベル
		const labelEl = document.createElement('div');
		labelEl.classList.add(`${CSS_PREFIX}-label`);
		labelEl.textContent = this.label;

		// SVG ノブ
		const svg = this.createSVG();

		// 値表示
		this.valueSpan = document.createElement('div');
		this.valueSpan.classList.add(`${CSS_PREFIX}-value`);

		tile.appendChild(labelEl);
		tile.appendChild(svg);
		tile.appendChild(this.valueSpan);

		this.element = tile;
		this.updateDisplay();

		return tile;
	}

	/** SVG 要素を生成する */
	private createSVG(): SVGSVGElement {
		const ns = 'http://www.w3.org/2000/svg';
		const svg = document.createElementNS(ns, 'svg');
		svg.setAttribute('viewBox', `0 0 ${KNOB_SVG_SIZE} ${KNOB_SVG_SIZE}`);
		svg.setAttribute('width', '50');
		svg.setAttribute('height', '50');
		svg.classList.add(`${CSS_PREFIX}-knob`);

		// トラック（背景の弧）
		const endAngle = KNOB_START_DEG + KNOB_RANGE_DEG;
		const trackD = describeArc(KNOB_CENTER, KNOB_CENTER, KNOB_RADIUS, KNOB_START_DEG, endAngle);
		const track = document.createElementNS(ns, 'path');
		track.setAttribute('d', trackD);
		track.setAttribute('stroke-width', String(KNOB_TRACK_WIDTH));
		track.classList.add(`${CSS_PREFIX}-knob-track`);

		// 値表示の弧
		this.valuePath = document.createElementNS(ns, 'path');
		this.valuePath.setAttribute('stroke-width', String(KNOB_VALUE_WIDTH));
		this.valuePath.classList.add(`${CSS_PREFIX}-knob-value`);

		// つまみ
		this.thumb = document.createElementNS(ns, 'circle');
		this.thumb.setAttribute('r', String(KNOB_THUMB_RADIUS));
		this.thumb.classList.add(`${CSS_PREFIX}-knob-thumb`);

		svg.appendChild(track);
		svg.appendChild(this.valuePath);
		svg.appendChild(this.thumb);

		// ポインターイベント
		svg.addEventListener('pointerdown', (e) => this.onPointerDown(e));

		return svg;
	}

	updateDisplay(): void {
		const norm = this.normalizedValue;
		const valueAngle = KNOB_START_DEG + norm * KNOB_RANGE_DEG;

		// 値弧の更新
		if (this.valuePath) {
			const d = describeArc(KNOB_CENTER, KNOB_CENTER, KNOB_RADIUS, KNOB_START_DEG, valueAngle);
			this.valuePath.setAttribute('d', d);
		}

		// つまみ位置の更新
		if (this.thumb) {
			const pos = polarToCartesian(KNOB_CENTER, KNOB_CENTER, KNOB_RADIUS, valueAngle);
			this.thumb.setAttribute('cx', String(pos.x));
			this.thumb.setAttribute('cy', String(pos.y));
		}

		// 値テキストの更新（step に応じた桁数で表示）
		if (this.valueSpan) {
			this.valueSpan.textContent = formatValue(this.value, this.step);
		}
	}

	private onPointerDown(e: PointerEvent): void {
		e.preventDefault();
		// モバイルでドラッグ中に指がSVG外に出てもイベントを維持する
		(e.target as Element)?.setPointerCapture?.(e.pointerId);
		this.dragging = true;
		this.dragStartY = e.clientY;
		this.dragStartValue = this.value;
		document.addEventListener('pointermove', this.handlePointerMove);
		document.addEventListener('pointerup', this.handlePointerUp);
	}

	private onPointerMove(e: PointerEvent): void {
		if (!this.dragging) return;
		const dy = this.dragStartY - e.clientY;
		const range = this.max - this.min;
		// 200px のドラッグで全範囲をカバー
		const sensitivity = range / 200;
		const newValue = this.clampAndStep(this.dragStartValue + dy * sensitivity);
		this.value = newValue;
	}

	private onPointerUp(_e: PointerEvent): void {
		this.dragging = false;
		document.removeEventListener('pointermove', this.handlePointerMove);
		document.removeEventListener('pointerup', this.handlePointerUp);
	}

	dispose(): void {
		document.removeEventListener('pointermove', this.handlePointerMove);
		document.removeEventListener('pointerup', this.handlePointerUp);
		this.valuePath = null;
		this.thumb = null;
		this.valueSpan = null;
		super.dispose();
	}
}
