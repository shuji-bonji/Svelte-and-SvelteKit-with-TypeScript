// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

// vite-plugin-pwa の virtual モジュール宣言
// triple-slash reference だと svelte-check 経由で解決できない環境があるため、
// ここで直接 ambient declare する
declare module 'virtual:pwa-register' {
	import type { RegisterSWOptions } from 'vite-plugin-pwa/types';
	export type { RegisterSWOptions };
	export function registerSW(
		options?: RegisterSWOptions
	): (reloadPage?: boolean) => Promise<void>;
}

declare module 'virtual:pwa-info' {
	export interface PwaInfo {
		webManifest: {
			href: string;
			useCredentials: boolean;
			linkTag: string;
		};
		registerSW?: {
			inline?: boolean;
			mode?: 'registerSW' | 'auto';
			scope?: string;
			type?: 'classic' | 'module';
			script?: string;
		};
	}
	export const pwaInfo: PwaInfo | undefined;
}

export {};
