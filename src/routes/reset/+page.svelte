<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';

	type Step =
		| { kind: 'pending'; label: string }
		| { kind: 'done'; label: string; detail?: string }
		| { kind: 'error'; label: string; detail: string };

	let steps = $state<Step[]>([]);
	let finished = $state(false);
	let countdown = $state(5);

	function push(step: Step) {
		steps = [...steps, step];
	}

	onMount(() => {
		let timer: ReturnType<typeof setInterval> | undefined;

		(async () => {
			// 1) Service Worker のアンレジスト
			if ('serviceWorker' in navigator) {
				try {
					const regs = await navigator.serviceWorker.getRegistrations();
					if (regs.length === 0) {
						push({ kind: 'done', label: 'Service Worker', detail: '登録なし' });
					} else {
						await Promise.all(regs.map((r) => r.unregister()));
						push({
							kind: 'done',
							label: 'Service Worker',
							detail: `${regs.length} 件をアンレジスト`
						});
					}
				} catch (err) {
					push({
						kind: 'error',
						label: 'Service Worker',
						detail: err instanceof Error ? err.message : String(err)
					});
				}
			} else {
				push({ kind: 'done', label: 'Service Worker', detail: 'ブラウザ未対応' });
			}

			// 2) Cache Storage の全削除
			if ('caches' in window) {
				try {
					const keys = await caches.keys();
					if (keys.length === 0) {
						push({ kind: 'done', label: 'Cache Storage', detail: 'キャッシュなし' });
					} else {
						await Promise.all(keys.map((k) => caches.delete(k)));
						push({
							kind: 'done',
							label: 'Cache Storage',
							detail: `${keys.length} 件を削除`
						});
					}
				} catch (err) {
					push({
						kind: 'error',
						label: 'Cache Storage',
						detail: err instanceof Error ? err.message : String(err)
					});
				}
			} else {
				push({ kind: 'done', label: 'Cache Storage', detail: 'ブラウザ未対応' });
			}

			finished = true;

			// 5 秒カウントダウン後にトップへ
			timer = setInterval(() => {
				countdown -= 1;
				if (countdown <= 0) {
					if (timer !== undefined) clearInterval(timer);
					location.replace(`${base}/`);
				}
			}, 1000);
		})();

		return () => {
			if (timer !== undefined) clearInterval(timer);
		};
	});

	function goHomeNow() {
		location.replace(`${base}/`);
	}
</script>

<svelte:head>
	<title>PWA リセット | TypeScriptで学ぶ Svelte 5/SvelteKit</title>
	<meta name="robots" content="noindex, nofollow" />
	<meta
		name="description"
		content="Service Worker とキャッシュをクリアし、表示異常から復旧するための緊急ページです。"
	/>
</svelte:head>

<section class="reset-page">
	<h1>PWA リセット</h1>
	<p class="lead">
		Service Worker とキャッシュをクリアして、サイトを初期状態に戻します。
		表示がおかしい・古い内容が出続ける場合の緊急復旧用ページです。
	</p>

	<ol class="steps">
		{#each steps as step (step.label)}
			<li class="step step-{step.kind}">
				<span class="step-icon" aria-hidden="true">
					{#if step.kind === 'done'}✅{:else if step.kind === 'error'}⚠️{:else}⏳{/if}
				</span>
				<span class="step-label">{step.label}</span>
				{#if step.kind !== 'pending' && step.detail}
					<span class="step-detail">{step.detail}</span>
				{/if}
			</li>
		{/each}
	</ol>

	{#if finished}
		<div class="actions">
			<p class="countdown">
				{countdown} 秒後にトップページへ移動します
			</p>
			<button type="button" class="btn" onclick={goHomeNow}>今すぐ移動</button>
		</div>
	{/if}

	<details class="more">
		<summary>このページについて</summary>
		<p>
			このページは <code>navigator.serviceWorker.getRegistrations()</code> と
			<code>caches.keys()</code> を呼び、現在のオリジン配下に登録されている
			Service Worker・Cache Storage をすべて削除します。 localStorage / sessionStorage /
			IndexedDB には触りません（ユーザー設定を保持するため）。
		</p>
		<p>
			不具合が解消しない場合は、ブラウザの開発者ツールで「Application → Storage → Clear site
			data」を実行してください。
		</p>
	</details>
</section>

<style>
	.reset-page {
		max-width: 40rem;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	h1 {
		font-size: 1.75rem;
		margin-bottom: 0.5rem;
	}

	.lead {
		opacity: 0.8;
		line-height: 1.6;
		margin-bottom: 2rem;
	}

	.steps {
		list-style: none;
		padding: 0;
		margin: 0 0 2rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.step {
		display: grid;
		grid-template-columns: 1.5rem auto 1fr;
		gap: 0.75rem;
		align-items: baseline;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		background: var(--color-bg-subtle, #f5f5f5);
		border: 1px solid var(--color-border, #e5e7eb);
	}

	.step-error {
		border-color: #f59e0b;
		background: rgba(245, 158, 11, 0.08);
	}

	.step-icon {
		text-align: center;
	}

	.step-label {
		font-weight: 600;
	}

	.step-detail {
		opacity: 0.7;
		font-size: 0.875rem;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.25rem;
		background: rgba(255, 62, 0, 0.08);
		border: 1px solid rgba(255, 62, 0, 0.3);
		border-radius: 0.5rem;
		margin-bottom: 2rem;
	}

	.countdown {
		flex: 1;
		margin: 0;
		font-weight: 500;
	}

	.btn {
		padding: 0.5rem 1rem;
		background: #ff3e00;
		color: #ffffff;
		border: none;
		border-radius: 0.5rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.15s;
	}

	.btn:hover {
		background: #e63800;
	}

	.more {
		opacity: 0.75;
		font-size: 0.875rem;
	}

	.more summary {
		cursor: pointer;
		font-weight: 500;
		margin-bottom: 0.5rem;
	}

	.more p {
		line-height: 1.6;
		margin: 0.5rem 0;
	}

	.more code {
		font-family: monospace;
		background: var(--color-code-bg, rgba(0, 0, 0, 0.05));
		padding: 0.1rem 0.3rem;
		border-radius: 0.25rem;
		font-size: 0.85em;
	}
</style>
