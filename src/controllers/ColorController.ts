import { CSS_PREFIX } from '../constants';
import { Controller } from './Controller';

/** ColorController のオプション */
export interface ColorOptions {
	/** 表示ラベル */
	label?: string;
}

/**
 * カラーコントローラー
 * input[type=color] と丸型プレビューで色を選択する
 */
export class ColorController extends Controller<string> {
	private readonly label: string;

	/** カラープレビュー要素 */
	private preview: HTMLElement | null = null;

	/** 隠し color input */
	private colorInput: HTMLInputElement | null = null;

	/** input の変更ハンドラ */
	private readonly handleChange: (e: Event) => void;

	/** プレビュークリックハンドラ */
	private readonly handlePreviewClick: () => void;

	constructor(obj: Record<string, unknown>, prop: string, options: ColorOptions = {}) {
		super(obj, prop);
		this.label = options.label ?? prop;
		this.handleChange = this.onChange_.bind(this);
		this.handlePreviewClick = this.onPreviewClick.bind(this);
	}

	createDOM(): HTMLElement {
		const tile = document.createElement('div');
		tile.classList.add(`${CSS_PREFIX}-tile`, `${CSS_PREFIX}-tile-color`);

		// ラベル
		const labelEl = document.createElement('div');
		labelEl.classList.add(`${CSS_PREFIX}-label`);
		labelEl.textContent = this.label;

		// カラープレビュー（丸型）
		this.preview = document.createElement('div');
		this.preview.classList.add(`${CSS_PREFIX}-color-preview`);
		this.preview.addEventListener('click', this.handlePreviewClick);

		// 隠し color input
		this.colorInput = document.createElement('input');
		this.colorInput.type = 'color';
		this.colorInput.classList.add(`${CSS_PREFIX}-color-input`);
		this.colorInput.addEventListener('input', this.handleChange);

		tile.appendChild(labelEl);
		tile.appendChild(this.preview);
		tile.appendChild(this.colorInput);

		this.element = tile;
		this.updateDisplay();

		return tile;
	}

	updateDisplay(): void {
		if (this.preview) {
			this.preview.style.backgroundColor = this.value;
		}
		if (this.colorInput) {
			this.colorInput.value = this.value;
		}
	}

	/** プレビュークリックで color input を開く */
	private onPreviewClick(): void {
		this.colorInput?.click();
	}

	/** input の値変更を反映 */
	private onChange_(_e: Event): void {
		if (!this.colorInput) return;
		this.value = this.colorInput.value;
	}

	dispose(): void {
		if (this.preview) {
			this.preview.removeEventListener('click', this.handlePreviewClick);
			this.preview = null;
		}
		if (this.colorInput) {
			this.colorInput.removeEventListener('input', this.handleChange);
			this.colorInput = null;
		}
		super.dispose();
	}
}
