import { CSS_PREFIX } from '../constants';
import { Controller } from './Controller';

/** BooleanController のオプション */
export interface BooleanOptions {
	/** 表示ラベル */
	label?: string;
}

/**
 * 真偽値コントローラー
 * トグルスイッチ UI で true/false を切り替える
 */
export class BooleanController extends Controller<boolean> {
	private readonly label: string;

	/** トグルスイッチ要素 */
	private toggle: HTMLElement | null = null;

	/** クリックハンドラ */
	private readonly handleClick: () => void;

	constructor(obj: Record<string, unknown>, prop: string, options: BooleanOptions = {}) {
		super(obj, prop);
		this.label = options.label ?? prop;
		this.handleClick = this.onClick.bind(this);
	}

	createDOM(): HTMLElement {
		const tile = document.createElement('div');
		tile.classList.add(`${CSS_PREFIX}-tile`, `${CSS_PREFIX}-tile-boolean`);

		// ラベル
		const labelEl = document.createElement('div');
		labelEl.classList.add(`${CSS_PREFIX}-label`);
		labelEl.textContent = this.label;

		// トグルスイッチ
		this.toggle = document.createElement('div');
		this.toggle.classList.add(`${CSS_PREFIX}-toggle`);

		const thumb = document.createElement('div');
		thumb.classList.add(`${CSS_PREFIX}-toggle-thumb`);
		this.toggle.appendChild(thumb);

		this.toggle.addEventListener('click', this.handleClick);

		tile.appendChild(labelEl);
		tile.appendChild(this.toggle);

		this.element = tile;
		this.updateDisplay();

		return tile;
	}

	updateDisplay(): void {
		if (this.toggle) {
			this.toggle.dataset.active = String(this.value);
		}
	}

	private onClick(): void {
		this.value = !this.value;
	}

	dispose(): void {
		if (this.toggle) {
			this.toggle.removeEventListener('click', this.handleClick);
			this.toggle = null;
		}
		super.dispose();
	}
}
