<script setup lang="ts">
import ShareHistory from '@/components/home/ShareHistory.vue';
import ConfigDownloader from '@/components/home/ConfigDownloader.vue'
</script>

<template>
	<div class="flex flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
		<!-- Just plop this here at the top! -->
		<ConfigDownloader/>
		<ShareHistory/>
	</div>
</template>