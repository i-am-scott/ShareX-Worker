<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useElementSize } from '@vueuse/core';
import InnerImageZoom from 'vue-inner-image-zoom'
import { Share } from '~/share';
import { useApiStore } from '@/stores/api';
const apiStore = useApiStore();

const { share } = defineProps({
	share: Share,
})

apiStore.isPageLoaded = true;

// sometimes images fail to load despite existing, so we'll retry. Is this an r2 propagation issue?
const attempt = ref(0);
const naturalWidth = ref(0);

const container = ref<HTMLElement>();
const { width: containerWidth } = useElementSize(container);

const isFullSize = computed(() => naturalWidth.value > 0 && naturalWidth.value <= containerWidth.value);

function tryLoad(url?: string)
{
	if (!url)
		return;

	const probe = new Image();

	probe.onload = () => {
		naturalWidth.value = probe.naturalWidth;
		attempt.value++; // bust the :key so the real element (re)mounts
	};
	probe.onerror = () => {
		const delay = Math.min(1000 * 2 ** attempt.value, 10000);
		attempt.value++;
		setTimeout(() => tryLoad(url), delay);
	};

	probe.src = url;
}

watch(() => share?.fileUrl, (url) => {
	attempt.value = 0;
	naturalWidth.value = 0;
	tryLoad(url);
}, { immediate: true });
</script>

<template>
	<div ref="container" class="grid place-items-center h-screen">
		<inner-image-zoom
			v-if="share && share.fileExtension != 'svg' && !isFullSize"
			:key="attempt"
			:src="share?.fileUrl"
			moveType="drag"
			:hasSpacer="true"
			:hideHint="true"
			:fadeDuration="0"
		/>

		<!-- this zoomer does not support svgs! -->
		<img v-else :key="attempt" :src="share?.fileUrl" style="max-width: 100%; width: auto" @error="tryLoad(share?.fileUrl)" />
	</div>

</template>