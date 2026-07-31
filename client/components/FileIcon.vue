<script setup lang="ts">
import { computed } from 'vue';
import type { Shareable } from '~/share';
import { FileIconSvg } from '~/fileiconsvg';

const props = withDefaults(defineProps<{
	share?: Shareable,
	size?: string
}>(), {
	size: 'w-32 h-32'
})

const iconSvg = computed(() => FileIconSvg.build(props.share?.fileExtension));
</script>

<template>
	<div class="w-full max-w-sm">
		<div class="icon mx-auto" :class="props.size" v-html="iconSvg"></div>
	</div>
</template>

<style scoped>
.icon :deep(svg) {
	width: 100%;
	height: 100%;
}
</style>
