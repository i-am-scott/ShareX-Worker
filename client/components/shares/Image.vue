<script setup lang="ts">
import { ref, watch } from 'vue';
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

function tryLoad(url?: string)
{
	if (!url)
		return;

	const probe = new Image();

	probe.onload = () => attempt.value++; // bust the :key so the real element (re)mounts
	probe.onerror = () => {
		const delay = Math.min(1000 * 2 ** attempt.value, 10000);
		attempt.value++;
		setTimeout(() => tryLoad(url), delay);
	};

	probe.src = url;
}

watch(() => share?.fileUrl, (url) => {
	attempt.value = 0;
	tryLoad(url);
}, { immediate: true });
</script>

<template>
	<div class="grid place-items-center h-screen">
		<!--TODO: don't allow zoom if the image is already full size... -->

		<inner-image-zoom
			v-if="share && share.fileExtension != 'svg'"
			:key="attempt"
			:src="share?.fileUrl"
			moveType="drag"
			:hasSpacer="true"
			:hideHint="true"
			:fadeDuration="0"
		/>

		<!-- this zoomer does not support svgs! -->
		<img v-else :key="attempt" :src="share?.fileUrl" style="max-width: 75%; width: auto" @error="tryLoad(share?.fileUrl)" />
	</div>

</template>