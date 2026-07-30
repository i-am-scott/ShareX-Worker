<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
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
const resolvedSrc = ref<string>();

const container = ref<HTMLElement>();
const { width: containerWidth } = useElementSize(container);

const isFullSize = computed(() => naturalWidth.value > 0 && naturalWidth.value <= containerWidth.value);

function isPixelLength(value: string | null)
{
	return !!value && /^\d+(\.\d+)?(px)?$/.test(value.trim());
}

let objectUrl: string | undefined;

async function normalizeSvgSrc(url: string): Promise<string>
{
	try {
		const text = await (await fetch(url)).text();
		const svg = new DOMParser().parseFromString(text, 'image/svg+xml').documentElement;

		if (svg.nodeName !== 'svg' || (isPixelLength(svg.getAttribute('width')) && isPixelLength(svg.getAttribute('height'))))
			return url;

		const viewBox = svg.getAttribute('viewBox')?.trim().split(/\s+/).map(Number);
		if (viewBox?.length !== 4 || !(viewBox[2] > 0) || !(viewBox[3] > 0))
			return url;

		svg.setAttribute('width', String(viewBox[2]));
		svg.setAttribute('height', String(viewBox[3]));

		if (objectUrl)
			URL.revokeObjectURL(objectUrl);

		objectUrl = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }));
		return objectUrl;
	}
	catch {
		return url; // worst case it zooms using the browser's default (small) svg box
	}
}

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

watch(() => share?.fileUrl, async (url) => {
	attempt.value = 0;
	naturalWidth.value = 0;
	resolvedSrc.value = undefined;

	if (!url)
		return;

	resolvedSrc.value = share?.fileExtension === 'svg' ? await normalizeSvgSrc(url) : url;
	tryLoad(resolvedSrc.value);
}, { immediate: true });

onUnmounted(() => {
	if (objectUrl)
		URL.revokeObjectURL(objectUrl);
});
</script>

<template>
	<div ref="container" class="grid place-items-center h-screen">
		<inner-image-zoom
			v-if="resolvedSrc && !isFullSize"
			:key="attempt"
			:src="resolvedSrc"
			moveType="drag"
			:hasSpacer="true"
			:hideHint="true"
			:fadeDuration="0"
		/>

		<img v-else-if="resolvedSrc" :key="attempt" :src="resolvedSrc" style="max-width: 100%; width: auto" @error="tryLoad(resolvedSrc)" />
	</div>

</template>