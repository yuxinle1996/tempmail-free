<script lang="ts">
	import { flip } from 'svelte/animate';
	import Icon from '@iconify/svelte';
	import type { Attachment } from 'svelte/attachments';
	import type { EmailInfo } from '$lib/types/server';
	import Loading from './Loading.svelte';
	import Empty from './Empty.svelte';
	import { send, receive } from '$lib/transition';

	interface Props {
		/** 邮件列表 */
		list: EmailInfo[];
		/** 通知邮件列表 */
		noticeList?: EmailInfo[];
		/** 是否加载中 */
		loading?: boolean;
		/** 选择邮件 */
		onSelect: (email: EmailInfo) => void;
	}
	let { list, noticeList = [], loading = false, onSelect }: Props = $props();
	let clientWidth = $state(0); // 解决setDataTip不更新问题

	function setDataTip(content: string): Attachment {
		return (node) => {
			const textElement = node.querySelector('.email-text');
			if (clientWidth && textElement && textElement.scrollWidth > textElement.clientWidth) {
				node.setAttribute('data-tip', content);
			} else {
				node.removeAttribute('data-tip');
			}
		};
	}
</script>

<div class="relative flex min-h-20 flex-col">
	<Loading {loading} />
	{#if list.length === 0 && !loading}
		<Empty text="暂无邮件" icon="tabler:mail-off" />
	{/if}
	<ul class="divide-y divide-slate-200" bind:clientWidth>
		{#each list as item (item.id)}
			{@const isNotice = noticeList.some((notice) => notice.id === item.id)}
			<li
				in:receive={{ key: item.id }}
				out:send={{ key: item.id }}
				animate:flip={{ duration: 200 }}
			>
				<button
					class="flex w-full cursor-pointer items-center gap-4 rounded-md px-2 py-4 transition-colors hover:bg-slate-50"
					onclick={() => onSelect(item)}
				>
					<div
						class="flex size-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600"
					>
						<Icon
							icon={isNotice ? 'fluent:mail-alert-32-regular' : 'fluent:mail-32-regular'}
							width="26"
							height="26"
						/>
					</div>
					<div
						class="flex min-w-0 flex-1 flex-col items-start justify-center {isNotice
							? 'font-semibold'
							: ''}"
					>
						<p
							class="tooltip tooltip-top tooltip-info w-full text-left text-base text-slate-700"
							{@attach setDataTip(item.from)}
						>
							<span class="email-text inline-block max-w-full truncate">{item.from}</span>
						</p>
						<p
							class="tooltip tooltip-top tooltip-info w-full text-left text-sm text-slate-500"
							{@attach setDataTip(item.subject)}
						>
							<span class="email-text inline-block max-w-full truncate">{item.subject}</span>
						</p>
					</div>
					<div class="shrink-0 text-right">
						<p class="mb-1 text-xs text-slate-500 {isNotice ? 'font-semibold' : 'font-medium'}">
							<span>{item.created_at}</span>
						</p>
					</div>
				</button>
			</li>
		{/each}
	</ul>
</div>
