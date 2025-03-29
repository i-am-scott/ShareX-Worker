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
	<div class="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
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
	</div>
</template>