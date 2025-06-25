<script lang="ts">
	import BackToTop from '$/lib/components/BackToTop.svelte';
	import Meta from '$/lib/components/Meta.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	import '../app.css';
	import { Toaster } from 'svelte-french-toast';

	let { children } = $props();
</script>

<Meta />
<div class="flex h-screen flex-col">
	<Header />
	<main
		class="flex flex-1 justify-center bg-slate-50 px-4 py-8 transition-all sm:px-8 sm:py-12 md:px-20 lg:px-40"
	>
		{@render children()}
	</main>
	<Footer />
</div>
<Toaster position="top-center" containerStyle="top: 50px; bottom: 50px" />
<BackToTop />
