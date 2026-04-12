// ダークモード管理（localStorageに保存）
const STORAGE_KEY = 'theme-dark';

class ThemeState {
	dark = $state(false);

	toggle() {
		this.dark = !this.dark;
		this.apply();
		this.save();
	}

	init() {
		if (typeof window === 'undefined') return;

		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored !== null) {
			// localStorageに保存済みならそちらを優先
			this.dark = stored === 'true';
		} else {
			// 未保存ならOSの設定に従う
			this.dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		}
		this.apply();
	}

	private apply() {
		if (typeof document !== 'undefined') {
			document.documentElement.classList.toggle('dark', this.dark);
		}
	}

	private save() {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, String(this.dark));
		}
	}
}

export const theme = new ThemeState();
