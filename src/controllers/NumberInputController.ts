import { CSS_PREFIX } from '../constants';
import { Controller } from './Controller';

/** NumberInputController のオプション */
export interface NumberInputOptions {
	/** ステップ値 */
	step?: number;
	/** 表示ラベル */
	label?: string;
}

/**
 * 数値入力コントローラー
 * input[type=number] ベースの範囲制限なし数値入力
 */
export class NumberInputController extends Controller<number> {
	private readonly step: number;
	private readonly label: string;

	/** input 要素 */
	private input: HTMLInputElement | null = null;

	/** input の変更ハンドラ */
	private readonly handleInput: (e: Event) => void;

	constructor(obj: Record<string, unknown>, prop: string, options: NumberInputOptions = {}) {
		super(obj, prop);
		this.step = options.step ?? 1;
		this.label = options.label ?? prop;

		this.handleInput = this.onInput.bind(this);
	}

	createDOM(): HTMLElement {
		const tile = document.createElement('div');
		tile.classList.add(`${CSS_PREFIX}-tile`, `${CSS_PREFIX}-tile-number`);

		// ラベル
		const labelEl = document.createElement('div');
		labelEl.classList.add(`${CSS_PREFIX}-label`);
		labelEl.textContent = this.label;

		// 数値入力
		this.input = document.createElement('input');
		this.input.type = 'number';
		this.input.step = String(this.step);
		this.input.classList.add(`${CSS_PREFIX}-number-input`);
		this.input.addEventListener('input', this.handleInput);

		tile.appendChild(labelEl);
		tile.appendChild(this.input);

		this.element = tile;
		this.updateDisplay();

		return tile;
	}

	updateDisplay(): void {
		if (this.input) {
			this.input.value = String(this.value);
		}
	}

	private onInput(_e: Event): void {
		if (!this.input) return;
		const parsed = Number.parseFloat(this.input.value);
		if (!Number.isNaN(parsed)) {
			this.value = parsed;
		}
	}

	dispose(): void {
		if (this.input) {
			this.input.removeEventListener('input', this.handleInput);
			this.input = null;
		}
		super.dispose();
	}
}
