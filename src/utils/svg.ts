/** 極座標から直交座標への変換結果 */
interface CartesianPoint {
	x: number;
	y: number;
}

/**
 * 極座標を直交座標に変換する
 * @param cx - 中心の X 座標
 * @param cy - 中心の Y 座標
 * @param radius - 半径
 * @param angleDeg - 角度（度）。0度が右（3時方向）、時計回りに増加
 */
export function polarToCartesian(
	cx: number,
	cy: number,
	radius: number,
	angleDeg: number,
): CartesianPoint {
	const angleRad = ((angleDeg - 0) * Math.PI) / 180;
	return {
		x: cx + radius * Math.cos(angleRad),
		y: cy + radius * Math.sin(angleRad),
	};
}

/**
 * SVG の円弧パス（d 属性）を生成する
 * @param cx - 中心の X 座標
 * @param cy - 中心の Y 座標
 * @param radius - 半径
 * @param startAngle - 開始角度（度）
 * @param endAngle - 終了角度（度）
 * @returns SVG パスの d 属性文字列。角度差が 0 の場合は空文字列
 */
export function describeArc(
	cx: number,
	cy: number,
	radius: number,
	startAngle: number,
	endAngle: number,
): string {
	const angleDiff = endAngle - startAngle;

	// 角度差が 0 なら描画不要
	if (angleDiff === 0) {
		return '';
	}

	const start = polarToCartesian(cx, cy, radius, startAngle);
	const end = polarToCartesian(cx, cy, radius, endAngle);

	// 180度を超える場合は大きい弧フラグを立てる
	const largeArcFlag = Math.abs(angleDiff) > 180 ? 1 : 0;

	// 時計回り方向（sweep-flag = 1）
	const sweepFlag = 1;

	return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
}
