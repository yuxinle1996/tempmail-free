<script lang="ts">
	import Icon from '@iconify/svelte';
	import { onDestroy, onMount } from 'svelte';
	import Cookie from 'js-cookie';
	import type { EmailInfo, EmailResponse } from '$lib/types/server.js';
	import toast from 'svelte-french-toast';
	import MailList from '$lib/components/MailList.svelte';
	import ClipboardJS from 'clipboard';

	const { data } = $props();
	let resultEmail: string = $state('');
	let currentName = $derived(resultEmail?.split('@')[0] || '');
	let currentDomain = $derived.by(() => {
		const suffix = resultEmail?.split('@')[1] || '';
		return suffix ? '@' + suffix : '';
	});
	let disabled = $state(true);
	let isAuto = $state(false);
	let loading = $state(false);
	let emailInfo: EmailResponse = $state({
		count: 0,
		first_id: '',
		last_id: '',
		mail_list: []
	});
	let noticeMailList: EmailInfo[] = $state([]);
	let selectedEmail: EmailInfo | null = $state(null);
	let timeout = $state(10000);
	let sound: HTMLAudioElement | undefined;
	let firstId: string = '';

	// 生成邮箱
	async function generateEmail(body?: { name: string; domain: string }) {
		toast.loading('邮箱生成中...', { id: 'generate-email' });
		try {
			const res = await fetch('/api/email', {
				method: 'POST',
				body: JSON.stringify(body || {})
			});
			if (res.status !== 200) {
				throw new Error((await res.json())?.message || '邮箱生成失败');
			}
			const info = await res.json();
			const domains = await data.domains;
			if (!domains || domains.length === 0) {
				throw new Error('邮箱域名不存在');
			}
			resultEmail = info?.email || '';
			if (info?.token) {
				Cookie.set('email_token', info.token, {
					path: '/',
					expires: 7
				});
			}
			toast.success('生成成功: ' + resultEmail);
		} catch (error: any) {
			toast.error(error.message, { icon: '💥' });
		} finally {
			toast.remove('generate-email');
		}
	}

	// 获取邮件
	const getMails = async (init: boolean = false) => {
		if (!resultEmail) {
			toast.error('邮箱不能为空', { icon: '💥' });
			isAuto = false;
			return;
		}
		loading = true;
		try {
			const searchParams = new URLSearchParams({
				first_id: firstId || ''
			});
			const res = await fetch(`/api/email/${resultEmail}?${searchParams.toString()}`);
			if (res.status !== 200) {
				throw new Error((await res.json())?.message || '获取邮件失败');
			}
			const info: EmailResponse = await res.json();
			const mailList = info.mail_list || [];
			emailInfo = {
				...info,
				mail_list: [...mailList, ...emailInfo.mail_list]
			};
			// 非初始化 且 有新邮件时, 语音通知
			if (!init && info.count > 0) {
				noticeMailList = [...mailList, ...noticeMailList];
				playSound();
			}
			firstId = info.first_id;
		} catch (error: any) {
			isAuto = false; // 如果有自动获取邮件，停止获取
			if (error.message === 'Email not found') {
				toast.error('邮箱不存在，正在重新生成...', { icon: '💌', duration: 2000 });
				await generateEmail({
					name: resultEmail.split('@')[0],
					domain: '@' + resultEmail.split('@')[1]
				});
				getMails(init);
			} else {
				toast.error(error.message, { icon: '💥' });
			}
		} finally {
			loading = false;
		}
	};

	// 删除邮箱
	const deleteEmail = async () => {
		isAuto = false;
		toast.loading('删除中...', { id: 'delete-email' });
		try {
			const res = await fetch(`/api/email/${resultEmail}`, {
				method: 'DELETE'
			});
			if (res.status !== 200) {
				throw new Error((await res.json())?.message || '删除失败');
			}
			toast.success('删除成功');
			resultEmail = '';
			reset();
		} catch (error: any) {
			toast.error(error.message, { icon: '💥' });
		} finally {
			toast.remove('delete-email');
		}
	};

	// 自定义
	const editEmail = () => {
		disabled = false;
	};

	// 确定
	const confirm = async () => {
		disabled = true;
		isAuto = false;
		if (currentName + currentDomain !== resultEmail) {
			reset();
		}
		await generateEmail({
			name: currentName,
			domain: currentDomain
		});
		await getMails();
	};

	// 选择邮件
	const onSelect = (emailInfo: EmailInfo) => {
		selectedEmail = emailInfo;
		noticeMailList = noticeMailList.filter((item) => item.id !== emailInfo.id);
	};

	// 返回
	const goBack = () => {
		selectedEmail = null;
	};

	// 重置
	function reset() {
		Cookie.remove('email_token');
		emailInfo = {
			count: 0,
			first_id: '',
			last_id: '',
			mail_list: []
		};
		noticeMailList = [];
		selectedEmail = null;
		firstId = '';
	}

	function playSound() {
		if (!sound) {
			sound = document.createElement('audio');
			sound.setAttribute('src', '/event.mp3');
		}
		sound.play();
	}

	$effect(() => {
		if (!resultEmail) {
			Cookie.remove('email');
			return;
		}
		Cookie.set('email', resultEmail, {
			path: '/',
			expires: 7
		});
	});

	// 自动获取邮件
	$effect(() => {
		let interval: number;
		if (isAuto) {
			getMails();
			interval = setInterval(getMails, timeout);
		}
		return () => {
			clearInterval(interval);
		};
	});

	$effect(() => {
		const clipboard = new ClipboardJS('#copy-email');
		clipboard.on('success', (e) => {
			toast.success('复制成功: ' + e.text);
		});
		clipboard.on('error', () => {
			toast.error('复制失败');
		});
		return () => {
			clipboard.destroy();
		};
	});

	onMount(async () => {
		if (data.localEmail) {
			resultEmail = data.localEmail;
		} else {
			await generateEmail();
		}
		await getMails(true);
	});
