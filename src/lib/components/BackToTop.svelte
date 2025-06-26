<script lang="ts">
	import Icon, { type IconProps } from '@iconify/svelte';
	import { onMount } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	interface Props {
		/** 可选：按钮样式 */
		class?: ClassValue;
		/** 可选：按钮样式 */
		style?: string;
		/** 可选：滚动元素 不传默认为window */
		scrollElement?: HTMLElement;
		/** 可选：滚动多少距离后显示按钮 默认100 */
		scrollDistance?: number;
		/** 可选：是否只在向上滚动时显示 默认false */
		showOnScrollUp?: boolean;
		/** 可选：图标属性 */
		iconProps?: Partial<IconProps>;
		/** 可选：滚动行为 默认smooth */
		behavior?: 'smooth' | 'instant';
	}
	let {
		style,
		scrollElement,
		scrollDistance = 100,
		showOnScrollUp = false,
		iconProps,
		behavior = 'smooth',
		...otherProps
	}: Props = $props();

	let dasharrayValue = $state(0); // 路径总长度
	let dashoffsetValue = $state(0); // 路径偏移量
	let hidden = $state(true);
	let buttonRef = $state<HTMLButtonElement>();
	let innerHeight = $state(0);

	let currentScroll = 0;
	let previousScroll = 0;
	let isScrolling = false;

	function scrollToTop() {
		const target = scrollElement || document.documentElement;
		target.scrollTo({
			top: 0,
			behavior
		});
	}

	function handleScroll() {
		currentScroll = scrollElement
			? scrollElement.scrollTop
			: window.scrollY || document.documentElement.scrollTop;

		if (!isScrolling) {
			window.requestAnimationFrame(() => {
				// 更新滚动条
				const scrollHeight = scrollElement
					? scrollElement.scrollHeight
					: document.documentElement.scrollHeight;
				const clientHeight = scrollElement ? scrollElement.clientHeight : window.innerHeight;
				const maxScroll = scrollHeight - clientHeight;

				if (maxScroll > 0) {
					const progress = currentScroll / maxScroll;
					dashoffsetValue = dasharrayValue - progress * dasharrayValue;
				}

				// 控制按钮显示/隐藏
				if (currentScroll >= scrollDistance) {
					if (showOnScrollUp) {
						// 只在向上滚动时显示
						hidden = !(previousScroll - currentScroll > 0);
					} else {
						hidden = false;
					}
				} else {
					hidden = true;
				}

				previousScroll = currentScroll;
				isScrolling = false;
			});

			isScrolling = true;
		}
	}

	$effect(() => {
		if (!scrollElement && !hidden && innerHeight) {
			handleScroll();
		}
	});

	onMount(() => {
		if (!buttonRef) return;
		let progressLine: SVGPathElement | null = buttonRef.querySelector('#back-to-top_progress-line');
		if (!progressLine) return;
		const totalLength = progressLine.getTotalLength();
		dasharrayValue = totalLength;
		dashoffsetValue = totalLength;

		// 根据是否有 scrollElement 添加不同的事件监听
		if (scrollElement) {
			scrollElement.addEventListener('scroll', handleScroll);
		} else {
			window.addEventListener('scroll', handleScroll);
		}
		return () => {
			if (scrollElement) {
				scrollElement.removeEventListener('scroll', handleScroll);
			} else {
				window.removeEventListener('scroll', handleScroll);
			}
		};
	});
</script>

<svelte:window bind:innerHeight />

<button
	bind:this={buttonRef}
	class={[
		'group right-[var(--backtotop-btn-position)] bottom-[var(--backtotop-btn-position)] z-10 h-auto w-[var(--backtotop-btn-size)] cursor-pointer rounded-full text-center shadow-[10px_10px_30px_0_rgba(0,0,0,0.12)] transition-all',
		otherProps.class
	]}
	aria-label="返回顶部"
	{style}
	style:opacity={hidden ? 0 : 1}
	style:transform={hidden ? 'translateY(10px)' : 'none'}
	style:pointer-events={hidden ? 'none' : 'auto'}
	style:position={scrollElement ? 'absolute' : 'fixed'}
	onclick={scrollToTop}
	><svg class="overflow-visible" height="100%" viewBox="0 0 100 100" width="100%">
		<path
			class="fill-transparent stroke-[var(--backtotop-border-color)] stroke-[length:var(--backtotop-progress-width)]"
			d="M50,1 a50,50 0 0,1 0,100 a50,50 0 0,1 0,-100"
		></path>
		<path
			id="back-to-top_progress-line"
			class="stroke-linecap-round fill-transparent stroke-[var(--backtotop-light-color)] stroke-[length:calc(var(--backtotop-progress-width)+1px)]"
			d="M50,1 a50,50 0 0,1 0,100 a50,50 0 0,1 0,-100"
			style="stroke-dasharray:{dasharrayValue}; stroke-dashoffset:{dashoffsetValue}"
		></path>
	</svg>
	<span
		class="absolute inset-0 -z-[1] flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-full bg-[var(--backtotop-bg-color-default)] group-hover:bg-[var(--backtotop-bg-color)]"
	>
		<Icon
			class="text-info right group-hover:text-white"
			icon="flowbite:angle-top-solid"
			width="20"
			height="20"
			{...iconProps}
		/>
	</span>
</button>

<style>
	:root {
		/* 按钮大小 */
		--backtotop-btn-size: calc(var(--spacing) * 10);
		/* 按钮距离右下角位置 */
		--backtotop-btn-position: calc(var(--spacing) * 8);
		/* 进度条宽度 */
		--backtotop-progress-width: 5px;
		/** 背景颜色 */
		--backtotop-bg-color: var(--color-info);
		/* 背景颜色 默认状态下 */
		--backtotop-bg-color-default: color-mix(
			in oklab,
			var(--color-info, var(--color-base-content)) 8%,
			var(--color-base-100)
		);
		/* 进度条底色 */
		--backtotop-border-color: var(--color-orange-300);
		/* 进度条颜色 */
		--backtotop-light-color: #9bdf53;
	}
</style>
