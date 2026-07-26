<script lang="ts">
	import CarivaAuthBgImg from '$lib/assets/auth/bg.webp';

	let { children } = $props();
</script>

<main
	class="h-screen w-full bg-background bg-cover bg-no-repeat"
	style={`
		background-image: url(${CarivaAuthBgImg});
		background-position: center calc(100% + 320px);
	`}
>
	<section class="auto-grid h-full w-full">
		<div class="h-full overflow-y-auto">
			<div class="flex min-h-full items-center justify-center px-3 py-8">
				<div class="mx-auto w-full max-w-lg">
					{@render children()}
				</div>
			</div>
		</div>
	</section>
</main>
