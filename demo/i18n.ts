// デモページの言語切り替え（EN/JA トグル）

type Lang = 'en' | 'ja';

const STORAGE_KEY = 'tileui-demo-lang';

/** ページごとのタイトル定義 */
interface PageTitles {
	en: string;
	ja: string;
}

/** localStorage から保存済みの言語設定を復元する */
function getSavedLang(): Lang | null {
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved === 'en' || saved === 'ja') {
			return saved;
		}
	} catch {
		// localStorage が使えない環境では無視する
	}
	return null;
}

/** 言語設定を localStorage に保存する */
function saveLang(lang: Lang): void {
	try {
		localStorage.setItem(STORAGE_KEY, lang);
	} catch {
		// localStorage が使えない環境では無視する
	}
}

/** data-lang 属性と document.title を切り替える */
function applyLang(lang: Lang, titles: PageTitles): void {
	document.documentElement.setAttribute('data-lang', lang);
	document.title = titles[lang];
}

/** トグルボタンのアクティブ状態を更新する */
function updateToggleButtons(lang: Lang): void {
	const enBtn = document.querySelector<HTMLButtonElement>('.lang-toggle__btn[data-value="en"]');
	const jaBtn = document.querySelector<HTMLButtonElement>('.lang-toggle__btn[data-value="ja"]');
	if (enBtn) {
		enBtn.classList.toggle('lang-toggle__btn--active', lang === 'en');
	}
	if (jaBtn) {
		jaBtn.classList.toggle('lang-toggle__btn--active', lang === 'ja');
	}
}

/** i18n を初期化する。ページ読み込み時に呼び出す */
export function initI18n(titles: PageTitles): void {
	const saved = getSavedLang();
	const lang: Lang = saved ?? 'en';

	applyLang(lang, titles);
	updateToggleButtons(lang);

	document.addEventListener('click', (e) => {
		const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.lang-toggle__btn');
		if (!btn) {
			return;
		}
		const value = btn.dataset.value;
		if (value !== 'en' && value !== 'ja') {
			return;
		}
		applyLang(value, titles);
		updateToggleButtons(value);
		saveLang(value);
	});
}
