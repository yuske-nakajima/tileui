import tseslint from 'typescript-eslint';

export default tseslint.config({
	files: ['src/**/*.ts'],
	extends: [tseslint.configs.base],
	languageOptions: {
		parserOptions: {
			project: './tsconfig.eslint.json',
			tsconfigRootDir: import.meta.dirname,
		},
	},
	rules: {
		'@typescript-eslint/no-deprecated': 'warn',
	},
});
