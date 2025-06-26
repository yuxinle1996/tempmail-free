<script lang="ts">
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import { settings, updateSettings, initSettings } from '../store/settings';
	let settingModal = $state<HTMLDialogElement>();
	let apiKey = $derived($settings.apiKey);
	let interval = $derived($settings.interval);

	const close = () => {
		settingModal!.close();
		setTimeout(() => {
			apiKey = $settings.apiKey;
			interval = $settings.interval;
		}, 1000);
	};

	const confirm = () => {
		updateSettings({
			apiKey,
			interval
		});
		close();
	};

	onMount(() => {
		initSettings();
	});
</script>

<header
	class="flex items-center justify-between border-b border-solid border-slate-200 bg-white px-5 py-4 whitespace-nowrap shadow-sm transition-all md:px-10"
>
	<div class="flex items-center gap-1">
		<img class="h-7 w-7 object-cover" src="/logo.png" alt="logo" />
		<h1 class="text-xl leading-tight font-bold tracking-tight text-slate-900">TempMail</h1>
	</div>
	<div class="flex items-center gap-6">
		<div class="tooltip tooltip-left tooltip-info" data-tip="设置">
			<button
				class="hover:text-info cursor-pointer align-middle transition-colors"
				onclick={() => {
					settingModal!.showModal();
				}}
			>
				<Icon icon="line-md:cog-loop" width="26" height="26" />
			</button>
		</div>
		<div class="tooltip tooltip-left tooltip-info">
			<div class="tooltip-content">
				<div class="text-base-content -rotate-3 animate-bounce">点击前往github</div>
			</div>
			<a
				class="hover:text-info transition-colors"
				href="https://github.com/yuxinle1996/tempmail-free"
				target="_blank"
				rel="noopener noreferrer"
			>
				<Icon icon="line-md:github-loop" width="26" height="26" />
			</a>
		</div>
	</div>
</header>

<dialog bind:this={settingModal} class="modal">
	<div class="modal-box">
		<!-- <form method="dialog">
			<button class="btn btn-sm btn-circle btn-ghost absolute top-2 right-2">✕</button>
		</form> -->
		<h3 class="text-lg font-bold">设置</h3>
		<div class="flex flex-col gap-4 py-4">
			<div class="flex flex-wrap items-center gap-2 sm:flex-nowrap">
				<label class="w-full sm:w-auto" for="key">API Key</label>
				<div
					class="tooltip tooltip-top tooltip-info w-[clamp(3rem,20rem,100%)]"
					data-tip="留空默认使用公共API, 额度用完就没了"
				>
					<input id="key" class="input input-info" type="text" bind:value={apiKey} />
				</div>
				<button
					class="text-info under-animation-[1px] cursor-pointer text-sm transition-colors"
					onclick={() => {
						window.open('https://rapidapi.com/pranavkdileep/api/tempmail-api-free', '_blank');
					}}>免费获取</button
				>
			</div>
			<div class="flex flex-wrap items-center gap-2 sm:flex-nowrap">
				<label class="w-full sm:w-auto" for="interval">自动间隔</label>
				<input
					id="interval"
					class="range range-sm text-warning/70 [--range-bg:var(--color-info)] [--range-fill:0] [--range-thumb:var(--color-secondary)]"
					type="range"
					min="5000"
					max="60000"
					step="1000"
					bind:value={interval}
				/>
				<span class="text-info/70 text-sm">{interval / 1000}s</span>
			</div>
		</div>
		<div class="modal-action">
			<button class="btn btn-soft btn-error" onclick={close}>取消</button>
			<button class="btn btn-soft btn-info" onclick={confirm}>确定</button>
		</div>
	</div>
</dialog>
