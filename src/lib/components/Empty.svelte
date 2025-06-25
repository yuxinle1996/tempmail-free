<script lang="ts">
	import Icon from '@iconify/svelte';
	import type { ClassValue } from 'svelte/elements';

	interface Props {
		text?: string;
		icon?: string;
		iconSize?: number;
		iconClass?: ClassValue;
		iconStyle?: string;
		textClass?: ClassValue;
		textStyle?: string;
	}
	let { text, icon, iconSize = 24, iconClass, iconStyle, textClass, textStyle }: Props = $props();
</script>

<div class="flex flex-1 items-center justify-center gap-1 text-slate-400">
	{#if icon}
		<Icon class={iconClass} {icon} width={iconSize} height={iconSize} style={iconStyle} />
	{/if}
	<p class={textClass} style={textStyle}>
		{text}
	</p>
</div>
