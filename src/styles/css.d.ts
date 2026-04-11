// Vite の ?inline CSS import の型宣言
declare module '*.css?inline' {
	const css: string;
	export default css;
}
