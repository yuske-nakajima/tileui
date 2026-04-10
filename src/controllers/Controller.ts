/**
 * 全コントローラーの基底クラス
 * 各コントローラーはこのクラスを継承して createDOM を実装する
 */
export abstract class Controller<T = unknown> {
	/** コントローラーの DOM 要素 */
	protected element: HTMLElement | null = null;

	/** バインド対象のオブジェクト */
	protected obj: Record<string, unknown>;

	/** バインド対象のプロパティ名 */
	protected prop: string;

	/** 値変更時のコールバック */
	protected _onChange?: (value: T) => void;

	constructor(obj: Record<string, unknown>, prop: string) {
		this.obj = obj;
		this.prop = prop;
	}

	/** 現在の値を取得 */
	get value(): T {
		return this.obj[this.prop] as T;
	}

	/** 値を設定し、コールバックを呼び出す */
	set value(v: T) {
		this.obj[this.prop] = v;
		this.updateDisplay();
		this._onChange?.(v);
	}

	/**
	 * 値変更時のコールバックを設定する
	 * @returns メソッドチェーン用に this を返す
	 */
	onChange(callback: (value: T) => void): this {
		this._onChange = callback;
		return this;
	}

	/**
	 * タイルのスタイルを個別設定する
	 * @returns メソッドチェーン用に this を返す
	 */
	style(options: {
		bgColor?: string;
		textColor?: string;
		borderColor?: string;
		accentColor?: string;
	}): this {
		if (this.element) {
			if (options.bgColor) {
				this.element.style.backgroundColor = options.bgColor;
			}
			if (options.textColor) {
				this.element.style.color = options.textColor;
			}
			if (options.borderColor) {
				this.element.style.borderColor = options.borderColor;
			}
			if (options.accentColor) {
				this.element.style.setProperty('--tileui-accent', options.accentColor);
				this.element.style.setProperty('--tileui-toggle-on', options.accentColor);
				this.element.style.setProperty('--tileui-knob-value', options.accentColor);
			}
		}
		return this;
	}

	/** DOM の表示を現在の値に同期する */
	updateDisplay(): void {
		// サブクラスでオーバーライドして表示を更新する
	}

	/**
	 * DOM 要素を作成してタイルとして返す
	 * サブクラスで必ず実装する
	 */
	abstract createDOM(): HTMLElement;

	/** イベントリスナー等のクリーンアップ */
	dispose(): void {
		if (this.element?.parentNode) {
			this.element.parentNode.removeChild(this.element);
		}
		this.element = null;
		this._onChange = undefined;
	}
}