</script>

<!-- 操作 -->
{#snippet operation()}
	{#if disabled}
		<div class="tooltip tooltip-top tooltip-info self-stretch" data-tip="自定义邮箱和后缀域名">
			<button class="btn w-full" onclick={editEmail}>
				自定义
				<Icon icon="line-md:edit" width="16" height="16" />
			</button>
		</div>
	{/if}
	<div class="tooltip tooltip-top tooltip-info self-stretch" data-tip="随机生成邮箱">
		<button
			class="btn btn-outline btn-secondary w-full"
			onclick={async () => {
				disabled = true;
				resultEmail = '';
				reset();
				await generateEmail();
				await getMails();
			}}
		>
			随机
			<Icon icon="icon-park-outline:unordered-list" width="16" height="16" />
		</button>
	</div>
	{#if isAuto}
		<button
			class="btn btn-soft btn-error self-stretch"
			onclick={() => {
				isAuto = false;
			}}
		>
			停止
			<Icon icon="pepicons-pencil:stopwatch-circle-off" width="16" height="16" />
		</button>
	{:else}
		<div
			class="tooltip tooltip-top tooltip-info self-stretch"
			data-tip="自动获取邮件，每10秒获取一次"
		>
			<button
				disabled={!disabled}
				class="btn btn-soft btn-primary w-full"
				onclick={() => {
					isAuto = true;
				}}
			>
				自动
				<Icon icon="fluent-mdl2:mail-schedule" width="16" height="16" />
			</button>
		</div>
	{/if}
	<div class="flex flex-1 justify-end self-stretch">
		<button class="btn btn-soft btn-error w-full sm:w-auto" onclick={deleteEmail}>
			删除
			<Icon icon="material-symbols:delete-outline" width="16" height="16" />
		</button>
	</div>
{/snippet}

<!-- 邮件详情 -->
{#snippet emailDetail(detail: EmailInfo)}
	<div class="flex-1 px-4 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-4xl overflow-hidden rounded-lg bg-white shadow-lg">
			<div class="border-b border-slate-200 p-6">
				<button class="btn" onclick={goBack}>
					<Icon icon="tabler:arrow-left" width="16" height="16" />
					返回
				</button>
			</div>
			<div class="p-6 md:p-8">
				<h2 class="text-1xl mb-4 leading-tight font-bold tracking-tight text-slate-900 md:text-2xl">
					主题: {detail.subject}
				</h2>
				<div class="mb-6 space-y-3 border-b border-slate-200 pb-6 text-sm text-slate-600">
					<div class="flex items-center gap-2">
						<span class="font-medium text-slate-800">发件人:</span>
						<span>{detail.from}</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="font-medium text-slate-800">收件人:</span>
						<span>{detail.to}</span>
					</div>
					{#if detail.cc}
						<div class="flex items-center gap-2">
							<span class="font-medium text-slate-800">抄送:</span>
							<span>{detail.cc}</span>
						</div>
					{/if}
					<div class="flex items-center gap-2">
						<span class="font-medium text-slate-800">时间:</span>
						<span>{detail.created_at}</span>
					</div>
				</div>
				<article class="prose prose-slate max-w-none text-base leading-relaxed text-slate-700">
					{#if detail.body_html}
						<div>{@html detail.body_html}</div>
					{:else}
						<div class="whitespace-pre-wrap">{detail.body_text}</div>
					{/if}
				</article>
			</div>
		</div>
	</div>
{/snippet}

{#if selectedEmail}
	{@render emailDetail(selectedEmail)}
{:else}
	<div class="flex w-full max-w-3xl flex-col">
		<section class="mb-8 rounded-xl bg-white p-6 shadow-lg transition-all sm:p-8">
			<h2
				class="mb-6 text-center text-2xl leading-tight font-bold tracking-tight text-slate-800 transition-all sm:mb-8 sm:text-3xl"
			>
				临时邮箱
			</h2>
			<div class="flex flex-col items-center justify-center gap-2">
				<div class="flex w-full flex-col items-center gap-2 transition-all sm:flex-row md:w-4/5">
					<label class="input select input-info w-full">
						<div>
							<Icon icon="carbon:email" width="20" height="20" />
						</div>
						<input class="grow" type="text" bind:value={currentName} {disabled} />
						<select bind:value={currentDomain} {disabled}>
							{#await data.domains}
								<option value="" disabled selected>@邮箱后缀...</option>
							{:then domains}
								<option value="" disabled selected>@邮箱后缀</option>
								{#if domains.length === 0}
									<option disabled>(空)</option>
								{:else}
									{#each domains as item (item.domain)}
										<option value={item.domain}>{item.domain}</option>
									{/each}
								{/if}
							{:catch error}
								<option value="" disabled selected>@邮箱后缀error</option>
								<option disabled>{error}</option>
							{/await}
						</select>
					</label>
					{#if disabled}
						<button
							id="copy-email"
							class="btn btn-info btn-soft btn-sm-md-circle self-stretch sm:self-auto"
							data-clipboard-text={resultEmail}
						>
							<span class="hide-sm-md md:block">复制</span>
							<Icon icon="tabler:copy" width="16" height="16" />
						</button>
					{:else}
						<button
							class="btn btn-success btn-soft sm:btn-circle self-stretch sm:self-auto"
							onclick={confirm}
						>
							<span class="sm:hidden">确定</span>
							<Icon icon="line-md:confirm" width="16" height="16" />
						</button>
						<button
							class="btn btn-error btn-soft sm:btn-circle self-stretch sm:self-auto"
							onclick={() => (disabled = true)}
						>
							<span class="sm:hidden">取消</span>
							<Icon icon="line-md:close" width="16" height="16" />
						</button>
					{/if}
				</div>
				<div class="flex w-full flex-col items-center gap-2 transition-all sm:flex-row md:w-4/5">
					{@render operation()}
				</div>
			</div>
		</section>
		<section class="rounded-xl bg-white p-6 shadow-lg sm:p-8">
			<div class="mb-6 flex items-center justify-between">
				<h2 class="text-xl leading-tight font-bold tracking-tight text-slate-800 sm:text-2xl">
					收件箱
				</h2>
				<button
					class="cursor-pointer rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600"
					onclick={() => getMails()}
				>
					<Icon class={loading ? 'animate-spin' : ''} icon="ooui:reload" width="20" height="20" />
				</button>
			</div>
			<MailList list={emailInfo.mail_list || []} noticeList={noticeMailList} {loading} {onSelect} />
		</section>
	</div>
{/if}
