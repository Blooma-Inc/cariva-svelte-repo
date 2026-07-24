<script lang="ts">
	let { children } = $props();
	import CarivaAuthBgImg from '$lib/assets/auth/bg.webp';
</script>

<main class="relative h-screen w-full bg-background">
	<figure class="absolute bottom-0 left-0 w-full">
		<img src={CarivaAuthBgImg} alt="auth background" class="w-full object-bottom" />
	</figure>
	<section class="relative z-10 flex h-full w-full items-center justify-center px-3">
		<div class="mx-auto flex h-fit w-full max-w-lg items-center justify-center">
			{@render children()}
		</div>
	</section>
</main>
