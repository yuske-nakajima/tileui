import { CSS_PREFIX } from '../constants';
import { Controller } from './Controller';

/** ColorController のオプション */
export interface ColorOptions {
	/** 表示ラベル */
	label?: string;
}

/**
 * カラーコントローラー
 * ネイティブ input[type=color] の上にカスタム丸プレビューを重ねて表示する。
 * タップは input に直接届くため iOS WebKit でもカラーピッカーが開く。
 */
export class ColorController extends Controller<string> {
	private readonly label: string;

	/** カラープレビュー（表示用、pointer-events: none） */
	private preview: HTMLElement | null = null;

	/** ネイティブ color input（操作用、プレビューの下に配置） */
	private colorInput: HTMLInputElement | null = null;

	/** input の変更ハンドラ */
	private readonly handleChange: (e: Event) => void;

	constructor(obj: Record<string, unknown>, prop: string, options: ColorOptions = {}) {
		super(obj, prop);
		this.label = options.label ?? prop;
		this.handleChange = this.onChange_.bind(this);
	}

	createDOM(): HTMLElement {
		const tile = document.createElement('div');
		tile.classList.add(`${CSS_PREFIX}-tile`, `${CSS_PREFIX}-tile-color`);

		// ラベル
		const labelEl = document.createElement('div');
		labelEl.classList.add(`${CSS_PREFIX}-label`);
		labelEl.textContent = this.label;

		// wrapper: input とプレビューを重ねるコンテナ
		const wrapper = document.createElement('div');
		wrapper.classList.add(`${CSS_PREFIX}-color-wrapper`);

		// ネイティブ input（wrapper 全体を覆い、タップを受ける）
		this.colorInput = document.createElement('input');
		this.colorInput.type = 'color';
		this.colorInput.classList.add(`${CSS_PREFIX}-color-input`);
		this.colorInput.addEventListener('input', this.handleChange);

		// カスタムプレビュー丸（input の上に重ね、タップは通す）
		this.preview = document.createElement('div');
		this.preview.classList.add(`${CSS_PREFIX}-color-preview`);

		wrapper.appendChild(this.colorInput);
		wrapper.appendChild(this.preview);

		tile.appendChild(labelEl);
		tile.appendChild(wrapper);

		this.element = tile;
		this.updateDisplay();

		return tile;
	}

	updateDisplay(): void {
		if (this.colorInput) {
			this.colorInput.value = this.value;
		}
		if (this.preview) {
			this.preview.style.backgroundColor = this.value;
		}
	}

	/** input の値変更を反映 */
	private onChange_(_e: Event): void {
		if (!this.colorInput) return;
		this.value = this.colorInput.value;
	}

	dispose(): void {
		this.preview = null;
		if (this.colorInput) {
			this.colorInput.removeEventListener('input', this.handleChange);
			this.colorInput = null;
		}
		super.dispose();
	}
}
