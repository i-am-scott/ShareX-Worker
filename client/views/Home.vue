<script setup lang="ts">
import ShareHistory from '@/components/home/ShareHistory.vue';
import ConfigDownloader from '@/components/home/ConfigDownloader.vue'

import { useApiStore } from '@/stores/api';
const apiStore = useApiStore();
apiStore.isPageLoaded = true;


</script>

<template>
	<div class="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
		<ShareHistory/>
	</div>

	<!-- Just plop this here at the bottom! -->
	<div class="flex min-h-100 flex-col items-center justify-center bg-background md:p-5">
		<ConfigDownloader/>
	</div>
</template>