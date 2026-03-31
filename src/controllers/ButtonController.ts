import { CSS_PREFIX } from '../constants';
import { Controller } from './Controller';

/** ButtonController のオプション */
export interface ButtonOptions {
	/** ボタンのラベル */
	label?: string;
}

/**
 * ボタンコントローラー
 * クリックでコールバックを実行するタイル
 */
export class ButtonController extends Controller<() => void> {
	private readonly label: string;

	/** ボタン要素 */
	private button: HTMLButtonElement | null = null;

	/** クリックハンドラ */
	private readonly handleClick: () => void;

	constructor(obj: Record<string, unknown>, prop: string, options: ButtonOptions = {}) {
		super(obj, prop);
		this.label = options.label ?? prop;
		this.handleClick = this.onClick.bind(this);
	}

	createDOM(): HTMLElement {
		const tile = document.createElement('div');
		tile.classList.add(`${CSS_PREFIX}-tile`, `${CSS_PREFIX}-tile-button`);

		// ボタン要素
		this.button = document.createElement('button');
		this.button.type = 'button';
		this.button.classList.add(`${CSS_PREFIX}-button`);
		this.button.textContent = this.label;
		this.button.addEventListener('click', this.handleClick);

		tile.appendChild(this.button);

		this.element = tile;

		return tile;
	}

	/** ボタンクリック時にコールバックを実行 */
	private onClick(): void {
		const callback = this.value;
		if (typeof callback === 'function') {
			callback();
		}
	}

	dispose(): void {
		if (this.button) {
			this.button.removeEventListener('click', this.handleClick);
			this.button = null;
		}
		super.dispose();
	}
}
