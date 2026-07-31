<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Shareable } from '~/share';
import FileIcon from '@/components/FileIcon.vue';
import { Link } from '@lucide/vue';
import { Helpers } from '~/helpers';

const props = withDefaults(defineProps<{
	share: Shareable,
	size?: string
}>(), {
	size: 'w-10 h-10'
})

const imageFailed = ref(false);

watch(() => props.share.urlSlug, () => imageFailed.value = false);

// the history list endpoint only sends back fileName, not fileExtension
const iconShare = computed<Shareable>(() => ({
	...props.share,
	fileExtension: props.share.fileExtension ?? (props.share.fileName ? Helpers.getFileExtension(props.share.fileName) : undefined),
}));
</script>

<template>
	<div class="flex items-center justify-center shrink-0" :class="props.size">
		<Link v-if="props.share.url" class="w-1/2 h-1/2 text-muted-foreground" />

		<img
			v-else-if="!imageFailed"
			:src="'/' + props.share.urlSlug"
			:alt="props.share.fileName"
			class="w-full h-full object-cover rounded"
			@error="imageFailed = true"
		/>

		<FileIcon v-else :share="iconShare" :size="props.size" />
	</div>
</template>
