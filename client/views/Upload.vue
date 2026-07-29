<script setup lang="ts">
import {
	Card,
	CardContent,
	CardFooter
} from '@/components/ui/card';

import {
	FileUpload,
	FileUploadGrid
} from '@/components/ui/file-upload';

import { Button } from '@/components/ui/button'
import CenteredPage from '@/components/CenteredPage.vue'

import { ref } from 'vue';

import { useApiStore } from '@/stores/api';
const apiStore = useApiStore();
apiStore.isPageLoaded = true;


const file = ref<File>();
const onFileChanged = async (files: File[]) => {
	if (!files || files.length === 0)
		return;

	file.value = files[0];
}

const onSubmit = async () => {
	if (file.value != null)
	{
		apiStore.isPageLoaded = false;
		const resp = await apiStore.uploadFile(file.value);

		await navigator.clipboard.writeText(resp.url);
		window.location = resp.url;
	}
}
</script>

<template>
	<CenteredPage>
		<div class="w-full max-w-sm">
			<Card class="w-full max-w-sm">

			<CardContent class="grid gap-4">
				<FileUpload @on-change="onFileChanged">
					<FileUploadGrid />
				</FileUpload>
				</CardContent>
				<CardFooter>
					<Button @click="onSubmit" class="w-full">Upload</Button>
				</CardFooter>
			</Card>
		</div>
	</CenteredPage>
</template>