<script lang="ts" module>
	interface BranchOverviewProps {
		branch: BranchDetailedItem;
	}
</script>

<script lang="ts">
	let { branch }: BranchOverviewProps = $props();
</script>

<section>branch overview...{branch.name}</section>
