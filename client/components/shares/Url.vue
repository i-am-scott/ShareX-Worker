<script setup lang="ts">
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import CenteredPage from '@/components/CenteredPage.vue'
import { Link } from 'lucide-vue-next'

import { useApiStore } from '@/stores/api';
import { Share } from '~/share'
const apiStore = useApiStore();

defineProps({
	share: Share,
})

apiStore.isPageLoaded = true;

const openShortUrl = () => window.open(apiStore.activeShare?.url, '_blank')?.focus();
</script>

<template>
	<CenteredPage>
		<div class="w-full max-w-sm">
			<Card class="w-full max-w-sm">
					<CardHeader class="text-center">
						<CardTitle class="text-2xl">URL Share</CardTitle>
						<CardDescription>{{ share?.url }}</CardDescription>
					</CardHeader>
					<CardFooter>
						<Button class="w-full" @click="openShortUrl">
							<Link />
							Open Url
						</Button>
					</CardFooter>
				</Card>
		</div>
	</CenteredPage>
</template>
