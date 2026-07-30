<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card'

import {
	Alert,
	AlertDescription,
	AlertTitle
} from '@/components/ui/alert'

import { Ban, Copy } from '@lucide/vue'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CenteredPage from '@/components/CenteredPage.vue'

import { ref } from 'vue';
import { useApiStore } from '@/stores/api';
import { Helpers } from '~/helpers'


const apiStore = useApiStore();
apiStore.isPageLoaded = true;

const dialogOpen = ref(false);
const validUrl = ref(true);
const shortUrl = ref();
let url = ''
const onSubmit = async () => {
	validUrl.value = Helpers.isValidUrl(url);

	if (validUrl.value)
	{
		apiStore.isPageLoaded = false;

		const resp = await apiStore.shortenUrl(url);

		await navigator.clipboard.writeText(resp.url);

		shortUrl.value = resp.url;

		dialogOpen.value = true;
		apiStore.isPageLoaded = true;
	}
}
</script>

<template>
	<CenteredPage>
		<Dialog v-model:open="dialogOpen">
			<DialogContent class="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Shortened URL</DialogTitle>
				</DialogHeader>
				<DialogDescription>
					Copy link below.
				</DialogDescription>
				<div class="flex items-center space-x-2">
					<div class="grid flex-1 gap-2">
					<Label for="link" class="sr-only">
						Link
					</Label>
					<Input
						id="link"
						:default-value="shortUrl"
						read-only
					/>
					</div>
					<Button type="submit" size="sm" class="px-3">
					<span class="sr-only">Copy</span>
					<Copy class="w-4 h-4" />
					</Button>
				</div>
				<DialogFooter class="sm:justify-start">
					<Button type="button" variant="secondary" @click="dialogOpen = false">
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>

		<div class="w-full max-w-sm">
			<Alert variant="destructive" v-show="!validUrl">
				<Ban class="h-4 w-4"/>
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>
				Invalid URL. Please try again.
				</AlertDescription>
			</Alert>
		</div>

		<div class="w-full max-w-sm">
			<Card class="w-full max-w-sm">
				<CardHeader class="text-center">
					<CardTitle class="text-2xl">Shorten URL</CardTitle>
					<CardDescription>Enter a URL to shorten.</CardDescription>
				</CardHeader>
				<CardContent class="grid gap-4">
					<Label for="url">URL:</Label>
					<Input v-model="url" id="url" type="url" />
				</CardContent>
				<CardFooter>
					<Button @click="onSubmit" class="w-full">Shorten</Button>
				</CardFooter>
			</Card>
		</div>
	</CenteredPage>
</template>