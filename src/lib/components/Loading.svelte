<script lang="ts">
	interface Props {
		/** 是否加载中 */
		loading: boolean;
	}
	let { loading = false }: Props = $props();
</script>

{#if loading}
	<div class="absolute inset-0 flex items-center justify-center bg-white text-slate-400 opacity-50">
		<span class="loading loading-bars loading-md"></span>
	</div>
{/if}
