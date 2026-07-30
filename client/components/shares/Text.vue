<script setup lang="ts">

import { ref, onMounted } from 'vue';
import { Share } from '~/share';

import { MonacoLanguageGuesser } from '@/utils';

import * as monaco from 'monaco-editor/editor/editor.api';
import editorWorker from 'monaco-editor/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/language/typescript/ts.worker?worker';

import { useApiStore } from '@/stores/api';
const apiStore = useApiStore();

const { share } = defineProps({
	share: Share,
})

self.MonacoEnvironment = {
	getWorker(_, label) {
		if (label === 'json') {
			return new jsonWorker();
		}
		if (label === 'css' || label === 'scss' || label === 'less') {
			return new cssWorker();
		}
		if (label === 'html' || label === 'handlebars' || label === 'razor') {
			return new htmlWorker();
		}
		if (label === 'typescript' || label === 'javascript') {
			return new tsWorker();
		}

		return new editorWorker();
	},
};

const editorContainer = ref<null | HTMLElement>(null);

onMounted(async () => {
	const resp = await fetch(new URL(share?.fileUrl as string));
	const text = await resp.text();
	const langGuesser = new MonacoLanguageGuesser(share!, text);

	const editor = monaco.editor.create(editorContainer.value!, {
		theme: 'vs-dark',
		value: text,
		automaticLayout: true
	});

	editor.addAction({
		id: 'file_download',
		label: 'Download Original File',
		contextMenuGroupId: 'navigation',
		keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
 		run: function ()
		{
			apiStore.downloadFile(share?.fileName!, share?.fileUrl!);
		}
	});

	editor.setModel(monaco.editor.createModel(
		text,
		await langGuesser.guess()
	));

	editor.layout();

	apiStore.isPageLoaded = true;
})
</script>

<template>
	<div id="editorContainer" ref="editorContainer"></div>
</template>


<style>
	#editorContainer{
		width: 100%;
		height: 100vh;
		overflow: hidden;
	}
	.monaco-editor {
		position: absolute !important;
	}
</style>