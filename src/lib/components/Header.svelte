<script lang="ts">
	import Icon from '@iconify/svelte';
</script>

<header
	class="flex items-center justify-between border-b border-solid border-slate-200 bg-white px-5 py-4 whitespace-nowrap shadow-sm transition-all md:px-10"
>
	<div class="flex items-center gap-1">
		<img class="h-7 w-7 object-cover" src="/logo.png" alt="logo" />
		<h1 class="text-xl leading-tight font-bold tracking-tight text-slate-900">TempMail</h1>
	</div>
	<div class="tooltip tooltip-left tooltip-info">
		<div class="tooltip-content">
			<div class=" text-base-content -rotate-3 animate-bounce">点击前往github主页</div>
		</div>
		<a
			class="hover:text-info text-slate-500 transition-colors duration-300"
			href="https://github.com/yuxinle1996"
			target="_blank"
			rel="noopener noreferrer"
		>
			<Icon icon="line-md:github-loop" width="24" height="24" />
		</a>
	</div>
</header>
