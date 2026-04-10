/**
 * step の小数点以下の桁数を返す
 * @param step - ステップ値（例: 0.01 → 2, 1 → 0, 0.1 → 1）
 * @returns 小数点以下の桁数
 */
export function getDecimalPlaces(step: number): number {
	const parts = step.toString().split('.');
	return parts[1]?.length ?? 0;
}

/** step 未指定時のデフォルト小数桁数 */
const DEFAULT_MAX_DECIMALS = 2;

/**
 * 値を step に応じた小数桁数でフォーマットする
 * step が未指定（デフォルト値）の場合は最大2桁に制限する
 * @param value - フォーマット対象の値
 * @param step - ステップ値（undefined の場合はデフォルト桁数を使用）
 * @returns フォーマット済みの文字列
 */
export function formatValue(value: number, step?: number): string {
	if (step === undefined) {
		// step 未指定の場合はデフォルトで小数点以下2桁を上限とする
		const decimals = Math.min(getDecimalPlaces(value), DEFAULT_MAX_DECIMALS);
		return value.toFixed(decimals);
	}
	const decimals = getDecimalPlaces(step);
	return value.toFixed(decimals);
}
