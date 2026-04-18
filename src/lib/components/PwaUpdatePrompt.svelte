<script lang="ts">
	import { onMount } from 'svelte';

	// SW 登録状態（リアクティブ）
	let needRefresh = $state(false);
	let offlineReady = $state(false);
	let updateSW: ((reloadPage?: boolean) => Promise<void>) | undefined = $state();

	onMount(async () => {
		// SSR 時には実行しない（onMount はクライアントのみ）
		// Svelte 5 でも onMount は SSR 中に呼ばれないため安全
		if (typeof window === 'undefined') return;

		try {
			// virtual:pwa-register は vite-plugin-pwa が提供する仮想モジュール。
			// 実行時には vite が解決するが、svelte-check では virtual module を
			// 解決できないため明示的に型アサーションで迂回する。
			type RegisterSW = (options?: {
				immediate?: boolean;
				onNeedRefresh?: () => void;
				onOfflineReady?: () => void;
				onRegisteredSW?: (
					swScriptUrl: string,
					registration: ServiceWorkerRegistration | undefined
				) => void;
				onRegisterError?: (error: unknown) => void;
			}) => (reloadPage?: boolean) => Promise<void>;
			// @ts-expect-error - virtual module resolved at build time by vite-plugin-pwa
			const mod: { registerSW: RegisterSW } = await import('virtual:pwa-register');

			updateSW = mod.registerSW({
				immediate: true,
				onNeedRefresh() {
					needRefresh = true;
				},
				onOfflineReady() {
					offlineReady = true;
					// 5 秒で自動消去
					setTimeout(() => {
						offlineReady = false;
					}, 5000);
				},
				onRegisteredSW(_url: string, registration: ServiceWorkerRegistration | undefined) {
					// 1 時間ごとに更新チェック
					if (registration) {
						setInterval(
							() => {
								void registration.update();
							},
							60 * 60 * 1000
						);
					}
				}
			});
		} catch (err) {
			// dev 環境や SW 未対応ブラウザでは静かに失敗
			console.warn('[PWA] SW registration skipped:', err);
		}
	});

	function handleReload() {
		needRefresh = false;
		void updateSW?.(true);
	}

	function dismissRefresh() {
		needRefresh = false;
	}

	function dismissOffline() {
		offlineReady = false;
	}
</script>

{#if needRefresh}
	<div class="pwa-toast" role="alert" aria-live="polite">
		<div class="pwa-toast-message">
			<strong>新しいバージョンがあります</strong>
			<span>更新内容を読み込みますか？</span>
		</div>
		<div class="pwa-toast-actions">
			<button type="button" class="pwa-btn pwa-btn-primary" onclick={handleReload}>
				更新
			</button>
			<button type="button" class="pwa-btn pwa-btn-ghost" onclick={dismissRefresh}>
				後で
			</button>
		</div>
	</div>
{/if}

{#if offlineReady}
	<div class="pwa-toast pwa-toast-info" role="status" aria-live="polite">
		<div class="pwa-toast-message">
			<strong>オフライン対応の準備ができました</strong>
			<span>ネットワークが不安定な環境でも閲覧できます</span>
		</div>
		<button
			type="button"
			class="pwa-btn pwa-btn-ghost"
			aria-label="閉じる"
			onclick={dismissOffline}
		>
			✕
		</button>
	</div>
{/if}

<style>
	.pwa-toast {
		position: fixed;
		bottom: 1.25rem;
		right: 1.25rem;
		z-index: 50;
		display: flex;
		align-items: center;
		gap: 1rem;
		max-width: min(28rem, calc(100vw - 2rem));
		padding: 1rem 1.25rem;
		background: var(--color-bg, #ffffff);
		color: var(--color-text, #111827);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 0.75rem;
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.15),
			0 4px 6px -4px rgba(0, 0, 0, 0.1);
		font-size: 0.875rem;
		animation: pwa-slide-in 0.25s ease-out;
	}

	.pwa-toast-info {
		border-left: 4px solid #ff3e00;
	}

	.pwa-toast-message {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		flex: 1;
		min-width: 0;
	}

	.pwa-toast-message strong {
		font-weight: 600;
		font-size: 0.9375rem;
	}

	.pwa-toast-message span {
		opacity: 0.75;
	}

	.pwa-toast-actions {
		display: flex;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.pwa-btn {
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		border: none;
		cursor: pointer;
		transition: background 0.15s;
	}

	.pwa-btn-primary {
		background: #ff3e00;
		color: #ffffff;
	}

	.pwa-btn-primary:hover {
		background: #e63800;
	}

	.pwa-btn-ghost {
		background: transparent;
		color: inherit;
		opacity: 0.7;
	}

	.pwa-btn-ghost:hover {
		opacity: 1;
		background: rgba(0, 0, 0, 0.05);
	}

	@keyframes pwa-slide-in {
		from {
			transform: translateY(1rem);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	@media (max-width: 640px) {
		.pwa-toast {
			bottom: 1rem;
			right: 1rem;
			left: 1rem;
			max-width: none;
		}
	}
</style>
