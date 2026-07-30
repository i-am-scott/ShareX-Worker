<script setup lang="ts">
import { computed } from 'vue';
import { Share } from '~/share';
import { FileIconSvg } from '~/fileiconsvg';

const { share } = defineProps({
	share: Share,
})

const iconSvg = computed(() => FileIconSvg.build(share?.fileExtension));
</script>

<template>
	<div class="w-full max-w-sm">
		<div class="icon mx-auto w-32 h-32" v-html="iconSvg"></div>
	</div>
</template>

<style scoped>
.icon :deep(svg) {
	width: 100%;
	height: 100%;
}
</style>
